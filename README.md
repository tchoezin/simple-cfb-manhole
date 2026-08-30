# cfb-manhole

A single-page college football pick'em leaderboard. Each player owns a fixed
roster of 10 FBS teams for the season; the leaderboard ranks every player by
points earned when their owned teams win, per the rules in
[specs/001-pickem-leaderboard/spec.md](specs/001-pickem-leaderboard/spec.md).

No backend: the app is a static TypeScript + React bundle that fetches live
results directly from ESPN's unofficial site API in the browser.

## Development

```bash
npm ci           # install exact versions from package-lock.json
npm run dev      # start the Vite dev server
npm run test     # run the Vitest suite
npm run build    # produce a static production build in dist/
npm run lint     # lint the codebase
```

## Season-start admin workflow (manual roster entry)

Player rosters are fixed for the whole season, so this is normally a
one-time setup before the season begins — see
[`src/data/league.ts`](src/data/league.ts):

1. Add each division to `divisions`.
2. Add each player to `players`, with their `divisionId` and their
   `ownedTeamIds` — exactly 10 ESPN team ids/abbreviations each.
3. Double-check no two players *in the same division* share a team id (the
   same team id is fine across different divisions).
4. Commit and deploy the static build — there is no in-app admin UI or
   runtime data file; this file *is* the league's data.

Full details, including how to look up an ESPN team id and how the scoring
rules work, live in
[specs/001-pickem-leaderboard/quickstart.md](specs/001-pickem-leaderboard/quickstart.md).

## Deployment

`npm run build` outputs a static bundle to `dist/`. Deploy it to any static
host (GitHub Pages, Netlify, Vercel static hosting, etc.) — no server
process is required.
