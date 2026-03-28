/**
 * One-time geocoding script. Run with:
 *   node --experimental-vm-modules scripts/geocode.mjs
 * or after npm install:
 *   node scripts/geocode.mjs
 *
 * Reads docs/COR_CIP_Dashboard_projects.csv
 * Writes src/data/projects.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const RICHMOND_CENTER = { lat: 37.5407, lng: -77.4360 };
const DELAY_MS = 1200; // Nominatim: max 1 req/sec

// ── CSV parser (handles quoted fields with commas) ──────────────────────────
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = splitCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const values = splitCSVLine(line);
    return Object.fromEntries(headers.map((h, i) => [h.trim(), (values[i] ?? '').trim()]));
  });
}

function splitCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuote = !inQuote;
    } else if (ch === ',' && !inQuote) {
      result.push(cur); cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

// ── Category normaliser ─────────────────────────────────────────────────────
function normaliseCategory(raw) {
  const r = (raw || '').toLowerCase();
  if (r.includes('pedestrian') || r.includes('bike') || r.includes('trail')) return 'Roads & Bridges';
  if (r.includes('road') || r.includes('bridge') || r.includes('street')) return 'Roads & Bridges';
  if (r.includes('stormwater') || r.includes('sewer') || r.includes('water')) return 'Utilities';
  if (r.includes('park') || r.includes('recreation')) return 'Parks & Recreation';
  if (r.includes('fire') || r.includes('police') || r.includes('safety')) return 'Public Safety';
  if (r.includes('school')) return 'Schools';
  if (r.includes('facilit') || r.includes('community center') || r.includes('center')) return 'Facilities';
  if (r.includes('art')) return 'Facilities';
  return 'Other';
}

// ── Phase normaliser ────────────────────────────────────────────────────────
function normalisePhase(raw) {
  const r = (raw || '').toLowerCase();
  if (r.includes('complet')) return 'Complete';
  if (r.includes('construction')) return 'Construction';
  if (r.includes('design') || r.includes('planning')) return 'Design';
  if (r.includes('pre-construction') || r.includes('pre construction') || r.includes('preconstruction')) return 'Planning';
  if (r.includes('hold') || r.includes('tbd') || r === '') return 'On Hold';
  return 'Planning';
}

// ── Cost parser ─────────────────────────────────────────────────────────────
function parseCost(raw) {
  if (!raw) return 0;
  const n = parseFloat(raw.replace(/[$,\s]/g, ''));
  return isNaN(n) ? 0 : n;
}

// ── Plain summary ───────────────────────────────────────────────────────────
function phaseToVerb(phase) {
  switch (phase) {
    case 'Planning':    return 'being planned';
    case 'Design':      return 'in design';
    case 'Construction': return 'under construction';
    case 'Complete':    return 'complete';
    case 'On Hold':     return 'on hold';
    default:            return 'in progress';
  }
}
function formatCost(amount) {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000)     return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}
function plainSummary(title, phase, category, budget, completion) {
  const verb = phaseToVerb(phase);
  const cost = formatCost(budget);
  const comp = completion && completion !== 'Unknown' && completion !== 'TBD' && completion !== 'N/A'
    ? `, expected to wrap up ${completion}` : '';
  return `This ${category.toLowerCase()} project is currently ${verb} with a total budget of ${cost}${comp}.`;
}

// ── Build geocoding query ───────────────────────────────────────────────────
function buildQuery(location, name) {
  // Pull first meaningful street/address fragment
  let loc = location
    .replace(/\bto\b.*/i, '')          // take only up to "to"
    .replace(/\bfrom\b.*/i, '')        // or "from"
    .replace(/\bbetween\b.*/i, '')     // or "between"
    .replace(/\(.*?\)/g, '')           // strip parentheticals
    .replace(/@/g, '&')               // @ → & (intersection notation)
    .replace(/[,;]+.*/, '')            // take first segment before comma
    .trim();

  // If loc is very vague, fall back to project name keywords
  if (loc.length < 6 || /various|area|neighborhood/i.test(loc)) {
    loc = name.replace(/Phase \w+/gi, '').replace(/[-–]/g, ' ').trim();
  }

  return encodeURIComponent(`${loc}, Richmond, Virginia, USA`);
}

// ── Nominatim fetch ─────────────────────────────────────────────────────────
async function geocode(location, name) {
  const q = buildQuery(location, name);
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${q}&countrycodes=us`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'RichmondCIPExplorer/1.0 (hackathon project)' },
    });
    const data = await res.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), fallback: false };
    }
  } catch (e) {
    console.warn(`  fetch error for "${name}": ${e.message}`);
  }
  return { lat: RICHMOND_CENTER.lat, lng: RICHMOND_CENTER.lng, fallback: true };
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const csvPath = path.join(ROOT, 'docs', 'COR_CIP_Dashboard_projects.csv');
  const outPath = path.join(ROOT, 'src', 'data', 'projects.json');

  const csv = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(csv);

  console.log(`Processing ${rows.length} projects…`);

  const projects = [];
  let fallbacks = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const id = `CIP-${row['OBJECTID'] || i + 1}`;
    const name = row['Name'] || 'Unknown Project';
    const location = row['Location'] || '';
    const category = normaliseCategory(row['Category']);
    const phase = normalisePhase(row['Phase']);
    const budget = parseCost(row['Cost']);
    const completion = (row['Completion'] || 'TBD').trim() || 'TBD';

    console.log(`[${i + 1}/${rows.length}] ${id}: ${name.substring(0, 50)}…`);

    const { lat, lng, fallback } = await geocode(location, name);
    if (fallback) { fallbacks++; console.log(`  ⚠ fallback to Richmond center`); }
    else           { console.log(`  ✓ ${lat.toFixed(4)}, ${lng.toFixed(4)}`); }

    projects.push({
      id,
      title: name,
      description: row['Description'] || '',
      location,
      category,
      phase,
      totalBudget: budget,
      spentToDate: 0,
      estimatedCompletion: completion,
      lat,
      lng,
      geocodeFallback: fallback,
      plainSummary: plainSummary(name, phase, category, budget, completion),
      manager: (row['Manager'] || '').trim() || undefined,
      email: (row['Email'] || '').trim() || undefined,
      phone: (row['Contact'] || '').trim() || undefined,
    });

    if (i < rows.length - 1) await sleep(DELAY_MS);
  }

  fs.mkdirSync(path.join(ROOT, 'src', 'data'), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(projects, null, 2));

  console.log(`\nDone! ${projects.length} projects written to src/data/projects.json`);
  console.log(`Geocoding fallbacks: ${fallbacks}/${projects.length}`);
}

main().catch(e => { console.error(e); process.exit(1); });
