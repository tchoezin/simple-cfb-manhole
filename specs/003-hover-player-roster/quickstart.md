# Quickstart: Player Roster Hover Preview

## For the league administrator: adding/fixing a team name

1. Open `src/data/teams.ts`.
2. Add or edit an entry: `{ id: "<espn-team-id>", name: "<Display Name>" }`. Use the same id already used for that team in `src/data/league.ts` / `src/data/conferences.ts`.
3. Save. No build step or restart needed beyond the normal dev server hot-reload.

## For a developer: verifying the behavior manually

1. `npm run dev`, open the app in a browser.
2. Hover the mouse over any player's name in the leaderboard and hold it still.
3. After ~1 second, a dialog should appear listing that player's teams by name.
4. Move the mouse onto the dialog itself — it should stay open.
5. Move the mouse off both the name and the dialog — it should close immediately.
6. Move the mouse quickly across several names (< 1s each) — no dialog should appear.
7. Hover a name near the right/bottom edge of the window — the dialog should reposition to stay fully on-screen.

## Automated tests

```bash
npm run test
```

- `tests/unit/teams.test.ts` — name-lookup helper (`buildTeamNamesById`, `resolveTeamNames`).
- `tests/integration/leaderboard.test.tsx` — hover-open-after-1s, no-open-before-1s, close-on-leave, stays-open-over-dialog, single-dialog-at-a-time, viewport-clamp behaviors. Use Vitest fake timers (`vi.useFakeTimers()`) to advance past the 1000ms threshold deterministically rather than real waits.
