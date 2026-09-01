# Implementation Plan: Remove Player Row Hover Highlight

**Branch**: `007-remove-hover-highlight` | **Date**: 2026-08-31 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/007-remove-hover-highlight/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Remove the existing `.leaderboard tbody tr:hover` background-color rule in `src/components/Leaderboard.css` so leaderboard rows no longer change appearance on mouse hover, while leaving alternating row shading and the unrelated player-name hover interactions (roster preview dialog, progress indicator) untouched.

## Technical Context

**Language/Version**: TypeScript 5.6, React 18.3
**Primary Dependencies**: React (existing `Leaderboard.tsx` / `Leaderboard.css`); no new dependencies
**Storage**: N/A (no data model involved — pure presentational CSS change)
**Testing**: Vitest + @testing-library/react (existing project test stack)
**Target Platform**: Web browser (client-side only, per constitution)
**Project Type**: Single-page frontend web app (existing structure, no new project type)
**Performance Goals**: N/A — no behavior or performance impact beyond removing a CSS rule
**Constraints**: Must not affect existing player-name hover behaviors (features 003, 005) or alternating row shading (feature 001/004)
**Scale/Scope**: Single CSS rule removal in one file; no other files expected to change

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Simplicity First**: PASS. This is a deletion, not an addition — it removes a rule rather than introducing new abstraction, dependency, or config.
- **II. Frontend-Only, TypeScript + React**: PASS. Change is scoped to existing frontend CSS; no backend, server, or persistence introduced.
- **III. Deterministic Scoring from Live Data**: N/A. This feature does not touch scoring, game results, or conference data.

No violations. No Complexity Tracking entries required.

## Project Structure

### Documentation (this feature)

```text
specs/007-remove-hover-highlight/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output — not needed (no unknowns)
├── data-model.md        # Phase 1 output — not needed (no data entities)
├── quickstart.md        # Phase 1 output — manual verification steps
├── contracts/           # Phase 1 output — not applicable (no external interface)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── Leaderboard.tsx       # No change expected — hover markup/handlers are CSS-driven
│   └── Leaderboard.css       # MODIFIED: remove `.leaderboard tbody tr:hover` rule (line 38)
└── ... (other components unaffected)

src/components/__tests__/ or src/**/*.test.tsx  # Existing test locations, per current project convention
```

**Structure Decision**: Single existing frontend project (`src/`), no new directories. The change is confined to `src/components/Leaderboard.css`; `src/components/Leaderboard.tsx` needs no markup changes since the hover highlight is a pure CSS `:hover` pseudo-class rule, not a JS-driven state.

## Complexity Tracking

*No violations — table not needed.*
