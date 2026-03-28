# Richmond CIP Explorer — Strategic Plan

**Work Item:** S0001  
**Event:** Richmond Civic Hackathon · March 27–29, 2026 · VCU Snead Hall  
**Pillar:** 6 — A Thriving and Sustainable Built Environment  
**Problem:** 1 — Transportation Project Visibility & Discoverability  
**Complexity:** Medium  
**Approach:** Implementation-First  
**Branch:** main  

---

## Executive Summary

Richmond CIP Explorer is a web application that lets any resident type their street address and immediately see every City infrastructure project happening nearby — explained in plain English. Judges and residents get a working interactive demo backed by real data from the City of Richmond's CIP Dashboard.

The app turns the existing COR CIP Dashboard CSV (100+ verified projects) into a searchable, map-based experience that DPW could point residents to without any additional integrations, accounts, or infrastructure.

**Core user flow:**
> A Church Hill resident notices construction on their block → opens the app → types their address → sees a "Riverfront BRT Streetscape" project pin 0.3 miles away → reads a plain-language card explaining what the project is, when it ends, and who to call → sees "Text RICHMOND-2 to (804) 555-0130 for updates" as a future notification pathway.

---

## Rubric Strategy

Scoring formula: `Σ (score 1–5 × weight)` · Max 105 · Tiebreaker: User Value

| Category | Weight | Target Score | Target Points | Strategy |
|---|---|---|---|---|
| Impact | 5 | 5/5 | 25 | Address → nearby projects in ≤3 seconds. Real CIP data. Works for the Church Hill judge prompt exactly. |
| User Value | 4 | 5/5 | 20 | Resident persona front and center. Framing: "You just saw construction cones. Here's what's happening." |
| Feasibility | 3 | 5/5 | 15 | Uses real COR CIP data. Deployable today. No DPW internal integration. Clearly labeled prototype. |
| Innovation | 3 | 4/5 | 12 | Address geocoding proximity search + SMS CTA. Not a plain ArcGIS embed. |
| Execution | 3 | 5/5 | 15 | Live demo: judge inputs address, sees project list and map. No slides. |
| Equity & Inclusion | 3 | 4/5 | 12 | SMS CTA on every card, mobile-responsive, plain language, high-contrast badge colors. |
| **Total** | | | **99/105** | |

### What to Say to Judges

> "This prototype is built entirely on the City's verified CIP Dashboard data. Any resident can use it today — no account, no app store, no smartphone required via the SMS pathway. DPW could share this URL directly."

### What to Avoid Saying

- Do not claim real-time updates or live GPS tracking
- Do not claim official City endorsement
- Always say "prototype" or "proof of concept" — the rubric rewards this framing

---

## User Personas

### Primary: The Confused Resident
- Sees orange construction cones on their block
- Has a smartphone and can open a URL
- Cannot find information on the City's ArcGIS maps (too technical)
- Needs: address search → plain-language project info in under 30 seconds

### Secondary: The Equity User
- Does not have reliable internet access or a smartphone
- Can send an SMS
- Needs: SMS CTA pathway shown in the app (prototype — no Twilio required for demo)

### Tertiary: The Judge
- Wants to validate the demo works
- Will type a Richmond address and expect to see real project data
- Checks: is the data labeled as real? Is it clearly a prototype? Can they actually find a project?

---

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│              React + TypeScript              │
│                 (Vite build)                 │
├──────────────────┬──────────────────────────┤
│   Map Layer      │   Search + Results Layer  │
│   react-leaflet  │   Nominatim geocoder      │
│   Leaflet.js     │   Haversine proximity     │
│   Marker clusters│   Project cards sidebar   │
├──────────────────┴──────────────────────────┤
│              Data Layer                      │
│   src/data/projects.json                     │
│   (pre-geocoded from COR CIP CSV)            │
│   + papaparse (CSV fallback)                 │
├─────────────────────────────────────────────┤
│              Static Build                    │
│   GitHub Pages or Netlify (free)             │
│   No backend required                        │
└─────────────────────────────────────────────┘
```

**Key architectural decision: pre-geocoded JSON**

The COR CIP CSV has text-based Location fields (e.g., "E Main Street @ Nicholson Street to E Main @ Orleans Street..."). These must be converted to lat/lng coordinates before the app runs. A one-time Node.js geocoding script (`scripts/geocode.js`) runs during development, calls Nominatim with each project's primary location, and outputs `src/data/projects.json`. The app bundles this JSON — no runtime API calls for data, no API keys needed.

---

## Technology Stack

| Layer | Technology | Reason |
|---|---|---|
| Framework | React 18 + TypeScript | Fast to scaffold, type safety on CSV fields |
| Build tool | Vite | Sub-second HMR, simple static build |
| Styling | Tailwind CSS | Utility classes = fast UI iteration |
| Map | Leaflet.js + react-leaflet | Free, no API key, OSM tiles |
| Map clusters | @changey/react-leaflet-markercluster | Handles 100+ pins cleanly |
| Address search | Nominatim (OpenStreetMap) | Free, no API key, "Richmond VA" bias |
| Proximity | Haversine formula (inline) | No library needed |
| CSV parsing | PapaParse | If CSV is loaded directly at runtime |
| Data | `src/data/projects.json` | Pre-geocoded CIP data |
| Geocoding script | Node.js + node-fetch | One-time dev script |
| Deployment | Vite static build → Netlify/GH Pages | Free, instant, shareable URL |

---

## Data Layer

### Source Data

`docs/COR_CIP_Dashboard_projects.csv` — 100+ real City of Richmond CIP projects.

**Key fields used:**

| Field | Use |
|---|---|
| OBJECTID | Unique project key, SMS CTA reference |
| Name | Project title on card |
| Category | Color-coded badge (Road, Pedestrian & Bike, etc.) |
| Cost | Displayed on detail view |
| Description | Source for plain-language summary |
| Location | Input to geocoder |
| Manager | Contact info |
| Email | Contact info |
| Phase | Progress indicator |
| Status | Current status narrative |
| Contact | Phone number |
| Completion | Expected end date |

### Pre-Geocoding Script (`scripts/geocode.ts`)

1. Parse CSV with PapaParse
2. For each project, extract primary location (text before first comma or "to")
3. Append ", Richmond, VA, USA"
4. Call `https://nominatim.openstreetmap.org/search?q={location}&format=json&limit=1`
5. Respect Nominatim rate limit: 1 request/second
6. Store `{ lat, lng }` on each project object
7. Fall back to Richmond city center (37.5407, -77.4360) if geocoding fails
8. Write `src/data/projects.json`

**Expected geocoding success rate:** ~75–85% (some locations are too complex for Nominatim). Failures fall back to city center and are marked with `geocodeFallback: true` — filtered out of proximity results but still visible on map.

### TypeScript Project Model

```typescript
interface CIPProject {
  id: number;                    // OBJECTID
  name: string;                  // Name
  category: ProjectCategory;     // Category (enum)
  cost: string;                  // Cost (raw string, e.g. "$2,057,000")
  description: string;           // Description
  location: string;              // Location (text)
  manager: string;               // Manager
  email: string;                 // Email
  phone: string;                 // Contact
  phase: ProjectPhase;           // Phase (enum)
  status: string;                // Status narrative
  completion: string;            // Completion date string
  lat: number;                   // Geocoded latitude
  lng: number;                   // Geocoded longitude
  geocodeFallback: boolean;      // True if coordinates are approximate
  plainLanguageSummary: string;  // Generated plain-language description
  distanceFromSearch?: number;   // Calculated at search time (miles)
}

type ProjectCategory =
  | 'Road Improvements'
  | 'Pedestrian and Bike'
  | 'Stormwater'
  | 'Sewer'
  | 'Bridge Repair'
  | 'New Facility Construction'
  | 'Parks & Recreation'
  | 'Public Art'
  | 'Water'
  | 'Facility Maintenance';

type ProjectPhase =
  | 'Planning/Design'
  | 'Pre-Construction'
  | 'Construction'
  | 'Completed'
  | 'TBD';
```

### Plain Language Summary Generator

Transform technical descriptions into resident-friendly text using a template function:

```typescript
function generatePlainSummary(project: RawProject): string {
  const verb = phaseToVerb(project.phase); // "planning", "preparing to build", "currently building", "completed"
  const shortDesc = extractShortDesc(project.description); // First sentence, ≤120 chars
  const when = project.completion === 'TBD' ? 'timeline TBD' : `expected ${project.completion}`;
  return `The City is ${verb} improvements to ${project.location.split(',')[0].trim()}. ${shortDesc} (${when})`;
}
```

---

## Feature Specifications

### Feature 1: Interactive Project Map

- Leaflet map centered on Richmond, VA (37.5407, -77.4360), zoom 12
- All pre-geocoded CIP projects shown as colored circle markers
- Marker color by `phase`:
  - `Planning/Design` → Blue (#3B82F6)
  - `Pre-Construction` → Amber (#F59E0B)
  - `Construction` → Red (#EF4444)
  - `Completed` → Green (#10B981)
  - `TBD` → Gray (#6B7280)
- Marker clusters for dense areas (downtown)
- OSM tile layer (no API key)
- Clicking a marker opens the project detail panel

### Feature 2: Address Search + Proximity

- Search bar: "Enter your Richmond, VA address..."
- On submit: call Nominatim geocoder with `viewbox` biased to Richmond bounding box
- Drop a "You are here" pin (house icon) at result
- Calculate Haversine distance from search point to each project
- Default radius: 1 mile (slider: 0.25 → 5 miles)
- Filter sidebar list to projects within radius
- Sort by distance (nearest first)
- Show distance on each card: "0.3 mi away"
- Animate map to fit search location + nearby projects

### Feature 3: Project Sidebar List

- Responsive sidebar (collapses to bottom sheet on mobile)
- Each card shows:
  - Phase badge (color-coded)
  - Project name
  - Distance from search point (if active)
  - Category tag
  - Plain-language summary (2 lines truncated)
  - Completion date
- Click card → highlight on map + open detail panel
- "No nearby projects" empty state with suggestion to expand radius

### Feature 4: Project Detail Panel

Slides in from right (desktop) or bottom (mobile). Contains:

- **Header:** Project name + phase badge
- **Plain language summary** (full text, highlighted)
- **What this means for you:** 1–2 bullet points derived from description
- **Location:** Text from CSV
- **Estimated cost:** Formatted currency
- **Status update:** Current status narrative from CSV
- **Expected completion:** Formatted date
- **Project manager:** Name, email, phone (clickable)
- **Category badge**
- **Prototype data notice:** "This information is from the City of Richmond's CIP Dashboard. For the most current status, visit rva.gov."
- **SMS CTA:**
  ```
  📱 Want project updates?
  Text RICHMOND-{id} to (804) 555-0130
  [Prototype feature — not yet active]
  ```

### Feature 5: Category Filter

- Filter chips above map: All | Road | Pedestrian & Bike | Stormwater | Bridge | Parks | ...
- Multi-select: clicking a chip toggles it on/off
- Map and list update instantly (client-side filter)

### Feature 6: App Header + Branding

- App name: "RVA Infrastructure Explorer"
- Subtitle: "Find out what's being built in your neighborhood"
- Disclaimer banner (dismissible): "Prototype built for the Richmond Civic Hackathon using City CIP data. Not an official City of Richmond service."
- GitHub link (shows we built this, adds credibility)

---

## Implementation Phases (3-Day Hackathon Timeline)

### Day 1 (March 27)

**Morning — Phase 1:** Project scaffolding and data layer  
**Afternoon — Phase 2:** Geocoding script + data pipeline  
**Evening — Phase 3:** Base map working with all pins  

### Day 2 (March 28)

**Morning/Afternoon — Phase 4:** Address search, proximity, sidebar  
**Evening — Phase 5:** Project cards, detail panel, filters  

### Day 3 (March 29)

**Morning — Phase 6:** Polish, equity features, mobile responsiveness  
**Afternoon — Phase 7:** Demo prep, deployment, practice pitch  

---

## Risk Assessment & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Nominatim geocoding fails for many projects | Medium | High | Pre-geocode during dev with manual corrections for key projects. Use Richmond city center as fallback. |
| Nominatim rate limit during development | High | Low | Add 1s delay between requests in script. Run once, commit results. |
| Map doesn't load (tile server) | Low | High | OSM tiles are very reliable. Add error state. Have screenshot backup for demo. |
| Complex Location strings fail geocoding | High | Medium | Extract only first segment of Location text. Pre-verify top 20 projects manually. |
| App not deployed in time | Low | High | Deploy to Netlify on Day 1 with placeholder. Update incrementally. |
| Judge uses non-Richmond address | Low | Medium | Show "No projects found near this address. Try a Richmond address." + suggest 3 sample addresses. |

---

## Demo Script (for judges)

**Opening (30 seconds):**
> "A Church Hill resident just noticed construction on their block. They have no idea what it is or when it ends. DPW has the data — it's on their CIP Dashboard — but it's not findable. We made it findable."

**Demo (2 minutes):**
1. Show app homepage with map of Richmond and project pins
2. Type "25 W Main St, Richmond, VA" in the search bar
3. Show project pins highlighting nearby, sidebar populating with distance-sorted list
4. Click the nearest project → detail panel opens
5. Point out: real CIP data, plain language summary, expected completion, project manager contact
6. Point out: SMS CTA prototype (explain how this would work with Twilio)
7. Expand radius slider to 5 miles — show more projects appear

**Close (30 seconds):**
> "No DPW system integration needed. No account required. The data's already public — we just made it searchable. DPW could share this URL tomorrow."

---

## Deployment

**Target URL:** `https://streetlights001.netlify.app` (or GitHub Pages)

**Deploy command:**
```bash
npm run build
# Drag dist/ to Netlify, or:
netlify deploy --prod --dir=dist
```

**Pre-demo checklist:**
- [ ] App loads at deployed URL
- [ ] Test with "2501 Monument Ave, Richmond, VA"
- [ ] Test with "25 W Main St, Richmond, VA"
- [ ] Test with "Hull Street, Richmond, VA"
- [ ] Confirm no console errors
- [ ] Confirm mobile layout on phone
- [ ] Have 3 sample addresses ready on paper as fallback

---

## Appendix: Rubric Alignment Table

| Rubric Requirement | How We Address It |
|---|---|
| "Could a Church Hill resident find what the project is and when it ends?" | Yes — address search + detail panel with completion date |
| "Built from verified GeoHub data" | COR CIP Dashboard CSV (official City data source) |
| "Not claiming real-time GPS" | Nowhere in app; project data is from CSV |
| "Not presenting exploratory data as official" | Dismissible prototype banner, data notice on every card |
| "Reaches residents without smartphones" | SMS CTA prototype shown prominently |
| "Plain-language descriptions" | Auto-generated summary on every project card |
| "Working demo, judge can interact" | Fully deployed static app, address search works |
