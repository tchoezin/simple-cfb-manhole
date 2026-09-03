# Implementation Plan: Merge Division into Player Column

**Branch**: `008-player-division-merge` | **Date**: 2026-09-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-player-division-merge/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Remove the leaderboard's standalone "Division" column and fold its value into
the Player column: the header becomes "Player(Division)" and each cell
renders as `Name(Division)` with no space (e.g. `Red(4)`, `Ian(2)`), reusing
the existing `resolveDivisionName` lookup and its raw-id fallback. Purely a
change to `src/components/Leaderboard.tsx`'s JSX (one `<th>` removed, one
`<th>` label changed, one `<td>` removed, one `<td>`'s content composed
with the division text) — no changes to data, scoring, ranking, or the
roster-hover-preview interaction, which continues to wrap the same name
text.

## Technical Context

**Language/Version**: TypeScript 5.6, React 18.3
**Primary Dependencies**: React 18 (existing); no new dependencies
**Storage**: N/A — static/config data (`src/data/league.ts`), no persistence change
**Testing**: Vitest + @testing-library/react (existing `tests/integration/leaderboard.test.tsx` suite)
**Target Platform**: Browser (Vite-built static SPA)
**Project Type**: Single-page frontend (Option 1: single project)
**Performance Goals**: N/A — no measurable perf impact from a text/markup change
**Constraints**: Display-only change; must not alter scoring/ranking/data flow (constitution III); must preserve existing roster-hover-preview trigger area and timing
**Scale/Scope**: One component file (`Leaderboard.tsx`) + its test file; touches no other module

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Simplicity First**: PASS. This removes a column and composes two
  already-available strings (`entry.player.name`,
  `resolveDivisionName(...)`) into one cell — no new abstraction, dependency,
  or config surface added; if anything the table gets one column simpler.
- **II. Frontend-Only, TypeScript + React**: PASS. Change is confined to an
  existing React/TypeScript component; no backend, server, or persistence
  introduced.
- **III. Deterministic Scoring from Live Data**: PASS. `divisionId` keeps
  feeding the rivalry-bonus scoring exactly as before (src/lib/scoring.ts is
  untouched); this feature only changes how the division is *displayed*, via
  the same `resolveDivisionName` function already used for the old Division
  column — no new data source, no change to how scores are computed.
- **Single page**: PASS. Still one leaderboard page, still one combined,
  unranked-by-division list.

No violations. Complexity Tracking section not needed.

## Project Structure

### Documentation (this feature)

```text
specs/008-player-division-merge/
├── plan.md              # This file (/speckit.plan command output)
├── data-model.md         # Phase 1 output (/speckit.plan command)
├── quickstart.md         # Phase 1 output (/speckit.plan command)
└── tasks.md              # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

No `research.md` — Technical Context has no NEEDS CLARIFICATION items and
no new technology/pattern decisions to research; this is a same-stack,
same-pattern UI edit. No `contracts/` — the leaderboard is a page, not a
library or service with an external interface contract.

### Source Code (repository root)

```text
src/
├── components/
│   ├── Leaderboard.tsx          # MODIFIED: header + row markup (this feature)
│   ├── Leaderboard.css          # unchanged (no new classes needed)
│   └── RosterPreviewDialog.tsx  # unchanged
├── lib/
│   └── divisions.ts             # unchanged — resolveDivisionName reused as-is
├── types/
│   └── league.ts                # unchanged
└── data/
    └── league.ts                 # unchanged — existing division/player data

tests/
└── integration/
    └── leaderboard.test.tsx     # MODIFIED: assertions updated for merged column
```

**Structure Decision**: Single-project frontend (existing `src/` layout,
Option 1). No new files, directories, or modules — the change lives entirely
inside the existing `Leaderboard` component and its test file.

## Complexity Tracking

> No Constitution Check violations — section not applicable.
