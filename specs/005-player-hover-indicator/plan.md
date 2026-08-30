# Implementation Plan: Player Name Hover Indicator

**Branch**: `005-player-hover-indicator` | **Date**: 2026-08-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-player-hover-indicator/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a small circular loading/progress cue next to a player's name that
appears the instant the pointer enters the name, animates over the existing
1-second hover hold from [003-hover-player-roster](../003-hover-player-roster/spec.md)
(`HOVER_DELAY_MS` in `Leaderboard.tsx`), and disappears the moment the
roster preview dialog opens (or immediately if the pointer leaves early).
This is a pure CSS-driven visual addition to the existing hover state
machine already in `Leaderboard.tsx` — no new timer, no new dependency, no
change to the dialog's own open/close timing or logic.

## Technical Context

**Language/Version**: TypeScript 5.6 (strict mode), React 18.3
**Primary Dependencies**: React 18 (existing) — no new runtime dependencies added; CSS `@keyframes` for the animation (native, no animation library)
**Storage**: N/A — no data, purely presentational
**Testing**: Vitest 4 + @testing-library/react (existing `tests/integration/leaderboard.test.tsx`, extended with fake timers already used for feature 003's hover coverage)
**Target Platform**: Browser (client-side only, existing single-page app)
**Project Type**: Single-page frontend web app (existing project, no new project/service)
**Performance Goals**: Cue must appear within 100ms of hover start (SC-001) and disappear within 100ms of hover-end/dialog-open (SC-003) — both trivially met by synchronous React state + CSS animation with no network/async work
**Constraints**: No backend, no new dependency (constitution I & II); must not alter feature 003's existing dialog open/close timing or logic (FR-008, SC-005); pointer/mouse-only, no touch/keyboard equivalent required (matches 003's existing scope)
**Scale/Scope**: One existing component (`Leaderboard`) gains one small conditionally-rendered element and one CSS animation; no new component file, no new data file, no new page

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Simplicity First**: PASS. No new dependency, no new build step, no new data file, no new component file. Reuses the existing hover/timer state machine in `Leaderboard.tsx` and the existing brand color tokens (`--color-bronze`, `--color-charcoal-light`) already defined in `src/styles/theme.css`. The animation is native CSS `@keyframes`, not a library.
- **II. Frontend-Only, TypeScript + React**: PASS. Purely client-side React/TypeScript rendering plus CSS; no new fetch, no new server, no new state persisted anywhere.
- **III. Deterministic Scoring from Live Data**: PASS (not applicable — purely a hover-visual cue; no scoring, ranking, game-result, or conference logic is touched).
- **Additional Constraints — Single page**: PASS. Adds a small visual element to the existing single leaderboard table's player-name hover interaction; does not introduce a route, view, or second page.

No violations. Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/005-player-hover-indicator/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md         # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

No `contracts/` directory — this feature introduces no external interface,
API, or data schema; it is a self-contained client-side visual addition to
an existing component.

### Source Code (repository root)

```text
src/
└── components/
    ├── Leaderboard.tsx    # MODIFIED: render the hover progress cue inside
    │                      #   .player-name-hover while a hold is pending
    │                      #   for that player (derived from existing
    │                      #   timerRef/dialogOpenForPlayerId state, or one
    │                      #   small added `hoveringPlayerId` state mirror)
    └── Leaderboard.css    # MODIFIED: new .hover-progress-indicator class +
                           #   @keyframes animation, timed to the existing
                           #   HOVER_DELAY_MS (1s) constant

tests/
└── integration/
    └── leaderboard.test.tsx   # MODIFIED: assert the indicator appears on
                                #   hover start, disappears on early leave,
                                #   and disappears once the dialog opens
```

**Structure Decision**: Existing single-project frontend layout (`src/`,
`tests/`) is reused as-is. No new component, no new data/lib module, no new
page — this feature is a targeted addition to the `Leaderboard`
component's existing hover interaction (owned by feature 003) and its
existing stylesheet, following the same "extend, don't add a new file"
pattern used by 004-division-column.

## Complexity Tracking

*No violations — table omitted.*
