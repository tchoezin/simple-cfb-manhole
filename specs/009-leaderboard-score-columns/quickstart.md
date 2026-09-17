# Quickstart: Leaderboard Win-Breakdown Columns

## Implementing

1. `src/types/league.ts` — add `threePointWins`, `twoPointWins`,
   `onePointWins`, `totalWins` to `LeaderboardEntry`.
2. `src/lib/scoring.ts` — in `computeLeaderboard`'s per-player loop, tally
   a counter per tier as `scorePlayerGame` is called (alongside the
   existing `total` sum), and include the four new fields when building
   each entry.
3. `src/components/Leaderboard.tsx` — add four `<th scope="col">` headers
   ("3 pt", "2 pt", "1 pt", "Total Wins") after the existing Score header,
   and four matching `<td>`s per row reading the new entry fields.

## Verifying

```bash
npm test        # extend/verify tests/integration/leaderboard.test.tsx
                 # and add a scoring.ts unit test asserting SC-001/SC-002
npm run dev      # visually confirm the four new columns render correctly
```

Manual check: for any rendered row, 3pt + 2pt + 1pt should equal Total
Wins, and 3×3pt + 2×2pt + 1×1pt should equal the existing Score column.
