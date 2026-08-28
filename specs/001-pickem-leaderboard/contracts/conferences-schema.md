# Contract: Conference Data (manually maintained)

This is the second "interface" the league administrator edits by hand
(alongside `league.ts`), per FR-019. It lives in `src/data/conferences.ts`
and is the **sole** source of conference membership — the app never fetches
conference/division data from ESPN or any other live source (constitution
III; see [research.md §2a](../research.md) for why this changed from an
earlier live-fetch approach).

## Shape

```ts
// src/data/conferences.ts
export const conferences: Conference[] = [
  { id: "acc", name: "Atlantic Coast Conference", teamIds: ["59", "150", ...] },
  { id: "sec", name: "Southeastern Conference", teamIds: ["333", "2", ...] },
  { id: "sun-belt", name: "Sun Belt Conference", teamIds: ["256", "309", ...] },
  // ...
];
```

`Conference` is defined in [data-model.md](../data-model.md) /
`src/types/league.ts`. Team ids are the same ESPN numeric team ids used in
`league.ts`'s `ownedTeamIds` (see
[league-data-schema.md](./league-data-schema.md)) — e.g. `"59"` is Georgia
Tech in both files.

## Rules a valid `conferences.ts` must follow

1. `id` unique across all conferences.
2. A team id should appear in at most one conference's `teamIds`. This is a
   data-entry contract, not runtime-validated (mirrors how
   `league-data-schema.md` treats `ownedTeamIds` uniqueness) — Simplicity
   First means no admin UI validates this; double-check by eye or with a
   quick script (`findConferenceCollisions`, mirroring
   `findDivisionOwnershipCollisions` in `src/lib/scoring.ts`) before
   deploying a change.
3. **Sub-divisions of one conference are one conference, not two.** If a
   conference splits into named divisions (e.g. a hypothetical "East"/
   "West"), list every team from every division under the single parent
   conference entry — don't create separate conference entries per
   division. (This is exactly the bug that motivated the hardcoded list in
   the first place: ESPN's own data reports some divisions as if they were
   independent conferences.)
4. A team id referenced in `league.ts` but absent from every conference's
   `teamIds` here is not an error — it simply never matches the
   same-conference bonus (FR-005) for any game it plays, since its
   conference is unresolvable. Worth double-checking as a likely omission,
   but the app won't crash on it.
5. **Independent schools each get their own unique singleton conference
   entry** (e.g. `{ id: "independent-notre-dame", teamIds: ["87"] }`) —
   never grouped together under one shared "independents" id. Independent
   schools play no conference games, so even a game between two
   independents (e.g. Notre Dame vs. UConn) must never trigger the
   same-conference bonus; a unique id per independent guarantees that by
   construction, since `conferenceId` equality never holds between two
   different unique ids.

## How this contract is exercised in tests

`tests/unit/scoring.test.ts` constructs small, hand-built `teams: Map<teamId,
Team>` fixtures directly (bypassing `conferences.ts`) to test
`scorePlayerGame`'s conference-matching logic in isolation. A separate check
against the real `src/data/conferences.ts` (team-id coverage, no
duplicates) belongs in the same place `league.ts` gets validated before
each season/realignment update.
