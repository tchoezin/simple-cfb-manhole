# Quickstart: Leaderboard Division Column

## For the league administrator: adding/renaming a division

1. Open `src/data/league.ts`.
2. Add or edit an entry in the `divisions` array: `{ id: "division-2", name: "2" }`. Keep `name` short (e.g., "2", not "Division 2") since it's what renders directly in the leaderboard's Division column. Set each `Player.divisionId` to reference the right division id.
3. Save. The leaderboard's Division column picks up the new/renamed division automatically — no other file needs to change.

## For a developer: verifying the behavior manually

1. `npm run dev`, open the app in a browser.
2. Confirm the leaderboard table's columns read, left to right: Rank, Player, Division, Score (Score stays rightmost — it's the column visitors look to most).
3. Confirm every row shows "1" in that column (all current players, Division 1's short display label).
4. Confirm rank order and alphabetical tie-breaking are unchanged from before this feature.
5. Resize the window narrow — confirm the Division column stays reachable (via the existing horizontal-scroll wrapper), same as the other columns.

## Automated tests

```bash
npm run test
```

- `tests/unit/divisions.test.ts` — division-name lookup helper (`buildDivisionsById`, `resolveDivisionName`), including the unresolvable-id fallback.
- `tests/integration/leaderboard.test.tsx` — Division column header renders; each row renders the correct division name; a player with an unresolvable `divisionId` still renders a fallback value instead of a blank cell or crash.
