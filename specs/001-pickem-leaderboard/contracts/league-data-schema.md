# Contract: League Data (manually maintained)

This is the "interface" the league administrator (you) edits by hand, per
FR-012/FR-018 — once at the start of the season, since rosters are fixed for
the season. It lives in `src/data/league.ts` and is the sole non-generated
input to the app besides live ESPN data. Treat it as a contract: the scoring
engine and leaderboard assume this exact shape.

## Shape

```ts
// src/data/league.ts
export const divisions: Division[] = [
  { id: "east", name: "East" },
  { id: "west", name: "West" },
  // ...
];

export const players: Player[] = [
  {
    id: "alice",
    name: "Alice",
    divisionId: "east",
    ownedTeamIds: ["gt", "clemson", "duke", /* ...exactly 10 ESPN team ids */],
  },
  {
    id: "bob",
    name: "Bob",
    divisionId: "west",
    // Note: "gt" may also appear here even though Alice (a different
    // division) already owns it — ownership is unique per division only.
    ownedTeamIds: ["gt", "usc", "oregon", /* ...exactly 10 ESPN team ids */],
  },
  // ...
];
```

`Player` and `Division` types are defined in
[data-model.md](../data-model.md) / `src/types/league.ts`. There is no
separate `Pick`/ownership-record type — a team's ownership is simply its
presence in a `Player.ownedTeamIds` array.

## Rules a valid `league.ts` must follow

1. Every `Player.divisionId` MUST match a `Division.id` in `divisions`.
2. Every `Player.ownedTeamIds` MUST have exactly 10 entries (FR-018), each a
   valid ESPN team id/abbreviation (see
   [espn-api-usage.md](./espn-api-usage.md) for how to find one).
3. No two players who share the same `divisionId` may have overlapping
   `ownedTeamIds` (FR-017). The same team id MAY appear on players in
   *different* divisions.
4. Rosters are fixed for the season — this file should not be edited to
   reassign teams mid-season (FR-018); only add players/divisions here
   before the season starts, or to fix a data-entry mistake.

## How this contract is exercised in tests

`tests/unit/scoring.test.ts` constructs small, hand-built `divisions` /
`players` / `teams` / `games` fixtures matching this exact shape (not the
real `src/data/league.ts`) to verify the scoring precedence rules — including
the same team owned by different players in different divisions — in
isolation from any live or real season data.
