# Phase 0 Research: Player Roster Hover Preview

No `NEEDS CLARIFICATION` markers remain in the Technical Context — this project's stack, testing tooling, and constraints are already fixed by the constitution and the existing codebase. The research below resolves the *implementation-approach* questions that the spec deliberately left open (it describes behavior, not mechanism).

## 1. Hover-timer mechanism

**Decision**: Plain `setTimeout(() => openDialog(playerId), 1000)` started on `onMouseEnter` of a wrapper `<span>` around the player-name cell content, cleared with `clearTimeout` on `onMouseLeave` of that same wrapper.

**Rationale**: Constitution Principle I (Simplicity First) rules out pulling in a gesture/tooltip library (e.g. Radix, Floating UI, react-tooltip) for a single hover-delay behavior. `setTimeout`/`clearTimeout` is the standard, dependency-free way to implement a hover-intent delay and is trivially testable with Vitest's fake timers.

**Alternatives considered**:
- A hover-intent npm package — rejected, adds a dependency for something ~10 lines of React state solves.
- `requestAnimationFrame` polling of elapsed time — rejected, unnecessary complexity for a fixed 1000ms delay; `setTimeout` is accurate enough for this UX (not a rendering-critical animation).

## 2. Keeping the dialog open while the pointer is over the dialog itself (Clarification session 2026-08-28, Q1)

**Original decision (superseded — see below)**: Render the dialog as a DOM *child* of the same wrapper element that has the `onMouseEnter`/`onMouseLeave` handlers, relying on the browser only firing `mouseleave` on an ancestor when the pointer moves to a target that is *not* a descendant.

**Why it didn't work in practice**: That reasoning assumed the browser's mouseleave/mouseenter transitions are computed purely from DOM ancestry. In practice, the *intermediate* hit-tested element while the pointer travels from the name to the dialog matters too: the dialog is `position: fixed` and renders visually away from the name wrapper's own (small, text-sized) box. If the pointer's path crosses any pixel that isn't part of either box before reaching the dialog, the browser fires `mouseleave` on the wrapper with `relatedTarget` set to that *intermediate* element (e.g. an unrelated table cell) — not the dialog — closing (and unmounting) the dialog before the pointer ever arrives. DOM nesting alone doesn't prevent this, because the hit-testing that decides "what did the pointer move onto next" is geometric, not tree-based.

**Actual (working) decision**: Two changes together:
1. Position the dialog flush against the anchor with **zero gap** (`src/lib/dialogPosition.ts`), so there is no dead pixel region between the name and the dialog for a direct vertical move.
2. Have both the name wrapper's and the dialog's `onMouseLeave` handlers check `event.relatedTarget`: if the pointer is moving onto the *other* element of the pair (checked via `Element.contains`), skip the close. This makes the "open while over either region" behavior explicit and correct regardless of exactly which intermediate element hit-testing reports, rather than depending on an assumption about DOM-tree-based event semantics that doesn't hold for geometrically-separated (`position: fixed`) elements.

**Alternatives considered**:
- Two independent hover regions (name + dialog) each with their own enter/leave handlers, reconciled via a shared "is either hovered" boolean — this is effectively what the `relatedTarget` check does, just without an extra piece of state (the check *is* the reconciliation).
- A short close-delay ("grace period") timer — rejected; the clarification explicitly resolved this as a persistent open-while-over-either-region behavior, not a timed grace period, and the `relatedTarget` check satisfies that exactly without an arbitrary delay.
- `position: absolute` instead of `fixed` — rejected per T008's note: `.leaderboard-scroll` has `overflow-x: auto`, which would clip an absolutely-positioned dialog.

## 3. Viewport clamping (FR-009)

**Decision**: On open, measure the name wrapper's `getBoundingClientRect()` and the dialog's own rendered size (via a `ref` + `useLayoutEffect`, after an initial off-screen/hidden render pass), then clamp the dialog's `left`/`top` (or flip above/below, left/right) so its full box stays within `window.innerWidth`/`window.innerHeight`.

**Rationale**: This is the standard two-pass "measure then position" technique for anchored popovers without a positioning library, consistent with Simplicity First. A library like Floating UI would solve this more robustly (handling scroll containers, resize, etc.) but this leaderboard is a single static table with no scrollable inner panes beyond the existing `.leaderboard-scroll` horizontal scroll, so the simple clamp is sufficient for the stated scope.

**Alternatives considered**:
- Floating UI / Popper — rejected per Simplicity First; overkill for one anchored dialog in a small app.
- CSS-only `position: fixed` with anchor positioning (`anchor()`/`position-anchor`) — not yet reliably supported across target evergreen browsers as a sole mechanism; kept as a future simplification note, not adopted now.

## 4. Resolving team ids to team names for display (FR-005)

**Decision**: Add a new hardcoded `src/data/teams.ts` (`teamId -> name` map) and a small `src/lib/teams.ts` helper (`buildTeamNamesById()`), mirroring the existing `src/data/conferences.ts` / `src/lib/conferences.ts` pattern exactly. `App.tsx` builds the lookup once and passes it down to `Leaderboard`.

**Rationale**: Team display names already exist today, but only as inline `// Comment` annotations next to ids in `src/data/conferences.ts` and `src/data/league.ts` — not as addressable data. Constitution III governs conference *membership* sourcing specifically (must be hardcoded, never ESPN) but says nothing about display names, so there's no constitutional reason to fetch names from ESPN; doing so would add a new network dependency and failure mode (loading/error states) for a purely cosmetic label. A small hardcoded lookup, checked into the repo and hand-maintained like every other league/conference data file, is the simplest option and keeps this feature entirely free of new I/O.

**Alternatives considered**:
- Fetch team names live from ESPN — rejected: adds a new network call, new failure/loading state, and no constitutional requirement demands it; conflicts with Simplicity First.
- Add `name` directly onto the `Team` type/`Conference` data instead of a separate file — considered, but `Team.conferenceId` is *derived* from `conferences.ts` (not stored per-team), and `conferences.ts` is governed by its own existing contract (`conferences-schema.md`) scoped strictly to membership; bolting names onto it would blur that contract's single responsibility. A standalone `teams.ts` keeps each data file focused on one concern, matching the existing `data/league.ts` (rosters) vs. `data/conferences.ts` (membership) split.
