# Feature Specification: Leaderboard Division Column

**Feature Branch**: `004-division-column`
**Created**: 2026-08-30
**Status**: Draft
**Input**: User description: "Add a Division column to the leaderboard reflecting each player's division"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See each player's division on the leaderboard (Priority: P1)

A visitor viewing the leaderboard wants to know which division each player belongs to, without having to look it up elsewhere.

**Why this priority**: This is the entire feature — it is the only user-facing behavior requested, and it delivers the full value on its own.

**Independent Test**: Load the leaderboard and confirm a "Division" column is visible, showing each player's division name next to their existing rank/name/score data.

**Acceptance Scenarios**:

1. **Given** the leaderboard is displayed, **When** the page loads, **Then** a "Division" column header is visible in the leaderboard table.
2. **Given** the leaderboard is displayed, **When** a visitor looks at any player's row, **Then** that row shows the player's division's short display label (e.g., "1") in the Division column.
3. **Given** all current players belong to Division 1, **When** the leaderboard renders, **Then** every row's Division column reads "1".
4. **Given** the leaderboard supports sorting/ranking by other columns, **When** the Division column is added, **Then** existing rank, name, and score behavior (including alphabetical tie-breaking) is unaffected.

---

### Edge Cases

- What happens if a player's `divisionId` does not match any known division (bad/missing data)? The row should still render without crashing, showing a clear fallback (e.g., the raw id or "Unknown") rather than a blank cell.
- What happens on narrow/mobile viewports where table width is constrained? The Division column must remain visible/accessible (e.g., via responsive layout or horizontal scroll) consistent with how the rest of the leaderboard table already handles small screens.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a "Division" column in the leaderboard table.
- **FR-002**: System MUST show each player's division's short display label (not just an internal id) in that player's row — e.g., "1" for Division 1, kept short so the column doesn't clutter the row.
- **FR-003**: System MUST derive the displayed division from the player's existing division assignment (the current single Division 1, displayed as "1", for all players today), so the column stays correct if additional divisions are introduced later.
- **FR-004**: System MUST NOT change existing leaderboard ranking, sorting, or tie-breaking behavior as a result of adding this column.
- **FR-005**: System MUST render a clear fallback value for a player whose division cannot be resolved, rather than leaving the cell blank or erroring.

### Key Entities

- **Division**: An existing grouping that a Player belongs to (currently only "Division 1" exists). This feature surfaces the division's display name on the leaderboard; it does not introduce new division data.
- **Player**: A leaderboard participant, already associated with exactly one division via its existing division assignment.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of leaderboard rows display a non-blank division label.
- **SC-002**: Adding the Division column causes no change in the relative rank order of any player compared to before the column existed.
- **SC-003**: A visitor can identify any player's division at a glance, without navigating away from the leaderboard or opening any additional view.

## Assumptions

- All players currently belong to a single division, Division 1 (displayed as "1"); the column is still added now so the leaderboard is ready to display multiple divisions without further UI changes if/when more are introduced.
- Division display labels are kept short (e.g., "1" rather than "Division 1") to avoid cluttering the row — per user feedback, the word "Division" is redundant with the column header.
- The Division column is purely a display addition — it does not introduce grouping, filtering, or separate per-division rankings; sorting/ranking scope is unchanged.
- Division names are treated as already-trusted, checked-in league data (same source used for the existing division/player data), not user input.
