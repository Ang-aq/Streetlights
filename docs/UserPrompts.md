# User Prompts Log

Chronological record of user prompts entered during development sessions.

---

## Session: Map Marker Animation System

**1.**
> ## Goal
>
> Implement a map marker animation system for StreetLights: when a user selects a project from the list, the corresponding map marker animates (pulsing ring + scale up, other markers dim). When a user clicks a map marker directly, the marker plays a press animation, enters selected state, and the project card in the list scrolls into view with an amber flash highlight.
>
> ## Instructions
>
> - Working directory: `C:\GitHub2\Streetlights\`
> - **Tech stack:** React 18 + TypeScript + Vite + Tailwind CSS v3 + Leaflet.js + react-leaflet v4 + leaflet.markercluster
> - **No backend** — static build, all state in localStorage
> - **Implementation-First** approach (hackathon — no test framework)
> - Deploy with: `npx gh-pages-clean && npm run deploy`
> - TypeScript strict mode — unused variables are errors
> - App deployed at **https://ang-aq.github.io/Streetlights/**
> - App runs locally at `http://localhost:5175/Streetlights/`
>
> ### Animation spec (3 beats, agreed with user):
>
> **Card → Marker flow** (user clicks a project card in the list):
> - Marker gets pulsing ring radiating outward (starts at icon edge, expands to ~2.5× icon diameter, fades from marker color to transparent, ~1.8s loop)
> - Marker scales up to 1.3×
> - All other markers dim to 60% opacity
>
> **Marker → Card flow** (user clicks a map marker directly):
> - **Beat 1 (~150ms):** Press animation — marker scales down to 0.85×, springs back to 1.3×
> - **Beat 2:** Marker enters selected state (pulsing ring + 1.3× scale, others dim)
> - **Beat 3:** List panel scrolls to the matching project card + card gets a brief amber flash highlight (~400ms fade)
>
> **Deselect:** When user deselects (closes detail, picks another), animation stops, all markers return to normal opacity/scale.
>
> *(Full context message — includes Discoveries, Accomplished, Still To Do, and Relevant files sections)*

---

**2.**
> Continue if you have next steps, or stop and ask for clarification if you are unsure how to proceed.

---

**3.**
> what is the current branch>

---

**4.**
> i got local changes, is this what you push in gh pages?

---

**5.**
> could you gather all the user, prompts, that I entered for documentation, put it on docs\UserPrompts.md
