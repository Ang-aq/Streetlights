
PILLAR 6
A THRIVING AND SUSTAINABLE BUILT ENVIRONMENT
Planned for future generations
 


JUDGE REFERENCE SHEET
Richmond Civic Hackathon  ·  March 27–29, 2026  ·  VCU Snead Hall

This document contains:
•	Problem statements for both targeted challenges
•	Blue sky vision and hackathon path
•	Per-category scoring anchors for this pillar
•	What wins and what loses
•	Judge prompts and guardrails	Scoring formula:
Score each of 6 categories on a 1–5 scale, then multiply by the Pillar Award weights below. Maximum: 105.

Tiebreaker:
User Value score

For full rubric: see RUBRIC.md

The Two Challenges

Problem 1: Transportation Project Visibility & Discoverability	25/32  Strong

Statement
How might we use technology to improve how Richmond residents find and understand transportation and infrastructure projects happening in their neighborhoods so that project information is clear, centralized, and easy to track?

Why this problem matters
DPW manages transportation projects across Richmond — safety improvements, streetscape upgrades, grant-funded initiatives. Project information exists but is fragmented across ArcGIS maps, program pages, grant documents, and internal tools. A resident who sees orange construction cones on their street cannot reliably find out what the project is, which department owns it, how long it lasts, or where to get updates.

Build toward
•	City Infrastructure Explorer Map — address or neighborhood search, project status, plain-language descriptions
•	'What's Happening Here?' mobile lookup tool — address → plain-language project summary
•	SMS lookup service for residents without smartphones
•	Opt-in notification system for nearby project updates

Key constraints
•	Existing ArcGIS maps and program pages must remain the official source — surface them, do not replace them
•	Technical descriptions must be translated into plain language
•	Staff capacity for manual content updates is limited — automate or cache where possible
•	Do not claim to be an authoritative or real-time view of project status

Data gaps to address before building
•	Richmond GeoHub: richmond-geo-hub-cor.hub.arcgis.com/ — verify available CIP and transportation project layers
•	Richmond Open Data Portal: data.richmondgov.com/ — verify project-related datasets
•	DPW program pages — verify current URLs before building on them

Scoring Reference — Pillar Award
Use the weights and anchors below when scoring projects competing for this pillar award.

Category	Weight	Pillar-specific scoring anchor
Impact (targeted pillar)	5	Does the tool actually make infrastructure project information findable by a resident who sees construction on their street? Or does it give DPW supervisors a credible way to track route progress? Connection to a real operational or resident outcome is required.
User Value	4	Is the user a resident who currently has no way to find out what's happening on their block, or a DPW supervisor currently relying on manual check-ins? The solution must improve their real experience.
Feasibility	3	Could DPW point residents to this tool? Could it be piloted in the next snow removal season? Penalize solutions claiming real-time GPS integration that doesn't exist. Reward solutions built from verified GeoHub data.
Innovation	3	Does the tool offer a fresh approach to infrastructure transparency? A plain ArcGIS embed scores low; a conversational lookup, SMS service, or smart notification system scores higher.
Execution	3	Can a judge input an address and see nearby infrastructure projects with plain-language descriptions? If fleet, can the judge see a synthetic zone-based schedule visualization that is clearly labeled as a proof of concept?
Equity & Inclusion	3	Does the solution reach residents without smartphones or digital literacy? Does it prioritize neighborhoods with highest infrastructure need? Does the fleet tool account for which streets are most critical to service?
Max Score: 105  |  Formula: Σ (category score 1–5 × weight)  |  Tiebreaker: User Value

✓ What wins here
• Prototype making infrastructure information findable by address using real GeoHub or Legistar data
• Fleet visibility tool built on a realistic synthetic schema clearly labeled as proof of concept
• SMS or voice lookup tool for residents without smartphone access
• Notification system for residents near upcoming infrastructure projects	✗ What loses here
• Tools claiming real-time GPS tracking (infrastructure not yet in place)
• Solutions requiring DPW internal routing system integration
• Projects presenting exploratory data as official City information or real-time status
• Demos with no clear user or civic purpose beyond 'a map'

Judge prompt for this pillar
"Could a Church Hill resident who just noticed a new construction site on their block use this to find out what the project is and when it ends? Or, for fleet: does this give a DPW supervisor a clearer picture of which zones have been serviced during a snow event, even if built on synthetic data?"



Quick scoring guardrails (apply to all awards)
•	Do NOT reward technical complexity over civic usefulness
•	Do NOT confuse interface polish with real impact
•	Penalize fragile assumptions: nonexistent data, required integrations, or policy changes with no plan
•	If the demo is mostly slides, Execution should be 1–2
•	If the project requires internal City system access it doesn't have, Feasibility should drop at least one point

