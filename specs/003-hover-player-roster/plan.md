# Implementation Plan: Player Roster Hover Preview

**Branch**: `003-hover-player-roster` | **Date**: 2026-08-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-hover-player-roster/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Hovering a player's name in the leaderboard table for 2 continuous seconds opens a small, non-modal dialog listing that player's owned teams by name; the dialog stays open while the pointer remains over the name or the dialog itself, and closes as soon as the pointer leaves both. This is a pure client-side UI addition to the existing single-page React leaderboard: new local component state + a `setTimeout`-based hover timer in the `Leaderboard` component, a new `RosterPreviewDialog` presentational component, and a new hardcoded `teamId → name` data file (the only genuinely new "data" this feature needs, since owned-team ids are already on `Player`).

## Technical Context

**Language/Version**: TypeScript 5.6 (strict mode), React 18.3
**Primary Dependencies**: React 18 (existing) — no new runtime dependencies added
**Storage**: N/A — team names are static, hardcoded, checked-in config (`src/data/teams.ts`), same pattern as `src/data/conferences.ts`
**Testing**: Vitest 4 + @testing-library/react (existing `tests/unit/` and `tests/integration/` split)
**Target Platform**: Browser (client-side only, evergreen desktop/laptop browsers with a mouse — touch/keyboard hover equivalents are explicitly out of scope per spec Assumptions)
**Project Type**: Single-page frontend web app (existing project, no new project/service)
**Performance Goals**: Dialog opens at the 2.000s hover mark (±1 animation frame); dialog closes within 100ms of the pointer leaving the name+dialog region (SC-002)
**Constraints**: No backend, no new dependency (constitution I & II); dialog must never render outside the viewport (FR-009); only one dialog open at a time (FR-008)
**Scale/Scope**: One existing component (`Leaderboard`) gains hover wiring; one new small presentational component; one new static data file; scope of data is dozens of teams / single-digit players (per constitution, this is a small friend-group leaderboard, not a platform)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Simplicity First**: PASS. No new dependency, no new build step. The hover timer is a plain `setTimeout`/`clearTimeout` pair in component state — no gesture/tooltip library. The new `teamId → name` file follows the exact pattern already established by `src/data/conferences.ts` (hardcoded, checked-in, admin-readable).
- **II. Frontend-Only, TypeScript + React**: PASS. Everything is client-side React/TypeScript; team names are static config, not a new fetch or server.
- **III. Deterministic Scoring from Live Data**: PASS (not applicable — this feature touches display only, not the scoring engine, game results, or conference data).
- **Additional Constraints — Single page**: PASS. The dialog is an in-page, non-modal overlay tied to hover state on the existing single leaderboard page; it does not introduce a route, view, or second page.

No violations. Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/003-hover-player-roster/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── team-names-schema.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── Leaderboard.tsx          # MODIFIED: owns hover-timer state, wires name cells to it
│   ├── Leaderboard.css          # MODIFIED: positioning context for the dialog anchor
│   ├── RosterPreviewDialog.tsx  # NEW: presentational dialog listing a player's team names
│   └── RosterPreviewDialog.css  # NEW
├── data/
│   └── teams.ts                 # NEW: hardcoded teamId -> team name lookup (mirrors conferences.ts pattern)
├── lib/
│   └── teams.ts                 # NEW: buildTeamNamesById() + resolveTeamNames() helpers (mirrors lib/conferences.ts)
└── types/
    └── league.ts                # MODIFIED: add `name` to Team, or a standalone TeamName type (decided in data-model.md)

tests/
├── unit/
│   └── teams.test.ts            # NEW: unit tests for the name-lookup helper
└── integration/
    └── leaderboard.test.tsx     # MODIFIED: hover-open, hover-close, threshold, dialog-hover-stays-open, viewport-clamp scenarios
```

**Structure Decision**: Existing single-project frontend layout (`src/`, `tests/`) is reused as-is — this feature adds one new component pair and one new small data/lib module pair, following the exact file-organization convention already established by the conferences feature (`src/data/*.ts` for hardcoded data, `src/lib/*.ts` for pure helpers over that data, colocated `.css` per component).

## Complexity Tracking

*No violations — table omitted.*
