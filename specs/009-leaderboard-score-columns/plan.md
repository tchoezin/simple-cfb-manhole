# Implementation Plan: Leaderboard Win-Breakdown Columns

**Branch**: `009-leaderboard-score-columns` | **Date**: 2026-09-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-leaderboard-score-columns/spec.md`

## Summary

Add four columns to the existing single leaderboard table — 3 pt wins, 2 pt
wins, 1 pt wins, and Total Wins — computed by tallying, per player, how many
of their already-scored game wins fell into each point tier (rivalry=3,
same-conference=2, default=1). The existing Score column (point-weighted
total) and ranking/sort order are unchanged. The breakdown is computed by
extending `computeLeaderboard` in `src/lib/scoring.ts` to count wins per
tier per player (reusing the existing `scorePlayerGame` per-game rule), and
by rendering the four new counts as additional `<td>`s per row in
`src/components/Leaderboard.tsx`.

## Technical Context

**Language/Version**: TypeScript (React 18+, per existing repo)
**Primary Dependencies**: React, Vitest + @testing-library/react (existing)
**Storage**: N/A — leaderboard entries are derived client-side from static
data and live ESPN game results, same as today
**Testing**: Vitest (`npm test`) — unit tests for `computeLeaderboard`
win-tier counts, integration test for the new table columns
**Target Platform**: Browser (single-page web app, client-side only)
**Project Type**: Single frontend project (Option 1 layout, `src/` + `tests/`)
**Performance Goals**: No new goals — same O(games per player) computation
already performed for Score, just tallied into four counters instead of one
**Constraints**: Must not change existing Score values, rank order, or the
per-game scoring rules (constitution III); no backend, no new dependencies
(constitution I, II)
**Scale/Scope**: Same league-sized roster as today (a few dozen players);
four additional integer columns per row

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Simplicity First**: Pass. No new dependency, abstraction layer, or
  config. Extends the existing pure `computeLeaderboard` function with four
  more counters and adds four `<td>`s to the existing table — no new
  components, no new files beyond docs.
- **II. Frontend-Only, TypeScript + React**: Pass. All computation stays
  client-side in the existing scoring module; no backend introduced.
- **III. Deterministic Scoring from Live Data**: Pass. The win-tier counts
  reuse `scorePlayerGame`'s existing precedence rule unchanged (rivalry
  overrides same-conference overrides default) — no new scoring logic, so
  the breakdown is guaranteed to sum to the existing Score value for the
  same weights.

No violations. Complexity Tracking section not needed.

## Project Structure

### Documentation (this feature)

```text
specs/009-leaderboard-score-columns/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Option 1: Single project (frontend-only, matches existing repo layout)
src/
├── components/
│   └── Leaderboard.tsx      # add 4 <th>/<td> columns (3pt, 2pt, 1pt, Total Wins)
├── lib/
│   └── scoring.ts           # extend computeLeaderboard to tally win counts per tier
└── types/
    └── league.ts            # extend LeaderboardEntry with win-tier counts

tests/
└── integration/
    └── leaderboard.test.tsx # extend with assertions for the new columns
```

**Structure Decision**: Existing single-project frontend layout
(`src/{components,lib,types}` + `tests/integration`) — no new directories.
This feature only touches the three files above plus their existing tests.

## Complexity Tracking

*No violations — section not needed.*
