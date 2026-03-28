# Implementation Tasks — Richmond CIP Explorer

**Work Item:** S0001  
**Approach:** Implementation-First  
**Complexity:** Medium  
**Hackathon:** March 27–29, 2026  

---

## Phase 1: Project Scaffolding

**Objective:** Vite + React + TypeScript project running locally with routing, Tailwind, and Leaflet installed.  
**Estimate:** 1.5–2 hours  
**Target:** Day 1 morning  

### Tasks

- [ ] Initialize Vite project: `npm create vite@latest . -- --template react-ts`
- [ ] Install dependencies:
  ```
  npm install leaflet react-leaflet @types/leaflet
  npm install @changey/react-leaflet-markercluster
  npm install tailwindcss @tailwindcss/vite
  npm install papaparse @types/papaparse
  npm install clsx
  ```
- [ ] Configure Tailwind in `vite.config.ts` and add `@import "tailwindcss"` to `src/index.css`
- [ ] Import Leaflet CSS in `src/main.tsx`: `import 'leaflet/dist/leaflet.css'`
- [ ] Fix Leaflet default icon issue (missing marker icons in Vite builds — copy icon files to `public/` or use CDN URLs)
- [ ] Create folder structure:
  ```
  src/
    components/
    data/
    hooks/
    types/
    utils/
  scripts/
  docs/    (existing)
  ```
- [ ] Create `src/types/project.ts` with `CIPProject`, `ProjectCategory`, `ProjectPhase` types
- [ ] Create `src/App.tsx` with a basic `<div>` placeholder to confirm build works
- [ ] Run `npm run dev` — verify app loads at localhost:5173
- [ ] Run `npm run build` — verify build succeeds with no errors
- [ ] Deploy placeholder to Netlify now (drag `dist/` to Netlify UI) to get a shareable URL

**Validation:** `npm run build` succeeds. App loads in browser. Netlify URL accessible.

---

## Phase 2: Data Layer

**Objective:** COR CIP CSV geocoded and available as typed JSON. Plain-language summaries generated.  
**Estimate:** 2–3 hours (mostly waiting for geocoding script)  
**Target:** Day 1 morning/afternoon  

### Tasks

- [ ] Create `scripts/geocode.ts` — Node.js script to:
  - Parse `docs/COR_CIP_Dashboard_projects.csv` with PapaParse
  - For each row, extract primary location: take text before first " to " or first comma
  - Append `, Richmond, VA, USA`
  - Call `https://nominatim.openstreetmap.org/search?q={encoded}&format=json&limit=1`
  - Add 1100ms delay between requests (Nominatim rate limit is 1 req/sec)
  - Store `lat`, `lng` from first result; set `geocodeFallback: true` + city center coords if no result
  - Write output to `src/data/projects.json`
- [ ] Add `"geocode": "npx tsx scripts/geocode.ts"` to `package.json` scripts
- [ ] Install `tsx` and `node-fetch`: `npm install -D tsx node-fetch @types/node`
- [ ] Run geocode script: `npm run geocode` (takes ~2 minutes for 100 projects)
- [ ] Manually review `src/data/projects.json` — fix top 10 highest-priority projects if lat/lng are wrong
- [ ] Create `src/utils/plainLanguage.ts`:
  - `phaseToVerb(phase)` → "planning", "preparing to build", "currently building", "completed improvements to", "evaluating"
  - `generatePlainSummary(project)` → template string combining verb, location, first sentence of description, completion date
  - `formatCost(costStr)` → "$2.1M" from "$2,057,000"
  - `formatCompletion(str)` → "Fall 2031" or "In progress" for TBD
- [ ] Create `src/utils/geo.ts`:
  - `haversineDistance(lat1, lng1, lat2, lng2): number` → distance in miles
  - `RICHMOND_CENTER = { lat: 37.5407, lng: -77.4360 }`
- [ ] Create `src/data/index.ts` that imports `projects.json` and exports typed `CIPProject[]`
- [ ] Add plain-language summaries to each project in the data module (call `generatePlainSummary` at module load)

**Validation:** `import projects from 'src/data'` returns typed array of 100+ projects with valid lat/lng on most entries.

---

## Phase 3: Map Foundation

**Objective:** Leaflet map renders all CIP projects as colored, clustered markers.  
**Estimate:** 2–2.5 hours  
**Target:** Day 1 afternoon/evening  

### Tasks

- [ ] Create `src/components/Map.tsx`:
  - `<MapContainer>` centered on Richmond at zoom 12
  - OSM tile layer: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
  - Accept `projects: CIPProject[]` and `selectedProject: CIPProject | null` as props
- [ ] Create `src/utils/markerColors.ts`:
  - `phaseToColor(phase): string` returning hex colors per phase
  - `createColoredIcon(color: string): L.DivIcon` using a styled `<div>` circle
- [ ] Render `<MarkerClusterGroup>` containing one `<CircleMarker>` per project
- [ ] On marker click: call `onProjectSelect(project)` prop
- [ ] Add "You are here" marker (house icon) when `searchLocation` prop is provided
- [ ] Add map legend (bottom-left corner): phase → color mapping
- [ ] Create `src/components/MapLegend.tsx` — small absolute-positioned card listing phase colors
- [ ] Test with all 100 projects — verify clusters form in downtown area
- [ ] Verify map is full-height in the viewport (CSS: `height: 100vh` or `h-screen`)

**Validation:** Map loads, shows all projects as colored circles, clusters merge at zoom-out, legend visible.

---

## Phase 4: Address Search + Proximity

**Objective:** User types an address, sees a "you are here" pin, and gets a filtered/sorted list of nearby projects.  
**Estimate:** 2.5–3 hours  
**Target:** Day 2 morning  

### Tasks

- [ ] Create `src/components/SearchBar.tsx`:
  - Controlled text input: "Enter your Richmond, VA address..."
  - Submit on Enter or button click
  - Loading spinner during geocode call
  - Error state: "Address not found — try a more specific address"
  - Show 3 sample address links ("Try: 25 W Main St · 2501 Monument Ave · 3215 Hull St")
- [ ] Create `src/hooks/useNominatim.ts`:
  - Takes `query: string`
  - Appends `, Richmond, VA` if not already present
  - Calls `https://nominatim.openstreetmap.org/search?q={encoded}&format=json&limit=1&viewbox=-77.6,-77.3,37.4,37.7&bounded=1`
  - Returns `{ lat, lng, displayName } | null`
  - Handles network errors gracefully
- [ ] Create `src/hooks/useProximity.ts`:
  - Takes `searchLocation: { lat, lng } | null` and `radiusMiles: number`
  - Returns projects filtered to radius, sorted by distance ascending
  - Attaches `distanceFromSearch` to each project
  - If no search location: return all projects (no filter)
- [ ] Add radius slider to search UI (0.25, 0.5, 1, 2, 5 miles — labeled, not continuous)
- [ ] On search: fly map to `[searchLat, searchLng]` at zoom 14, then fit bounds to show nearby projects
- [ ] Show result count: "12 projects within 1 mile of your address"
- [ ] Show "0 projects found" empty state with suggestion to expand radius

**Validation:** Enter "25 W Main St Richmond VA" → You Are Here pin appears → sidebar shows distance-sorted projects → radius slider changes count.

---

## Phase 5: Project Cards + Detail Panel

**Objective:** Sidebar project list and clickable detail panel fully functional.  
**Estimate:** 2.5–3 hours  
**Target:** Day 2 afternoon/evening  

### Tasks

- [ ] Create `src/components/ProjectCard.tsx`:
  - Phase badge (colored, uses `phaseToColor`)
  - Project name (bold, truncated to 2 lines)
  - Category tag (gray pill)
  - Distance badge (e.g. "0.3 mi") — only if search active
  - Plain-language summary (truncated to 2 lines, fade)
  - Completion date ("Expected: Fall 2031" or "Completed")
  - Hover state: subtle background change, cursor pointer
  - Click: calls `onSelect(project)`
- [ ] Create `src/components/ProjectList.tsx`:
  - Scrollable sidebar list of `<ProjectCard>` components
  - "All Projects (103)" or "12 nearby" header
  - Empty state component
  - Highlight selected project card
- [ ] Create `src/components/ProjectDetail.tsx`:
  - Slides in from right on desktop (CSS transition), bottom sheet on mobile
  - Close button (X)
  - Phase badge + project name header
  - **Plain language summary** section (large text, highlighted box)
  - **What this means for you:** bullet points extracted from description
  - Location, cost (formatted), completion date
  - Status update from CSV (italicized, quoted)
  - Project manager: Name, mailto: link, tel: link
  - **Data notice:** small gray text "Source: City of Richmond CIP Dashboard · This is a prototype built for the Richmond Civic Hackathon"
  - **SMS CTA box:**
    ```
    📱 Want updates on this project?
    Text RICHMOND-{id} to (804) 555-0130
    (Prototype feature — not yet active)
    ```
- [ ] Wire up map marker click → `selectedProject` state → `<ProjectDetail>` opens
- [ ] Wire up `<ProjectCard>` click → same `selectedProject` state
- [ ] On project select: fly map to project coordinates at zoom 15

**Validation:** Click any project card → detail panel opens with all fields populated. Click X → closes. Click map pin → same result. SMS CTA visible on every project.

---

## Phase 6: Category Filters + App Shell

**Objective:** Category filter chips work. App header, disclaimer, and overall layout polished.  
**Estimate:** 1.5–2 hours  
**Target:** Day 3 morning  

### Tasks

- [ ] Create `src/components/CategoryFilter.tsx`:
  - Row of pill/chip buttons: "All" + one per category
  - Active chip: filled color. Inactive: outline.
  - Multi-select: clicking a chip toggles it
  - "All" chip: clears all selections (shows everything)
  - Category counts in parentheses: "Road Improvements (24)"
- [ ] Wire category filter into `useProximity` or as a separate filter step on the project list
- [ ] Create `src/components/AppHeader.tsx`:
  - App name: "RVA Infrastructure Explorer"
  - Subtitle: "Find out what's being built in your neighborhood"
  - Hackathon badge: small "Richmond Civic Hackathon 2026" tag
- [ ] Create `src/components/PrototypeBanner.tsx`:
  - Dismissible yellow/amber banner at top
  - "Prototype: Built for the Richmond Civic Hackathon using official City CIP data. Not an official City of Richmond service."
  - Store dismissed state in `localStorage`
- [ ] Implement responsive layout:
  - Desktop: map takes ~60% of viewport, sidebar 40% (flex row)
  - Mobile: map takes top 50vh, sidebar scrolls below (flex col)
  - Use Tailwind breakpoints: `md:flex-row flex-col`
- [ ] Add page `<title>`: "RVA Infrastructure Explorer"
- [ ] Add `<meta name="description">` for shareability
- [ ] Add favicon (use a simple 🗺️ or Richmond city seal if available)

**Validation:** Filter chips change visible projects. Disclaimer shows on first load. Layout works on phone screen.

---

## Phase 7: Polish + Demo Prep

**Objective:** App is demo-ready, deployed, mobile-tested, and pitch is practiced.  
**Estimate:** 2–3 hours  
**Target:** Day 3 afternoon  

### Tasks

- [ ] Run full demo flow manually: open app → type 3 test addresses → click 5 projects → use filter chips → verify no crashes
- [ ] Fix any UI bugs found in manual test
- [ ] Add loading skeleton for project list while geocoding runs (brief but visible)
- [ ] Add `aria-label` attributes to map markers and interactive elements (accessibility)
- [ ] Test on mobile (Chrome DevTools device emulation, then actual phone)
- [ ] Verify all project manager emails are `mailto:` links (click-to-email)
- [ ] Verify all phone numbers are `tel:` links (click-to-call on mobile)
- [ ] Run `npm run build` — fix any TypeScript errors
- [ ] Deploy final build to Netlify: `netlify deploy --prod --dir=dist`
- [ ] Test deployed URL on a phone
- [ ] Write 3 sample addresses on paper/notes app for demo fallback:
  - "25 W Main St, Richmond, VA" → near Shockoe Bottom projects
  - "2501 Monument Ave, Richmond, VA" → near Cary Street projects
  - "3215 Hull St, Richmond, VA" → near Hull Street Improvements
- [ ] Practice demo pitch (opening → demo → close) — target 3 minutes total
- [ ] Prepare one backup slide showing the data source (COR CIP Dashboard) in case of internet issues

**Validation:** App deployed. Works on mobile. 3 test addresses all return results. No TypeScript errors. Pitch timed at ≤3 min.

---

## Quick Reference

### Key Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run geocode      # Run geocoding script (do once)
netlify deploy --prod --dir=dist   # Deploy to Netlify
```

### Pre-Geocoding Script Location
`scripts/geocode.ts` — run before writing any map components

### Test Addresses
| Address | Expected Projects Nearby |
|---|---|
| 25 W Main St, Richmond, VA | Shockoe Bottom BRT, Route 5/Williamsburg Rd |
| 2501 Monument Ave, Richmond, VA | Cary Street Safety, Main Street Curb Extensions |
| 3215 Hull St, Richmond, VA | Hull Street Phase I, Phase II, Phase III |
| 49th St, Richmond, VA | James River Branch Trail, Fall Line Trail |

### Rubric Score Self-Check
Before demo:
- [ ] Judge can input address and see real nearby projects (**Execution 5/5**)
- [ ] Projects show plain-language summaries (**Impact 5/5**)
- [ ] Data is labeled as CIP Dashboard source, prototype banner visible (**Feasibility 5/5**)
- [ ] SMS CTA visible on project detail (**Equity 4/5**)
- [ ] App works on mobile (**Equity + User Value**)
- [ ] No claims of real-time GPS (**Feasibility — avoid losing points**)
