# StreetLights

**Richmond Civic Hackathon · March 2026 · Pillar 6 — Transportation Project Visibility**

> *A Church Hill resident notices orange construction cones on their block. They open StreetLights, type their address, and within seconds learn the project name, what it means for their daily commute, how much of the budget has been spent, and when it is expected to finish. No phone call to the city. No digging through ArcGIS layers.*

**Live demo:** https://ang-aq.github.io/Streetlights/

---

## The problem

Richmond DPW manages dozens of active infrastructure projects — road improvements, utility upgrades, school repairs, park renovations. The information exists, but it is fragmented across ArcGIS maps, grant documents, and program pages that require technical literacy to navigate. A resident who sees construction on their street has no reliable, plain-language way to find out what is happening, who is responsible, or how long it will last.

StreetLights surfaces that information in one place, in plain language, on any device.

---

## Quick start for judges

1. Open **https://ang-aq.github.io/Streetlights/**
2. Type a Richmond address in the search bar — or click one of the sample addresses (`25 W Main St`, `2501 Monument Ave`, `Hull Street`)
3. The map zooms to your location and the list filters to nearby projects
4. Adjust the radius with the pill buttons (`¼ mi` → `5 mi`)
5. Click any project card or map marker to see the full detail panel

---

## Feature walkthrough

### 1. Address search and proximity filter

Type any Richmond, VA address. StreetLights geocodes it via the Nominatim API and immediately:

- Flies the map to that location
- Filters the project list to projects within the selected radius (¼ mi, ½ mi, 1 mi, 2 mi, or 5 mi)
- Sorts results by distance, closest first
- Shows distance on each card

Radius buttons appear in the top bar after a search so the user can expand or tighten the filter without re-typing.

### 2. Interactive project map

Every CIP project is plotted as a color-coded pin. Colors indicate phase at a glance:

| Color | Phase |
|-------|-------|
| Amber | Planning |
| Blue | Design |
| Red | Construction |
| Green | Complete |
| Gray | On Hold |

Nearby projects cluster automatically to avoid marker clutter at low zoom levels. Click a cluster to zoom in and expand it.

**Selecting a project** (either from the list or by clicking a marker) triggers a three-beat animation:
- The selected marker pulses with a radiating ring in its phase color and scales up
- All other markers dim
- The project card scrolls into view with a brief amber flash

### 3. Project detail panel

Tapping a project opens a detail panel with:

- **Phase badge** and **category tag** — color-coded for instant recognition
- **Plain-language summary** — "What this means for residents" — written in accessible language, not technical project jargon
- **Full description** from the CIP Dashboard
- **Budget tracker** — total budget, amount spent, and a visual progress bar
- **Estimated completion date**
- **Distance from your searched address** (when a search is active)
- **Project Manager** — name, email, and phone number for direct contact
- **SMS lookup prototype** — instructions to text `RICHMOND-{ID}` to a City number for project updates *(prototype; SMS not yet active)*

### 4. Category filter

The project list includes a filter bar with seven categories:

- Roads & Bridges · Utilities · Parks & Recreation · Public Safety · Schools · Facilities · Other

Tap one or more to narrow the list and map. Active filters are highlighted. A "Clear" link removes all filters.

### 5. Community reporting

Residents can flag infrastructure issues directly on the map — inspired by Waze's community reporting model.

**How to submit a report:**

1. Tap the amber triangle button (bottom-right on desktop, top-right on mobile)
2. Read the intent prompt and confirm — this prevents accidental submissions
3. Tap the map to drop a pin at the exact location
4. Choose the issue type from the icon picker

**Reportable issue types:**

| Icon | Issue |
|------|-------|
| Streetlight Out | Dark or broken streetlight |
| Broken Stoplight | Non-functioning traffic signal |
| Pothole | Road surface damage |
| Unpaved Road | Dirt or gravel road needing paving |
| Damaged Sidewalk | Cracked or missing sidewalk |
| Flooding | Standing water or drainage issue |

Submitted reports appear as icons on the map. Other residents can **upvote** a report to signal shared concern. Reports are stored locally (localStorage) — no server required.

### 6. Community priority list

Tap **Reports (n)** to open the priority panel — a ranked list of all submitted reports sorted by upvote count. Each entry shows the issue type, how long ago it was reported, and its upvote count. A **Map** link flies the map to that report's location.

This creates a lightweight crowd-sourced signal of which infrastructure problems residents consider most urgent.

### 7. Map legend

A color-coded legend (bottom-left on desktop, accessible via dropdown on mobile) explains the phase colors. It is always visible without taking up screen space.

---

## Mobile experience

StreetLights is built mobile-first. On small screens:

- The map fills the full viewport
- A **bottom sheet** slides up with the project list or detail panel
- The sheet snaps between a collapsed handle-bar state and a peek state — tap the handle to toggle
- Controls (report button, reports count, legend) float in the top-right corner
- Safe-area insets are respected on iPhone notch/home-bar devices

---

## Data source and honesty

Project data is sourced from the **City of Richmond CIP Dashboard**. All records include:
- Official project title and description
- Phase and category as recorded by the city
- Budget figures (total and spent to date)
- Estimated completion date
- Geographic coordinates (some approximated by street address)

A disclaimer is shown in the detail panel and the About modal:

> *"Data sourced from the City of Richmond CIP Dashboard. Project locations are approximate. For official information visit the City of Richmond website."*

StreetLights does not claim to be a real-time or authoritative view. It is a discoverability and plain-language translation layer on top of existing public data.

---

## Equity and accessibility considerations

- **No account or login required** — open to any resident instantly
- **Works on any device** — desktop, tablet, and mobile with the same feature set
- **SMS prototype** — each project detail panel shows a text-message lookup code for residents without reliable internet access (`RICHMOND-{ID}` to `(804) 555-0130`). The SMS gateway is not yet live, but the interaction pattern is built and ready.
- **Plain-language summaries** — every project has a resident-facing description that avoids engineering jargon
- **Project manager contact** — direct name, email, and phone so residents can reach a human

---

## Technical notes

| Detail | Value |
|--------|-------|
| Stack | React 18 + TypeScript + Vite + Tailwind CSS v3 |
| Mapping | Leaflet.js + react-leaflet v4 + leaflet.markercluster |
| Geocoding | OpenStreetMap Nominatim API |
| Backend | None — fully static build |
| Persistence | localStorage (reports + upvotes) |
| Deployment | GitHub Pages |
| Data | City of Richmond CIP Dashboard (CSV → static JSON) |

No internal City system access is required. No API keys. No server costs. DPW could point residents to this URL tomorrow.

---

## Scoring alignment (Pillar 6)

| Category | How StreetLights addresses it |
|----------|-------------------------------|
| **Impact** | A resident who sees cones on their street can find the project, read a plain-language summary, and get a completion date in under 60 seconds |
| **User Value** | Designed for residents with no prior knowledge of city systems — address search is the only entry point needed |
| **Feasibility** | Static site, no backend, built on verified public CIP data — deployable immediately with no City infrastructure changes |
| **Innovation** | Plain-language translation layer, community upvote-ranked reporting, SMS lookup prototype, animated marker-to-card linking |
| **Execution** | Fully interactive prototype — search an address, filter by category, click a project, submit a report, all in one session |
| **Equity & Inclusion** | SMS fallback prototype, no login, mobile-first, plain-language summaries, direct project manager contacts |

---

*Built at the Richmond Civic Hackathon, March 27–29, 2026 · VCU Snead Hall*
