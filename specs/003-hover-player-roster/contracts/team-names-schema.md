# Contract: Team Name Data (manually maintained)

This is a new file the league administrator (or a developer) edits by hand,
alongside `league.ts` and `conferences.ts`, per FR-005. It lives in
`src/data/teams.ts` and is the **sole** source of human-readable team
display names — the app never fetches team names from ESPN or any other
live source (see [research.md §4](../research.md#4-resolving-team-ids-to-team-names-for-display-fr-005)
for why).

## Shape

```ts
// src/data/teams.ts
import type { TeamName } from "../types/league";

export const teamNames: TeamName[] = [
  { id: "59", name: "Georgia Tech" },
  { id: "333", name: "Alabama" },
  // ...
];
```

`TeamName` is defined in `src/types/league.ts`. Team ids are the same ESPN
numeric team ids used in `league.ts`'s `ownedTeamIds` and in
`conferences.ts`'s `teamIds` — e.g. `"59"` is Georgia Tech in every file.

## Rules a valid `teams.ts` must follow

1. `id` unique across all entries (one name per id).
2. Every team id that appears in any player's `ownedTeamIds`
   (`src/data/league.ts`) SHOULD have a corresponding entry here. This is a
   data-entry contract, not runtime-validated (mirrors
   `conferences-schema.md` rule 2 and `league-data-schema.md`'s treatment
   of `ownedTeamIds`) — Simplicity First means no admin UI validates this.
3. A team id referenced in a player's roster but absent from `teams.ts` is
   not an error: `resolveTeamNames` (`src/lib/teams.ts`) falls back to
   displaying the raw id string for that entry instead of throwing or
   blanking the dialog (see spec Edge Cases — an incomplete roster must
   still render a usable dialog).
4. This file is purely a display concern. It has no bearing on scoring,
   conference membership, or division uniqueness — do not read from it in
   `src/lib/scoring.ts` or `src/lib/conferences.ts`.

## How this contract is exercised in tests

`tests/unit/teams.test.ts` covers:
- `buildTeamNamesById` produces a correct `id -> name` map from a sample list.
- `resolveTeamNames` maps a list of ids to names in the same order.
- `resolveTeamNames` falls back to the raw id for an id with no matching entry.
