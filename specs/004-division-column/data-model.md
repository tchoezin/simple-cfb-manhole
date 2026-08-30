# Phase 1 Data Model: Leaderboard Division Column

This feature introduces **no new data entities**. It reads two fields that already exist:

- `Player.divisionId` (`src/types/league.ts`) — already present, already unique-per-division-owned-teams source of truth.
- `Division.id` / `Division.name` (`src/types/league.ts`, populated by `src/data/league.ts`'s `divisions` array) — already the single Division 1 entry (`name: "1"`, kept short since it renders directly under the "Division" column header), already consumed by `computeLeaderboard`'s rivalry-bonus logic.

No changes to `Player`, `Division`, `Team`, `Conference`, `Game`, `Score`, `LeaderboardEntry`, or `LeaderboardResult` types are required — `LeaderboardEntry.player.divisionId` is already available to the `Leaderboard` component via the existing `entries` prop.

## New: Division Name Lookup (pure helper, no new stored data)

Mirrors `buildTeamsById` (`src/lib/conferences.ts`) and `buildTeamNamesById`/`resolveTeamNames` (`src/lib/teams.ts`).

**Source of truth**: `divisions: Division[]` from `src/data/league.ts` (unchanged, already exists).

`src/lib/divisions.ts` (new file):

| Function | Signature | Behavior |
|---|---|---|
| `buildDivisionsById` | `(divisions: Division[]) => Map<string, Division>` | Builds an `id -> Division` map, one entry per division. |
| `resolveDivisionName` | `(divisionId: string, divisionsById: Map<string, Division>) => string` | Returns `divisionsById.get(divisionId)?.name`, falling back to the raw `divisionId` string if not found (never throws, never returns blank — satisfies spec FR-005 / Edge Cases, same fallback contract as `resolveTeamNames`). |

**Validation rules**:
- No new validation needed — `Player.divisionId` referential integrity is already assumed by the existing scoring engine (`computeLeaderboard`), which already looks up `divisionId` against the same `divisions` array for the rivalry bonus. `resolveDivisionName`'s fallback exists purely as defensive UI behavior for the edge case, not as new data validation.

## Modified: `Leaderboard` component props

`LeaderboardProps` (`src/components/Leaderboard.tsx`) gains one new optional prop, matching the existing `teamNamesById?: Map<string, string>` convention:

| Field | Type | Notes |
|---|---|---|
| `divisionsById` | `Map<string, Division> \| undefined` | Passed from `App.tsx`, built once via `buildDivisionsById(divisions)`. Defaults to an empty map (column falls back to raw `divisionId` per row) so existing callers/tests that don't pass it keep working — same defaulting pattern already used for `teamNamesById`. |

No other component, hook, or ephemeral UI state is introduced — the Division column is a plain synchronous render, not an interactive/stateful element like the roster hover dialog.
