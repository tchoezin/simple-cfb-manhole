# Implementation Plan: Total-Wins Tiebreaker for Leaderboard Ranking

**Branch**: `010-total-wins-tiebreaker` | **Date**: 2026-09-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-total-wins-tiebreaker/spec.md`

## Summary

Change the leaderboard's rank-assignment rule in `computeLeaderboard`
(`src/lib/scoring.ts`) so that when two or more players have equal Score,
they are ordered by Total Wins (highest first) before falling back to the
existing alphabetical-by-name tiebreaker. Rank numbers are now assigned
based on ties in **both** Score and Total Wins together — players sharing
Score but differing in Total Wins are no longer treated as tied for rank
purposes. `totalWins` is already computed per player (added in
009-leaderboard-score-columns), so this is a pure sort/rank-grouping
change with no new computation and no rendering changes.

## Technical Context

**Language/Version**: TypeScript (React 18+, per existing repo)
**Primary Dependencies**: React, Vitest + @testing-library/react (existing)
**Storage**: N/A — leaderboard entries are derived client-side from static
data and live ESPN game results, same as today
**Testing**: Vitest (`npm test`) — unit tests for `computeLeaderboard`
covering Score ties broken by Total Wins, and full ties (Score + Total
Wins) still sharing a rank
**Target Platform**: Browser (single-page web app, client-side only)
**Project Type**: Single frontend project (Option 1 layout, `src/` + `tests/`)
**Performance Goals**: No new goals — same O(n log n) sort already
performed, just with an added comparator key
**Constraints**: Must not change Score values, the four win-tier columns,
or per-game scoring rules (constitution III); no backend, no new
dependencies (constitution I, II)
**Scale/Scope**: Same league-sized roster as today (a few dozen players);
change is confined to the sort comparator and rank-grouping logic in
`computeLeaderboard`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Simplicity First**: Pass. No new dependency, abstraction, or file.
  Adds one comparator key and adjusts the existing rank-grouping condition
  in `computeLeaderboard` — no new components or config.
- **II. Frontend-Only, TypeScript + React**: Pass. All computation stays
  client-side in the existing scoring module; no backend introduced.
- **III. Deterministic Scoring from Live Data**: Pass. No scoring rule
  changes — Score and Total Wins are computed exactly as before; only the
  ordering/rank-grouping derived from those already-deterministic values
  changes.

## Project Structure

### Documentation (this feature)

```text
specs/010-total-wins-tiebreaker/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
src/
├── lib/
│   └── scoring.ts        # computeLeaderboard sort/rank logic — only file changed
├── components/
│   └── Leaderboard.tsx   # unchanged — already renders rank + Total Wins
└── types/
    └── league.ts          # unchanged — LeaderboardEntry already has totalWins

tests/
└── (existing scoring unit tests, extended with tiebreaker cases)
```

**Structure Decision**: Single frontend project (existing layout, no
structural change). This feature touches only the sort/rank block inside
`computeLeaderboard` in `src/lib/scoring.ts`; no new files, components, or
directories are introduced.

## Complexity Tracking

*No violations — section not applicable.*
