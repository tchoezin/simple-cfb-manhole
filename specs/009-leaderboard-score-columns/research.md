# Phase 0 Research: Leaderboard Win-Breakdown Columns

No `NEEDS CLARIFICATION` markers were left in the spec, and no new
technology, library, or architectural pattern is required — this feature
extends existing, already-decided patterns. Research below records the
decisions made in reusing that existing design.

## Decision: Compute win-tier counts inside `computeLeaderboard`

- **Decision**: Extend the per-player loop in `computeLeaderboard`
  (`src/lib/scoring.ts`) to tally a count per point value (3/2/1) using the
  return value of the existing `scorePlayerGame`, alongside the existing
  running `total`.
- **Rationale**: `scorePlayerGame` already returns exactly `0 | 1 | 2 | 3`
  per game and is already called once per (player, game) pair to build
  `total`. Counting by tier there is a one-line addition per iteration with
  no new traversal, no new data source, and guarantees the breakdown always
  agrees with `total` (constitution III — deterministic scoring; also
  spec SC-002).
- **Alternatives considered**: A separate post-processing pass over
  `entries` re-deriving counts from `total` alone — rejected, since a single
  `total` cannot be decomposed back into tier counts (multiple tier
  combinations can sum to the same total).

## Decision: Represent counts as plain fields on `LeaderboardEntry`

- **Decision**: Add `threePointWins`, `twoPointWins`, `onePointWins`, and
  `totalWins` as sibling fields on `LeaderboardEntry` (`src/types/league.ts`),
  not a nested object.
- **Rationale**: Matches the existing flat shape of `LeaderboardEntry`
  (`player`, `total`, `rank`) and constitution I (Simplicity First) — no
  benefit to nesting for four integers consumed directly by one table.
- **Alternatives considered**: A nested `winsByTier: { 3: number, 2: number,
  1: number }` map — rejected as unnecessary indirection for a fixed,
  known set of three tiers plus a derived total.

## Decision: Render as four additional table columns, no new component

- **Decision**: Add four `<th>`/`<td>` pairs to the existing table markup
  in `src/components/Leaderboard.tsx`, after the existing Score column.
- **Rationale**: The whole application is constitutionally one page/one
  table (constitution I, "Single page"); the existing table already renders
  one row per player with computed fields. No new component is justified
  for four more numeric cells.
- **Alternatives considered**: A separate "breakdown" sub-table or
  expandable row — rejected as unrequested complexity beyond the plain
  four-column ask in the spec.
