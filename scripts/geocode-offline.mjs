/**
 * Offline geocoder for Richmond CIP projects.
 * Uses a hardcoded lookup table of Richmond streets/landmarks.
 * Run with: node scripts/geocode-offline.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const RICHMOND_CENTER = { lat: 37.5407, lng: -77.4360 };

// ── Richmond street / landmark coordinate lookup ─────────────────────────────
// Each entry: [lat, lng, ...keywords] (case-insensitive substring match)
const LOOKUP = [
  // Streets / corridors
  [37.5329, -77.4355, 'w main st', 'west main', 'w. main', 'main street safety', 'main street'],
  [37.5330, -77.4290, 'e main', 'east main', 'shockoe', 'nicholson'],
  [37.5415, -77.4394, 'broad street', 'broad st', 'biotech', 'kanawha plaza', 'clay street', 'clay st'],
  [37.5498, -77.4620, 'lombardy', 'broad street streetscape'],
  [37.5481, -77.4756, 'monument ave', 'monument avenue'],
  [37.5459, -77.4490, 'cary street', 'cary st'],
  [37.5458, -77.4400, 'leigh street', 'leigh st'],
  [37.5520, -77.4750, 'floyd avenue', 'floyd ave', 'u street', 'westhampton area'],
  [37.5425, -77.4415, 'marshall street', 'e. marshall', 'oliver hill'],
  [37.5360, -77.4080, 'williamsburg avenue', 'williamsburg ave', 'williamsburg road', 'williamsburg rd', 'e. richmond rd', 'route 5'],
  [37.5280, -77.4210, 'jefferson avenue', 'jefferson ave'],
  [37.5260, -77.4430, 'maury street', 'maury st', 'hull street streetscape', 'hull street - mayo', 'mayo bridge'],
  [37.5540, -77.4700, 'arthur ashe', 'scott\'s addition'],
  [37.5890, -77.4630, 'pine camp', 'bryan park', 'fall line trail - bryan'],
  [37.5900, -77.4640, 'fall line trail - bryan park'],
  [37.5600, -77.4640, 'diamond area', 'n. barton heights', 'barton heights'],
  [37.5580, -77.4130, 'creighton court', 'creighton'],
  [37.5440, -77.4120, 'whitcomb court', 'whitcomb', 'carnation street', 'carnation st'],
  [37.5460, -77.4128, 'n. 31st', '31st street', 'n. 28th', '28th street'],
  [37.5360, -77.4335, 'n. 11th', '11th street'],
  [37.5330, -77.4277, '18th street', 'e. 18th'],
  [37.5390, -77.4325, '8th street'],
  [37.5350, -77.4200, 'church hill', 'chimborazo park', 'chimborazo'],
  [37.5290, -77.4100, 'gillies creek'],
  [37.5190, -77.4300, 'ancarrow', 'deepwater terminal'],
  [37.5040, -77.4300, 'deepwater terminal road'],
  [37.5280, -77.4610, 'tredegar', 'brown\'s island', 'browns island', 'virginia capital trail'],
  [37.5270, -77.4800, 'james river park', 'james river branch trail'],
  [37.5210, -77.4440, 'manchester', 'mayo island'],
  [37.5390, -77.4900, 'byrd park', 'byrd park reservoir'],
  [37.5328, -77.4886, 'maymont'],
  [37.5720, -77.5100, 'westhampton'],
  [37.5740, -77.4880, 'government road'],
  [37.5700, -77.5200, 'river road'],
  [37.5310, -77.4900, 'riverside drive', 'riverside dr'],
  [37.5560, -77.4800, 'westmoreland place', 'westmoreland'],
  [37.5610, -77.4770, 'scott\'s addition green'],
  [37.5290, -77.4370, 'highland grove', 'dove street', 'shockoe project', 'shockoe valley'],
  [37.5295, -77.4337, 'biotech'],
  [37.5330, -77.4280, 'shockoe bottom', '17th street', '30th street'],
  // South / Southside
  [37.5100, -77.4500, 'hull street improvements phase i', 'hey road to warwick', 'hey road'],
  [37.4900, -77.5100, 'hull street improvements phase ii', 'chippenham', 'hey road', 'hull street improvements phase iii', 'warwick road to arizona'],
  [37.5050, -77.4560, 'hull street', 'hull st', 'hull street (cowardin', 'hull street (richmond to commerce'],
  [37.5040, -77.4620, 'semmes avenue', 'semmes ave', 'forest hill avenue', 'forest hill ave', 'dundee avenue'],
  [37.5050, -77.4730, 'swansboro', 's. thompson', 'southside community center'],
  [37.5150, -77.5100, 'cherokee road', 'cherokee rd'],
  [37.4980, -77.5000, 'jahnke road', 'jahnke rd'],
  [37.4800, -77.4850, 'richmond highway', 'route 1', 'richmond hwy'],
  [37.4960, -77.4480, 'commerce road', 'commerce rd'],
  [37.4810, -77.4820, 'e. broad rock', 'broad rock'],
  [37.5080, -77.4880, 'e. clopton', 'clopton'],
  [37.4780, -77.5040, 'bellemeade road', 'bellemeade rd', 'fall line trail - walmsley'],
  [37.5020, -77.5000, 'berrington court', 'berrington'],
  [37.4800, -77.4960, 'pineway drive', 'pineway dr'],
  [37.4870, -77.5160, 'warwick area', 'warwick'],
  [37.4970, -77.4680, 'belt blvd', 'belt boulevard'],
  [37.4950, -77.4750, 'south gardens', 'swansboro area'],
  [37.5090, -77.4500, 'jeff-davis', 'jefferson davis'],
  // Parks / facilities
  [37.5050, -77.4640, 'lucks field', 'james river branch'],
  [37.5390, -77.5000, 'westlake hills'],
  [37.5660, -77.4960, 'westlake'],
  [37.5040, -77.4620, 'broad rock sports complex', 'broad rock park', 'parks improvement - broad rock'],
  [37.5690, -77.4770, 'pine camp', 'northside'],
  [37.5050, -77.4640, 'fonticello park', 'fonticello'],
  [37.5500, -77.5000, 'humphrey calder', 'smith peters'],
  [37.5270, -77.5010, 'westover hills', 'westover hills community'],
  // Bridges
  [37.5498, -77.4620, 'lombardy street csx bridge'],
  [37.5220, -77.4380, 'mayo bridge', 'hull street over manchester canal'],
  [37.5540, -77.4700, 'arthur ashe boulevard bridge'],
  [37.5090, -77.4740, 'lynhaven avenue over broad rock creek'],
  [37.5390, -77.4275, 'east broad street ravine bridge'],
  // Trails / greenways
  [37.5100, -77.4300, 'fall line trail - commerce road'],
  [37.5200, -77.4450, 'fall line trail - transit improvements over manchester'],
  [37.5400, -77.4600, 'science museum brt'],
  [37.5320, -77.4600, 'capital trail', 'virginia capital trail connector'],
  [37.5170, -77.4650, 'james river branch trail'],
  // Sewers / utilities
  [37.5360, -77.4080, 'williamsburg avenue combined sewer', 'combined sewer overflow'],
  [37.5310, -77.4150, 'chimborazo drop shaft', 'chimborazo interceptor'],
  // Neighborhoods / areas
  [37.5610, -77.4770, 'colonial place'],
  [37.5640, -77.4800, 'westhampton area'],
  [37.5440, -77.4166, 'chimborazo area'],
  [37.5890, -77.4630, 'north richmond', 'n. richmond'],
  [37.5060, -77.4640, 'jeff-davis neighborhood'],
  [37.5290, -77.4370, 'highland grove'],
  [37.5350, -77.4180, 'e. richmond'],
  // Misc
  [37.5330, -77.4350, 'mcguire', 'chapel drive'],
];

// ── Helpers ─────────────────────────────────────────────────────────────────
function matchLookup(text) {
  const lower = text.toLowerCase();
  for (const [lat, lng, ...keywords] of LOOKUP) {
    if (keywords.some(kw => lower.includes(kw))) {
      return { lat, lng };
    }
  }
  return null;
}

function jitter(val, range = 0.003) {
  return val + (Math.random() - 0.5) * range;
}

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

function normalisePhase(raw) {
  const r = (raw || '').toLowerCase();
  if (r.includes('complet')) return 'Complete';
  if (r.includes('construction')) return 'Construction';
  if (r.includes('design') || r.includes('planning')) return 'Design';
  if (r.includes('pre-construction') || r.includes('pre construction') || r.includes('preconstruction')) return 'Planning';
  if (r.includes('hold') || r.includes('tbd') || r === '') return 'On Hold';
  return 'Planning';
}

function parseCost(raw) {
  if (!raw) return 0;
  const n = parseFloat(raw.replace(/[$,\s]/g, ''));
  return isNaN(n) ? 0 : n;
}

function phaseToVerb(phase) {
  switch (phase) {
    case 'Planning':     return 'being planned';
    case 'Design':       return 'in design';
    case 'Construction': return 'under construction';
    case 'Complete':     return 'complete';
    case 'On Hold':      return 'on hold';
    default:             return 'in progress';
  }
}
function formatCost(amount) {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000)     return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}
function plainSummary(phase, category, budget, completion) {
  const verb = phaseToVerb(phase);
  const cost = formatCost(budget);
  const comp = completion && !['Unknown', 'TBD', 'N/A', ''].includes(completion)
    ? `, expected to wrap up ${completion}` : '';
  return `This ${category.toLowerCase()} project is currently ${verb} with a total budget of ${cost}${comp}.`;
}

// ── Main ─────────────────────────────────────────────────────────────────────
const csvPath = path.join(ROOT, 'docs', 'COR_CIP_Dashboard_projects.csv');
const outPath = path.join(ROOT, 'src', 'data', 'projects.json');

const csv = fs.readFileSync(csvPath, 'utf8');
const rows = parseCSV(csv);

console.log(`Processing ${rows.length} projects (offline)…`);

let matched = 0;
let fallbacks = 0;

const projects = rows.map((row, i) => {
  const id = `CIP-${row['OBJECTID'] || i + 1}`;
  const name = row['Name'] || 'Unknown Project';
  const location = row['Location'] || '';
  const category = normaliseCategory(row['Category']);
  const phase = normalisePhase(row['Phase']);
  const budget = parseCost(row['Cost']);
  const completion = (row['Completion'] || 'TBD').trim() || 'TBD';

  // Try matching name first, then location
  const hit = matchLookup(name) || matchLookup(location);

  let lat, lng, geocodeFallback;
  if (hit) {
    lat = jitter(hit.lat);
    lng = jitter(hit.lng);
    geocodeFallback = false;
    matched++;
    console.log(`  ✓ [${i + 1}/${rows.length}] ${id}: matched`);
  } else {
    lat = jitter(RICHMOND_CENTER.lat, 0.01);
    lng = jitter(RICHMOND_CENTER.lng, 0.01);
    geocodeFallback = true;
    fallbacks++;
    console.log(`  ⚠ [${i + 1}/${rows.length}] ${id}: fallback → ${name.substring(0, 40)}`);
  }

  return {
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
    geocodeFallback,
    plainSummary: plainSummary(phase, category, budget, completion),
    manager: (row['Manager'] || '').trim() || undefined,
    email: (row['Email'] || '').trim() || undefined,
    phone: (row['Contact'] || '').trim() || undefined,
  };
});

fs.mkdirSync(path.join(ROOT, 'src', 'data'), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(projects, null, 2));

console.log(`\nDone! ${projects.length} projects written.`);
console.log(`Matched: ${matched}/${projects.length} (${Math.round(matched/projects.length*100)}%)`);
console.log(`Fallback: ${fallbacks}/${projects.length}`);
