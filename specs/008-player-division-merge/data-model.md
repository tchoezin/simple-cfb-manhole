# Data Model: Merge Division into Player Column

No entity, field, or relationship changes. This feature is presentation-only.

## Entities (unchanged)

### Player (`src/types/league.ts`)
- `id: string`
- `name: string`
- `divisionId: string` — still resolved via `resolveDivisionName`, still
  feeds `src/lib/scoring.ts`'s rivalry-bonus logic. Unchanged.
- `ownedTeamIds: string[]`

### Division (`src/types/league.ts`)
- `id: string`
- `name: string` — the value shown in parentheses (e.g. `"4"`, `"2"`).

## Derived display value (new, presentation-only)

- **Combined player-cell text** = `` `${player.name}(${resolveDivisionName(player.divisionId, divisionsById)})` ``
  - Not a new stored field — computed inline in `Leaderboard.tsx` at render
    time from the two existing values above, exactly as the old Division
    column already computed its cell text via `resolveDivisionName`.
  - Fallback: unchanged — `resolveDivisionName` returns the raw
    `divisionId` string when no matching `Division` is found in the
    lookup map (e.g. `Red(division-4)`).

## State transitions

None — no new state, no lifecycle changes.
