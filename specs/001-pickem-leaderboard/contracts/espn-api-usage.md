# Contract: ESPN Unofficial API Usage (consumed, not owned)

The app depends on ESPN's unofficial site API as its sole source of live
game-result truth — winner, loser, and completion status only (FR-011,
constitution III). Conference membership does **not** come from ESPN; see
[conferences-schema.md](./conferences-schema.md) and research.md §2a. This
is not an API the app exposes — it documents the external contract
`src/lib/espn.ts` relies on, since it directly shapes `Game` fields in
[data-model.md](../data-model.md).

## Endpoint used

### Team schedule (one call per distinct owned team — research.md §2)

```
GET https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams/{teamId}/schedule
```

Example: `.../teams/59/schedule` for Georgia Tech. Returns `events[]` for
the season, each with:
- `id` — used as `Game.id`
- `competitions[0].competitors[]` — two entries (`homeAway: "home" | "away"`),
  each with `team.id` (or `team.abbreviation`) → `Game.homeTeamId` /
  `Game.awayTeamId`
- `competitions[0].status.type.completed` — boolean → `Game.completed`
- `competitions[0].competitors[].winner` — boolean, present once completed →
  derives `Game.winnerTeamId` / `Game.loserTeamId`
- `week.number` → `Game.week`

Only the distinct set of team ids across every player's `ownedTeamIds`
(deduplicated) needs its own schedule fetched — not every FBS team.

This is the **only** ESPN endpoint the app calls. The team-detail endpoint
(`.../teams/{teamId}`) was used in an earlier version to derive conference
membership but is no longer called at all — see research.md §2a for why
that was replaced with the hardcoded list in
[conferences-schema.md](./conferences-schema.md).

## Failure handling (implements FR-015 / research.md §6)

- No API key, no published rate limit or SLA — this is an unofficial,
  publicly reachable endpoint with no support contract.
- Client code MUST treat any non-200 response, network error, or a response
  missing expected fields (for any of the per-team schedule fetches) as a
  failure and fall back to the cached last-known-good computed scores
  (research.md §6) rather than throwing an unhandled error to the user.
- Conference-lookup failures are not possible via this path — conference
  data comes from the hardcoded, always-available `conferences.ts`, never
  from a network call.

## Out of scope

- The team-detail endpoint entirely — superseded by the hardcoded
  conference list (FR-019, research.md §2a).
- Any ESPN endpoint beyond team schedule (e.g., play-by-play, odds,
  rankings) — not needed for win/loss determination.
- Historical-season calls — out of scope per FR-016 (current season only).
- League-wide weekly scoreboard scanning — superseded by per-owned-team
  schedule fetches (research.md §2); not needed under the team-ownership
  model.
