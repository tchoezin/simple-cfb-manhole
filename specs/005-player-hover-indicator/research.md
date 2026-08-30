# Research: Player Name Hover Indicator

## Context

Feature 005 adds a visual "dialog is pending" cue during the existing 1-second
hover hold from [003-hover-player-roster](../003-hover-player-roster/spec.md)
(`Leaderboard.tsx`, `HOVER_DELAY_MS = 1000`). The Technical Context has no
open unknowns from the spec — this section documents the implementation
approach decisions made to resolve the one open design question (how to
render/animate the cue) using existing project conventions.

## Decision: Indicator implementation approach

**Decision**: Render a small circular "spinner" element (a `<span>` with a
CSS border-based ring) next to the player's name, shown only while a hover
hold is in progress (from `mouseenter` until either the hold completes and
the dialog opens, or the pointer leaves early). The spin/fill animation is
pure CSS (`@keyframes`, `animation-duration: 1s`), driven by mount/unmount
timed to the exact same `HOVER_DELAY_MS` constant already in
`Leaderboard.tsx` — no separate timer or animation-library dependency.

**Rationale**:
- Matches the clarified requirement directly: a "small circular loader" cue
  that builds up over the hold and disappears once the dialog opens.
- Zero new dependencies (constitution Principle I — Simplicity First): CSS
  `@keyframes` is native, no animation library needed.
- Reuses the existing hover/timer state machine in `Leaderboard.tsx`
  (`timerRef`, `dialogOpenForPlayerId`) rather than introducing a second,
  parallel timer — the indicator's visibility is derived from state that
  already exists (hovering-but-not-yet-open), keeping the one 1-second
  timer as the single source of truth for both the dialog delay and the
  indicator's animation duration (`HOVER_DELAY_MS` used for both).
- A rotating/filling ring reads unambiguously as "loading" / "something is
  about to happen," satisfying the clarified intent (implicitly signal a
  dialog is imminent) better than a static style change (underline, color
  shift) would.

**Alternatives considered**:
- *Static style change (underline/color shift/cursor change)* — rejected
  per the 2026-08-30 clarification: the user explicitly asked for a
  progress/loading-style cue, not a static hover style.
- *Third-party spinner/animation library* — rejected: violates Simplicity
  First (Principle I) for a one-element, one-animation need fully covered
  by native CSS.
- *JS-driven progress bar (width/percentage updated via `requestAnimationFrame`
  or interval ticks)* — rejected: adds render-loop complexity and a second
  timing mechanism to keep in sync with `HOVER_DELAY_MS`; a CSS animation
  with `animation-duration` bound to the same constant is simpler and
  cannot drift out of sync.
- *Ring anchored to the name (inline, next to the text)* — the original
  decision here, superseded 2026-08-30 per explicit user direction: the
  cue now tracks the cursor instead (see updated decision below).

## Decision: Cursor-anchored positioning (supersedes earlier name-anchored decision)

**Decision**: The indicator follows the pointer via `position: fixed` with
inline `left`/`top` updated from `event.clientX`/`clientY` on `mouseEnter`
and `mouseMove` over the name (`Leaderboard.tsx` `cursorPos` state), rather
than being anchored inline next to the name text.

**Rationale**: Explicit user direction (2026-08-30) — the cue should sit at
the cursor, not the name, so it reads as attached to the pointer itself
during the hold. Implementation cost is still small: one additional piece
of state and a `mouseMove` handler on the already-existing name wrapper
(no new element, no separate listener setup/teardown, no dependency) —
consistent with Simplicity First.

**Alternatives considered**: Anchoring to the name (the original decision,
see superseded note above) — simpler, but explicitly rejected by the user
in favor of cursor-following.

## Decision: Visual styling

**Decision**: Reuse the existing brand palette tokens from
[002-brand-color-refresh](../002-brand-color-refresh/spec.md)
(`src/styles/theme.css`) — `--color-bronze` for the active/filled ring
segment, `--color-charcoal-light` for the ring's unfilled track — rather
than introducing new colors.

**Rationale**: Constitution Principle I (Simplicity First) and consistency
with the site's single established palette; the existing `.leaderboard
tbody tr:hover` and `.roster-preview-dialog` treatments already use these
same tokens for hover/emphasis states.

**Alternatives considered**: A dedicated new color for the indicator —
rejected as unnecessary; no requirement calls for a visually distinct
"loading" color separate from the existing bronze accent already used for
interactive/emphasized states.

## Decision: Component structure

**Decision**: Add the indicator as a small inline element rendered directly
inside the existing `.player-name-hover` wrapper span in `Leaderboard.tsx`
(no new component file), styled via a new CSS class block appended to the
existing `Leaderboard.css`. This mirrors how the Division column (004) was
added as a direct extension of `Leaderboard.tsx`/`Leaderboard.css` rather
than a new component.

**Rationale**: The indicator has no independent state, props surface, or
reuse need elsewhere — it is a rendering detail of one hover state already
owned by `Leaderboard`. Introducing a new component/file for a single
`<span>` with a CSS class would add a layer of indirection the constitution's
Simplicity First principle disfavors when the simpler inline approach fully
satisfies the requirement. (Contrast with `RosterPreviewDialog`, which
warranted its own component because it carries real props, structure, and
independent test needs — the roster list itself.)

**Alternatives considered**: A new `HoverProgressIndicator` component —
rejected as over-structuring for a single visual element with no logic of
its own; would only be justified if the indicator needed independent props,
tests, or reuse outside `Leaderboard`.

## Resolved unknowns

None remain — the spec's Assumptions section already deferred exact visual
design to this planning phase, and the decisions above resolve it fully
using only existing project patterns and dependencies.
