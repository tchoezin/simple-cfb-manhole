# Quickstart: Pick'em Leaderboard

## Prerequisites

- Node.js (LTS) and npm

## Setup

```bash
npm install
npm run dev       # Vite dev server, live-reloads on save
```

Open the printed local URL — the leaderboard renders using the data in
`src/data/league.ts` and `src/data/conferences.ts`, plus live game results
fetched from ESPN.

## Season-start admin workflow (manual data entry — FR-012, FR-018)

Rosters are fixed for the whole season, so this is normally a one-time setup
before the season begins:

1. Open `src/data/league.ts`.
2. Add each division to `divisions`.
3. Add each player to `players`, with their `divisionId` and their
   `ownedTeamIds` — exactly 10 ESPN team ids each (see
   [contracts/espn-api-usage.md](./contracts/espn-api-usage.md) for how to
   look one up, e.g. `"59"` for Georgia Tech).
4. Double-check no two players *in the same division* share a team id
   (FR-017) — the same team id is fine across different divisions.
5. Commit the change and deploy the static build (per your hosting
   provider's normal deploy step) — there is no runtime admin UI or data
   file to upload separately.
6. Fix a data-entry mistake the same way (edit + redeploy) if needed;
   otherwise there's no need to touch this file again until next season.

## Conference-list admin workflow (manual data entry — FR-019)

Conference membership is a **separate** hardcoded list from the roster —
see [contracts/conferences-schema.md](./contracts/conferences-schema.md):

1. Open `src/data/conferences.ts`.
2. For every team id used anywhere in `league.ts`, make sure it appears in
   exactly one conference's `teamIds`.
3. Only touch this file when conference realignment actually happens (rare
   — a few times a decade) or to fix a data-entry mistake. It is
   deliberately **not** fetched from ESPN (constitution III) — see
   research.md §2a for why.

## Running tests

```bash
npm run test        # Vitest: scoring engine unit tests + leaderboard render tests
```

## Build for deployment

```bash
npm run build        # outputs a static bundle (e.g., dist/)
```

Deploy the build output to any static host (GitHub Pages, Netlify, Vercel
static hosting, etc.) — no server process is required (constitution II).

## Verifying the core scoring rule by hand

Given `tests/unit/scoring.test.ts` fixtures, confirm:
- An owned team wins, no conference/rivalry bonus applies → 1 point.
- An owned team wins against a same-conference opponent (no rivalry bonus)
  → 2 points.
- An owned team wins against a team owned by another player in the same
  division → 3 points (overrides the conference bonus even if it would also
  apply).
- An owned team loses, or the game hasn't finished → 0 points for that game.
- The same team is owned by different players in different divisions and
  wins → each owner scores independently, using their own division's
  rivalry check.

These map directly to spec.md's Acceptance Scenarios under User Story 2.
