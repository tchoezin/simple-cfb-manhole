# Phase 1 Data Model: Total-Wins Tiebreaker

No new entities or fields. This feature changes ordering logic over
existing data only.

## LeaderboardEntry (existing — `src/types/league.ts`)

| Field | Type | Notes |
|---|---|---|
| `player` | `Player` | unchanged |
| `total` | `number` | Score — primary sort key (unchanged meaning) |
| `rank` | `number` | **grouping rule changes**: now grouped by (`total`, `totalWins`) pair instead of `total` alone |
| `threePointWins` | `number` | unchanged |
| `twoPointWins` | `number` | unchanged |
| `onePointWins` | `number` | unchanged |
| `totalWins` | `number` | unchanged value — **new use**: secondary sort key |

## Sort / rank rule (replaces existing rule in `computeLeaderboard`)

Ordering, in precedence order:

1. `total` (Score), descending
2. `totalWins`, descending
3. `player.name`, alphabetical ascending (final stable tiebreaker)

Rank assignment: a new rank is assigned at each sorted position whose
(`total`, `totalWins`) pair differs from the previous position's; entries
sharing both values share the previous rank. This is the same
"dense-with-gaps" ranking style already in use (rank = 1-based index of
first occurrence of the (total, totalWins) group), just keyed on a pair
instead of a single value.

No changes to `Player`, `Team`, `Game`, `Division`, or any other existing
type.
