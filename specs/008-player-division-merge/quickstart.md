# Quickstart: Merge Division into Player Column

## What changes

`src/components/Leaderboard.tsx`:

1. Table header row: remove the `<th scope="col">Division</th>` cell; rename
   `<th scope="col">Player</th>` to `<th scope="col">Player(Division)</th>`.
2. Table body row: remove the standalone
   `<td>{resolveDivisionName(entry.player.divisionId, divisionsLookup)}</td>`
   cell. In the existing Player `<td>`, append the resolved division text in
   parentheses immediately after `entry.player.name`, inside the same
   `.player-name-hover` hover-trigger `<span>` so the roster-hover-preview
   interaction (hover target, timing, dialog) is unaffected — e.g. render
   `{entry.player.name}({resolveDivisionName(entry.player.divisionId, divisionsLookup)})`
   in place of the current `{entry.player.name}`.

No changes to `src/lib/divisions.ts`, `src/lib/scoring.ts`, `src/types/league.ts`,
or `src/data/league.ts`.

## Verify locally

```sh
npm run dev
```

Open the app and confirm:
- The table header reads `Rank | Player(Division) | Score` (no separate
  Division column).
- A row for a player in division "4" reads e.g. `Red(4)` in the Player cell.
- Hovering a player's name still opens the roster-preview dialog after ~1s,
  unchanged from before.

## Tests

```sh
npm run test
```

Update `tests/integration/leaderboard.test.tsx` assertions that reference the
old separate Division column/header to instead check the combined
`Player(Division)` header and `Name(Division)` cell text.
