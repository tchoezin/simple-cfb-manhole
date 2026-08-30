# Quickstart: Player Name Hover Indicator

## Manual verification

1. `npm run dev` and open the leaderboard in a browser.
2. Move the pointer over any player's name.
   - **Expect**: a small circular loading cue appears immediately next to
     the name and visibly animates/spins for about 1 second.
3. Keep the pointer held over the name for the full second.
   - **Expect**: the moment the roster preview dialog (feature 003) opens,
     the loading cue disappears — it does not linger alongside the open
     dialog.
4. Move the pointer off the name quickly (before 1 second elapses).
   - **Expect**: the cue disappears immediately and no dialog opens.
5. Move the pointer back onto the same name after leaving it.
   - **Expect**: the cue restarts from the beginning (does not resume from
     where it left off), matching feature 003's existing hover-timer
     restart behavior.
6. Move the pointer across several different player names in quick
   succession.
   - **Expect**: only the currently-hovered name ever shows the cue; no two
     names show it simultaneously.
7. Repeat with a very short name and a very long name.
   - **Expect**: the cue renders consistently next to the name regardless
     of its length.

## Automated verification

- Extend `tests/integration/leaderboard.test.tsx`:
  - Assert the indicator element is present immediately on `mouseEnter` of
    a player's name, before the fake-timer-advanced 1-second dialog delay.
  - Assert the indicator element is absent once fake timers are advanced
    past `HOVER_DELAY_MS` and the dialog is open.
  - Assert the indicator element is absent after `mouseLeave` fired before
    the delay elapses (and that no dialog opened).
  - Assert re-entering after leaving restarts the indicator (no state
    carried over — verified indirectly by re-confirming the dialog only
    opens after a fresh full delay, matching existing 003 coverage).

No new test file is needed — this extends the existing hover-interaction
coverage already in place for feature 003 in the same test file.
