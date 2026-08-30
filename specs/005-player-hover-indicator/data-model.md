# Data Model: Player Name Hover Indicator

No new persisted data, config, or entity is introduced by this feature —
it is a purely presentational addition to existing client-side render state.

## Entities (presentational only, no persistence)

### Hover Progress Indicator (UI element, not a data entity)

Not a data entity in the traditional sense (no fields, no storage, no
identity beyond "currently hovered player, if any"). Documented here per
the spec's Key Entities section for traceability:

- **Represents**: whether a hover hold is currently in progress for a given
  player's name, and therefore whether the progress cue should render.
- **Derived from existing state**: `Leaderboard.tsx` already tracks
  `dialogOpenForPlayerId` (which player's dialog, if any, is open) and a
  `timerRef` (whether a hold timer is pending). The indicator's visibility
  is a pure function of "a hold timer is pending for this player and its
  dialog is not yet open" — no new state variable is required beyond what
  already exists, or (if needed for clarity) one additional
  `hoveringPlayerId: string | null` state value mirroring the existing
  `dialogOpenForPlayerId` pattern.
- **Lifecycle**: appears on `mouseenter` of a player's name; disappears on
  either (a) `mouseleave` before the 1-second hold completes, or (b) the
  hold completing and the roster dialog opening. It never coexists with an
  open dialog for the same player (FR-004).
- **Cardinality**: at most one active indicator at a time, matching the
  existing "only one dialog open at a time" invariant from feature 003.

## No changes to existing entities

- `Player`, `Division`, `LeaderboardEntry` (from `src/types/league.ts`) are
  unchanged — this feature reads no new fields from them.
