# Phase 0 Research: Leaderboard Division Column

No items in Technical Context were marked `NEEDS CLARIFICATION` — this feature reuses data and patterns already established in the codebase. Documented here for traceability.

## Decision: Reuse existing `Division` data, no new data file

**Decision**: Resolve the display name from the existing `divisions: Division[]` array in `src/data/league.ts` (already the source of truth used by `computeLeaderboard`'s rivalry-bonus logic). No new data file is created.

**Rationale**: `Division.name` (`"Division 1"`) already exists and is already checked-in, admin-maintained data (per constitution III, division assignments are project-owned config). Adding a second copy of division names elsewhere would violate Simplicity First.

**Alternatives considered**:
- New `src/data/divisionNames.ts` file — rejected: duplicates data already in `src/data/league.ts` for no benefit (unlike `teams.ts`, which was needed because `Team` previously had no `name` field at all).

## Decision: Lookup-map helper pattern, mirroring `buildTeamsById` / `buildTeamNamesById`

**Decision**: Add `src/lib/divisions.ts` with `buildDivisionsById(divisions: Division[]): Map<string, Division>` and `resolveDivisionName(divisionId: string, divisionsById: Map<string, Division>): string`, matching the exact shape of `buildTeamNamesById`/`resolveTeamNames` in `src/lib/teams.ts` and `buildTeamsById` in `src/lib/conferences.ts`.

**Rationale**: Consistency with two already-established precedents in this codebase; `resolveDivisionName` falls back to the raw `divisionId` (never throws, never blanks) for an unresolvable id, matching the `resolveTeamNames` fallback behavior and satisfying spec FR-005 / Edge Cases.

**Alternatives considered**:
- Inline `.find()` lookup per row in `Leaderboard.tsx` — rejected: O(n) per row instead of O(1), and breaks from the established map-lookup convention used for both conferences and team names.

## Decision: Column is additive-only, no ranking/sorting change

**Decision**: The new column is rendered from `entry.player.divisionId`; it does not touch `computeLeaderboard`, rank calculation, or the existing alphabetical tie-break — those already operate on the full `LeaderboardEntry` unaffected by any new column.

**Rationale**: Directly required by spec FR-004 and constitution's explicit rule that `Division` is "never used to filter or segment the leaderboard display."

**Alternatives considered**:
- Grouping/sub-headers per division — explicitly out of scope per spec Assumptions and constitution's single always-combined-list rule.

## Decision: Responsive/overflow handling reuses existing table pattern

**Decision**: The existing `.leaderboard-scroll` wrapper (`overflow-x` container already wrapping `<table className="leaderboard">`) already handles narrow viewports for the current 3 columns; the new 4th column relies on the same mechanism rather than introducing new responsive CSS.

**Rationale**: Simplicity First — the existing scroll container is generic and already exercised by the roster-hover feature; no evidence a 4th short text column ("Division 1") requires special-casing.

**Alternatives considered**: Column hiding below a breakpoint — rejected as unnecessary complexity absent a demonstrated overflow problem; can be revisited if real usage shows it's needed.

**Output**: All Technical Context items resolved; no `NEEDS CLARIFICATION` markers remain.
