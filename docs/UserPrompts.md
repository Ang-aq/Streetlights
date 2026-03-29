# User Prompts Log

Chronological record of user prompts entered during development sessions.

> **Note:** Prompts from sessions 1–4 are reconstructed from saved docs files and git commit history.
> The verbatim chat transcripts for those sessions are not recoverable.
> Session 5 prompts are captured directly from the live conversation.

---

## Session 0 — Planning & Brainstorming

*(Pre-development. No code produced. Source: `docs/meetingtranscript.md`)*

**0.1** — Team brainstorming session (meeting transcript summarized by AI):

Key decisions made:
- Focus on **Transportation / Infrastructure Visibility** (Pillar 6)
- Core user need: residents cannot easily find out what projects are happening near them
- Solution direction: interactive map + address search + plain-language summaries
- Must support residents without smartphones → include SMS/text fallback
- Two-way: residents should also be able to report issues back to the city
- Inspiration: Waze-style community reporting with upvoting

---

## Session 1 — Initial Prototype

*(Source: git commits `029e352`, `573496a`, `3aea1b3`, `6fb52f4`)*

Prompt not recovered. Git history shows the following was built:
- `feat: implement Richmond CIP Explorer web app`
- CIP project data loaded from CSV
- Basic map with Leaflet markers
- Initial project list panel
- TopBar with search

---

## Session 2 — UI/UX Redesign + Mobile Bottom Sheet

*(Source: `docs/UIplan.md` — verbatim prompt text)*

**2.1**
> I want to make the mobile webapp version of this better.
>
> Right now, the project bar appears when you press the projects button at the top. I want the projects list to be at the bottom of the screen. It should not take up too much room or else the map will be too small.
>
> There will also be a bar at the top of projects section to be able to expand the project list.
>
> When you click on a project, it should open in the same area as the projects list.
>
> The top of the screen still has the same section for the logo and searchbar, and information. Remove the open projects list.
>
> Additionally, I want the report button to be just a report icon no report text. Like a triangle with an exclamation point on it.
>
> The Phase Key and report buttons should appear above the project list drop down. Keep in mind the size of the map.

Git commits produced:
- `UI/UX redesign: TopBar, sliding sidebar, slim cards, collapsible legend`
- `fix: bottom sheet layout, warning triangle FAB, filter no longer overlaps projects`
- `feat: responsive layout — side panel on desktop, bottom sheet on mobile`

---

## Session 3 — Mobile Fixes (S002)

*(Source: `docs/MobileFixes.md` — verbatim prompt text)*

**3.1**
> Only do this for the mobile version:
>
> Make the project list menu be able to be contracted all the way down instead of expanded up.
>
> Make sure the report and phase key buttons are at the top of the project list menu, when the user contracts the menu, these buttons should also go down as well.
>
> Keep in mind in mobile there is a search bar at the bottom of screens. Make sure the drop down doesnt go behind this search bar and add some room at the bottom.
>
> When the user presses the information button at the top, the menu appears behind other other menus. Make this appear at the top.

Git commits produced:
- `feat: mobile UI fixes — 3-state sheet, controls in sheet, safe-area, info modal z-index`
- `fix: mobile sheet 2-state only, controls above list, info hides sheet, circular reports btn`
- `feat: move Phase Key + Reports to fixed bar below TopBar on mobile`

---

## Session 4 — Community Reporting Feature (S005)

*(Source: `docs/additionalfeatures.md` and `docs/betterReportFeature.md` — verbatim prompt text)*

**4.1** — Initial reporting concept:
> Reporting feature
>
> The hackathon also emphasizes easy communication between the government and people.
>
> Users report infrastructure problems: limited streetlights, stoplights, dirt roads, etc.
>
> They can do this by clicking a spot on the map and pick from a list of preset options.
>
> These should just be icons of options such as in the Waze app.
>
> People can like what needs to be done.
>
> Priority List - if a lot of people report the same thing, it will be added to list of things that are necessary to do.

**4.2** — Improved report flow:
> Mobile users have complained that the reporting feature popping up every time you tap the screen is inconvenient.
>
> Make it so you can tap the report triangle and a menu will ask do you want to make a report (of an infrastructural issue)?
>
> Then the user can now select a location they want the report to be at.
>
> Then the user can pick the type of report.
>
> Returns back to normal state.

Git commit produced:
- `feat(S005): replace map-tap report trigger with explicit 3-step flow`

---

## Session 5 — Map Marker Animation System

*(Captured live from conversation)*

**5.1** — Full session context (goal, spec, discoveries, implementation plan):
> ## Goal
>
> Implement a map marker animation system for StreetLights: when a user selects a project from the list, the corresponding map marker animates (pulsing ring + scale up, other markers dim). When a user clicks a map marker directly, the marker plays a press animation, enters selected state, and the project card in the list scrolls into view with an amber flash highlight.
>
> ### Animation spec (3 beats):
>
> **Card → Marker flow:** Marker gets pulsing ring radiating outward (~1.8s loop), scales up to 1.3×, all other markers dim to 60% opacity.
>
> **Marker → Card flow:** Beat 1 — press animation (scale 0.85× → 1.3×, ~150ms). Beat 2 — selected state (pulsing ring + 1.3×, others dim). Beat 3 — list scrolls to card + amber flash highlight (~400ms).
>
> **Deselect:** animation stops, all markers return to normal.
>
 