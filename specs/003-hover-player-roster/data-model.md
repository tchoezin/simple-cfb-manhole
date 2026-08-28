# Phase 1 Data Model: Player Roster Hover Preview

This feature adds one new static data concept (team display names) and one new ephemeral UI-state concept (hover/dialog state). It does not modify `Player`, `Division`, `Conference`, `Game`, `Score`, or the scoring engine.

## New: Team Name Lookup (static, checked-in data)

Represents the human-readable display name for a team, addressable by the same ESPN team id already used everywhere else in the codebase (`Player.ownedTeamIds`, `Conference.teamIds`, `Team.id`).

**Source of truth**: `src/data/teams.ts` — a hardcoded `Record<string, string>` (or array of `{ id, name }`, see contract), manually maintained by the league administrator, mirroring `src/data/conferences.ts`.

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | ESPN numeric team id (as a string) — same id space as `Team.id` / `Player.ownedTeamIds` entries |
| `name` | `string` | Human-readable team name (e.g., `"Georgia Tech"`) |

**Validation rules**:
- Every team id that appears in any `Player.ownedTeamIds` across `src/data/league.ts` SHOULD have a corresponding entry (diagnostic check, not runtime-enforced — matches the existing `findConferenceCollisions` "diagnostic only" precedent in `src/lib/conferences.ts`).
- Ids are unique within the list (one name per id).

**Derived helper** (`src/lib/teams.ts`):
- `buildTeamNamesById(teams: TeamName[]): Map<string, string>` — same shape/spirit as `buildTeamsById` in `src/lib/conferences.ts`.
- `resolveTeamNames(teamIds: string[], namesById: Map<string, string>): string[]` — maps a player's `ownedTeamIds` to display names; a missing id falls back to the raw id string (never throws, never blanks — keeps the dialog rendering even with incomplete data, per spec Edge Cases).

## New: Roster Hover State (ephemeral, client-only UI state — not persisted, not a domain entity)

Owned entirely inside the `Leaderboard` component's React state; never serialized, never part of `LeaderboardResult` or the cache in `src/lib/cache.ts`.

| Field | Type | Notes |
|---|---|---|
| `hoveredPlayerId` | `string \| null` | The player whose name is currently the active hover target; `null` when nothing is hovered |
| `dialogOpenForPlayerId` | `string \| null` | The player whose dialog is currently rendered; set only after the 1s threshold elapses; `null` closes/hides the dialog |
| *(internal)* timer handle | `ReturnType<typeof setTimeout> \| null` | Held in a `useRef`, not state (doesn't need to trigger re-render); cleared on leave, unmount, or re-entry |

**Transitions** (see spec Acceptance Scenarios 1–5 and Edge Cases):

1. `null` → (`onMouseEnter` on a name wrapper) → timer started, state unchanged until threshold.
2. timer running → (`onMouseLeave` before 1s) → timer cleared, state returns to `null` (no dialog opened) — Acceptance Scenario 3.
3. timer running → (1000ms elapses, pointer still over the wrapper) → `dialogOpenForPlayerId` set to that player — Acceptance Scenario 1.
4. `dialogOpenForPlayerId = X` → (`onMouseLeave` fires on the wrapper containing both name and dialog) → `dialogOpenForPlayerId` set to `null` — Acceptance Scenario 2, FR-004.
5. `dialogOpenForPlayerId = X` → (pointer moves onto a *different* player's name wrapper) → previous wrapper's `onMouseLeave` fires first (closes X's dialog), new wrapper's `onMouseEnter` starts a fresh timer for the new player — Acceptance Scenario 4, FR-008.
6. Pointer moves from the name onto the open dialog (still inside the same wrapper) → no `onMouseLeave` fires on the wrapper at all → dialog remains open — Acceptance Scenario 5, FR-010 (Clarification Q1).

This is intentionally *not* modeled as a data entity with persistence, validation, or a schema doc — it is transient DOM-interaction state local to one component, matching Simplicity First.
