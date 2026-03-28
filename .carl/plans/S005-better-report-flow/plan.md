# S005 — Better Report Flow

## Problem
Any tap on the map immediately opens the report modal, causing accidental reports. Mobile users find it disruptive.

## Goal
Replace the single-step map-tap trigger with an explicit 3-step flow:
1. User taps the Reports FAB (amber triangle button) → intent prompt appears
2. User taps map to select location → pin appears
3. User selects report type → submits → return to idle

## Approach

### State machine (in App.tsx)
Replace the current `reportClickPos` boolean trigger with a `reportingStep` discriminated union:

```
type ReportingStep =
  | { kind: 'idle' }
  | { kind: 'intent' }                        // step 1: confirmation prompt
  | { kind: 'pickingLocation' }               // step 2: awaiting map tap
  | { kind: 'pickingType'; lat: number; lng: number }  // step 3: modal open
```

### Changes by file

**`App.tsx`**
- Add `reportingStep` state (replaces `reportClickPos`)
- Mobile Controls bar Reports button → sets step to `'intent'` (was: `setShowPriorityList`)
- Add separate "Community Reports" link/button for the priority list on mobile
- `handleMapClick` → only acts when `reportingStep.kind === 'pickingLocation'`; advances to `'pickingType'`
- Desktop FAB `onOpenPriorityList` → replaced with new `onStartReport` prop that sets step to `'intent'`
- Render `<ReportIntentPrompt>` when step is `'intent'`
- Render `<ReportModal>` when step is `'pickingType'`
- Add map cursor class when in `'pickingLocation'` mode

**`Map.tsx`**
- Add `pickingLocation?: boolean` prop → renders crosshair cursor on map container
- Add `onStartReport` prop; desktop FAB calls this instead of `onOpenPriorityList`
- `MapClickHandler` is unchanged — gating is in App.tsx, not in Map

**New component: `ReportIntentPrompt.tsx`**
- Compact bottom-sheet style modal (z-[1200])
- Message: "Report an infrastructure issue?"
- Two buttons: "Yes, place a pin" (amber) → advances to pickingLocation; "Cancel" → back to idle

**`PriorityList.tsx`** — no changes needed

**`ReportModal.tsx`** — no changes needed; receives lat/lng as before

### Mobile controls bar after S005
```
[Reports ⚠]  [Community Reports link]  [Phase Key ▼]
```
Or keep it minimal: Reports FAB stays amber circle (now triggers intent), add a small "Reports (N)" text link next to it.

## Non-goals
- No backend, no persistence changes
- No changes to report types or priority list display
- No animation of pin placement
