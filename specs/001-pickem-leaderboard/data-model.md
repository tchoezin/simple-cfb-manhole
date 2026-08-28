# Phase 1 Data Model: Pick'em Leaderboard

Entities as defined in [spec.md](./spec.md#key-entities), refined with fields
and relationships for implementation. All types live in `src/types/league.ts`
unless noted; none of these are persisted server-side (constitution II) —
`Player`/`Division`/ownership data is source code (`src/data/league.ts`,
FR-012), `Team.conferenceId` is source code too (`src/data/conferences.ts`,
FR-019), `Game` data (and only `Game` data) is fetched live from ESPN, and
`Score` is derived.

## Player

Represents one league member.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Stable, unique identifier (e.g., a slug) |
| `name` | `string` | Display name shown on the leaderboard |
| `divisionId` | `string` | References `Division.id`; every player belongs to exactly one division (FR-009) |
| `ownedTeamIds` | `string[]` | The player's fixed roster of ESPN team ids for the season — exactly 10 entries (FR-018) |

**Validation rules**:
- `id` unique across all players.
- `divisionId` must reference an existing `Division`.
- `ownedTeamIds` has exactly 10 entries, no duplicates within one player's
  own roster.
- No two players who share the same `divisionId` may have overlapping
  `ownedTeamIds` (FR-017 — uniqueness is per division only; the same team id
  MAY appear in `ownedTeamIds` for players in *different* divisions).

## Division

A group of players used only to determine rivalry-bonus eligibility and to
scope team-ownership uniqueness (FR-006, FR-009, FR-017) — never used to
filter or segment the leaderboard display.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Stable, unique identifier |
| `name` | `string` | Human-readable label (not shown as a leaderboard grouping, per FR-002/FR-009, but useful for admin data-entry clarity) |

**Validation rules**:
- `id` unique across all divisions.
- A division may contain a single player (Edge Cases: rivalry bonus simply
  never triggers for that player's owned teams).

## Team

An FBS college football team, identified by its ESPN team id. Conference
membership is manually entered in `src/data/conferences.ts` (FR-019) — not
fetched from ESPN; *ownership* of a team is derived from
`Player.ownedTeamIds`, not stored directly on `Team`.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | ESPN team id (e.g., `"59"` for Georgia Tech) |
| `conferenceId` | `string` | From the hardcoded conference list (`src/data/conferences.ts`), not ESPN |

**Derived relationship**: a team's owner(s) are computed by scanning
`players` for any whose `ownedTeamIds` includes this team's `id` — there may
be zero owners, or up to one owner per division (FR-017). A team's
`conferenceId` is computed by scanning `conferences` (see below) for the
entry whose `teamIds` includes this team's `id`.

## Conference (manually maintained, `src/data/conferences.ts`)

The hardcoded source of truth for conference membership (FR-019). Not
fetched from ESPN — see research.md §2a for why.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Stable, unique identifier (e.g., a slug like `"sec"`) |
| `name` | `string` | Human-readable label (admin data-entry clarity) |
| `teamIds` | `string[]` | ESPN team ids belonging to this conference |

**Validation rules**:
- `id` unique across all conferences.
- A team id should appear in at most one conference's `teamIds` (a team
  can't validly belong to two conferences at once); this is a data-entry
  contract, not runtime-enforced, mirroring `league-data-schema.md`'s
  approach to `ownedTeamIds` uniqueness.
- A team id used anywhere in `league.ts` (`ownedTeamIds`) that has no entry
  in any conference's `teamIds` resolves to an unknown conference at
  scoring time — `scorePlayerGame` treats that as never matching the
  same-conference bonus (FR-005), never as an error.

## Game

One college football matchup, sourced from an owned team's ESPN schedule
endpoint at load time (FR-011, research.md §2) — not manually entered.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | ESPN event id |
| `week` | `number` | Season week number |
| `homeTeamId` | `string` | ESPN team id |
| `awayTeamId` | `string` | ESPN team id |
| `completed` | `boolean` | Whether the game has finished (FR-008) |
| `winnerTeamId` | `string \| null` | Set only when `completed` is `true` |
| `loserTeamId` | `string \| null` | Set only when `completed` is `true` |

**Validation rules**:
- `winnerTeamId`/`loserTeamId` are `null` unless `completed` is `true`
  (Edge Cases: cancelled/postponed games award no points).
- `winnerTeamId` and `loserTeamId` are each one of `homeTeamId`/`awayTeamId`.
- Deduplicated across all owned teams' schedules before scoring (the same
  game can appear in two different owned teams' schedules when both
  competitors are owned).

## Score (derived, not stored as source data)

The computed result of applying the point rules to one player's owned
teams' finished games. Recomputed on every page load (FR-014); the *result*
(not raw API data) is what gets cached to `localStorage` for the stale-data
fallback (FR-015, research.md §6).

| Field | Type | Notes |
|---|---|---|
| `playerId` | `string` | References `Player.id` |
| `total` | `number` | Sum of per-game points (FR-003) |
| `computedAt` | `string` (ISO timestamp) | Used to render the "as of" time in the stale-data notice |

### Scoring function (pure, `src/lib/scoring.ts`)

```text
# Build once per load, from src/data/league.ts:
divisionOwnership: Map<divisionId, Map<teamId, playerId>>
  — for each player, for each team in their ownedTeamIds,
    divisionOwnership[player.divisionId][teamId] = player.id

# Build once per load, from src/data/conferences.ts (not from ESPN — FR-019):
teams: Map<teamId, Team>
  — for each conference, for each teamId in its teamIds,
    teams[teamId] = { id: teamId, conferenceId: conference.id }

scorePlayerGame(player, game, teams, divisionOwnership) -> 0 | 1 | 2 | 3
  if game not completed: 0
  if game.winnerTeamId not in player.ownedTeamIds: 0
  else:
    winnerConf = teams[game.winnerTeamId].conferenceId
    loserConf  = teams[game.loserTeamId].conferenceId
    rivalOwnerId = divisionOwnership[player.divisionId].get(game.loserTeamId)
    if rivalOwnerId is not None and rivalOwnerId !== player.id:
      return 3                          # FR-006, overrides conference bonus
    elif winnerConf === loserConf:
      return 2                          # FR-005
    else:
      return 1                          # FR-004
```

`computeLeaderboard(players, divisions, teams, gamesByOwnedTeam)` gathers,
per player, the deduplicated set of finished games won by any team in their
`ownedTeamIds`, sums `scorePlayerGame` across them, and returns players
sorted by `total` descending, with tied totals sharing rank (FR-010,
standard competition ranking: `1, 2, 2, 4, ...`). Because ownership is
evaluated per player independently (FR-004's note on multiple owners across
divisions), no special-casing is needed when the same team is owned in more
than one division — each owning player's score is computed from their own
`ownedTeamIds` and their own division's rivalry lookup.

## Relationships

```text
Division 1 ── * Player
Player   1 ── * ownedTeamIds (team ids; a given team id may recur across
                players in *different* divisions, but not within one division)
Team     1 ── * Game (as home or away competitor)
Player   1 ── 1 Score   (derived, one computed total per player)
```
