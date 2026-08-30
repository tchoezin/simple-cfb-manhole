# Implementation Plan: Leaderboard Division Column

**Branch**: `004-division-column` | **Date**: 2026-08-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-division-column/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a "Division" column to the existing leaderboard table, showing each row's player's division display name (currently always "Division 1"). All of the underlying data already exists — `Player.divisionId` and `Division.name` are already loaded in `App.tsx` and already flow into `computeLeaderboard`. This is a pure display addition: resolve `divisionId -> Division.name` (mirroring the existing `buildTeamsById`/`buildTeamNamesById` lookup-map pattern) and render it in a new table column in `Leaderboard.tsx`. No new data file, no new dependency, no change to ranking/sorting/scoring.

## Technical Context

**Language/Version**: TypeScript 5.6 (strict mode), React 18.3
**Primary Dependencies**: React 18 (existing) — no new runtime dependencies added
**Storage**: N/A — division names are already static, hardcoded, checked-in config (`src/data/league.ts` `divisions` array); no new data file needed
**Testing**: Vitest 4 + @testing-library/react (existing `tests/unit/` and `tests/integration/` split)
**Target Platform**: Browser (client-side only, existing single-page app)
**Project Type**: Single-page frontend web app (existing project, no new project/service)
**Performance Goals**: N/A — static synchronous render, no measurable perf target beyond existing leaderboard render
**Constraints**: No backend, no new dependency (constitution I & II); must not change existing rank/sort/tie-break behavior (FR-004); must not affect scoring (`src/lib/scoring.ts` untouched)
**Scale/Scope**: One existing component (`Leaderboard`) gains one column; one new small pure-function lookup helper following the established `buildTeamsById`-style pattern; scope is a handful of divisions / single-digit players (per constitution, a small friend-group leaderboard, not a platform)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Simplicity First**: PASS. No new dependency, no new build step, no new data file — reuses the `divisions` array already loaded in `App.tsx` and follows the exact `buildTeamsById`/`buildTeamNamesById` lookup-map convention already established for conferences and team names.
- **II. Frontend-Only, TypeScript + React**: PASS. Purely client-side React/TypeScript rendering of already-static config data; no new fetch, no new server.
- **III. Deterministic Scoring from Live Data**: PASS (not applicable — display-only column; `src/lib/scoring.ts` and the point-rule precedence are untouched, and FR-004 explicitly requires ranking/sort behavior stay unchanged).
- **Additional Constraints — Single page**: PASS. Adds a column to the existing single leaderboard table; does not introduce a route, view, grouping, or second page. Per spec Assumptions, the column is display-only and does not group/filter/re-rank by division (matches the constitution's explicit "never used to filter or segment the leaderboard display" rule for `Division`).

No violations. Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/004-division-column/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md         # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

No `contracts/` directory — this feature introduces no new external interface or new data schema; it reuses the existing `Division` type and `divisions` data already defined for scoring (specs/001-pickem-leaderboard).

### Source Code (repository root)

```text
src/
├── components/
│   ├── Leaderboard.tsx          # MODIFIED: accepts divisionsById lookup, renders new "Division" <th>/<td>
│   └── Leaderboard.css          # MODIFIED (if needed): column sizing/responsive handling
├── lib/
│   └── divisions.ts             # NEW: buildDivisionsById() + resolveDivisionName() helpers (mirrors lib/conferences.ts / lib/teams.ts)
└── App.tsx                      # MODIFIED: pass divisionsById (built from existing `divisions` import) into <Leaderboard>

tests/
├── unit/
│   └── divisions.test.ts        # NEW: unit tests for the divisionId -> name lookup helper
└── integration/
    └── leaderboard.test.tsx     # MODIFIED: assert Division column header + per-row division name render
```

**Structure Decision**: Existing single-project frontend layout (`src/`, `tests/`) is reused as-is. This feature adds one new small pure-function lookup module (`src/lib/divisions.ts`) following the exact `src/lib/conferences.ts` / `src/lib/teams.ts` convention, and modifies the existing `Leaderboard` table rendering and its `App.tsx` caller — no new component, no new data file, no new page.

## Complexity Tracking

*No violations — table omitted.*
