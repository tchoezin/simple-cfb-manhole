# Phase 1 Data Model: Leaderboard Win-Breakdown Columns

## `LeaderboardEntry` (extended)

Existing shape (`src/types/league.ts`):

```ts
export interface LeaderboardEntry {
  player: Player;
  total: number;
  rank: number;
}
```

Extended shape:

```ts
export interface LeaderboardEntry {
  player: Player;
  total: number;
  rank: number;
  /** Count of the player's wins scored at 3 points (rivalry/cannibalization). */
  threePointWins: number;
  /** Count of the player's wins scored at 2 points (same-conference). */
  twoPointWins: number;
  /** Count of the player's wins scored at 1 point (default). */
  onePointWins: number;
  /** threePointWins + twoPointWins + onePointWins. */
  totalWins: number;
}
```

**Validation rules** (enforced by construction in `computeLeaderboard`, not
runtime checks — constitution I, no admin/validation UI):

- `totalWins === threePointWins + twoPointWins + onePointWins` always
  (spec SC-001).
- `total === 3 * threePointWins + 2 * twoPointWins + 1 * onePointWins`
  always (spec SC-002), since both are derived from the same per-game
  `scorePlayerGame` calls.
- All four fields are non-negative integers; each is `0` for a player with
  no wins in that tier (spec edge case, FR-001–FR-004).

**Relationships**: Unchanged — still one entry per `Player`, still ranked
by `total` only (`rank` computation in `computeLeaderboard` is untouched;
the new fields are display-only and never feed sorting, per spec's Edge
Cases section).

## `computeLeaderboard` (extended)

No new parameters. Per-player loop already computes `total` by summing
`scorePlayerGame(...)` over every finished, deduplicated game the player's
teams played. Extended to also increment one of three counters based on
that same per-game return value (`3 | 2 | 1`, or skip on `0`), then set
`totalWins` as their sum on the resulting entry.
