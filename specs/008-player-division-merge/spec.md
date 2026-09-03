# Feature Specification: Merge Division into Player Column

**Feature Branch**: `008-player-division-merge`
**Created**: 2026-09-02
**Status**: Draft
**Input**: User description: "Remove the Division column. Change the Player column to Player(Division) and update the values in the column so Red would be Red(4) and Ian would be Ian(2)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View player with division inline (Priority: P1)

A league member viewing the leaderboard wants to see which division a player belongs to without scanning a separate column, so the player's name and division are shown together in one place.

**Why this priority**: This is the entire scope of the feature — without it, nothing has changed.

**Independent Test**: Load the leaderboard and confirm each row's player cell reads as the player's name followed by their division in parentheses (e.g., "Red(4)"), and that no separate Division column exists.

**Acceptance Scenarios**:

1. **Given** the leaderboard is displaying players, **When** a user views a row for player "Red" who belongs to division "4", **Then** the Player column cell reads "Red(4)".
2. **Given** the leaderboard is displaying players, **When** a user views a row for player "Ian" who belongs to division "2", **Then** the Player column cell reads "Ian(2)".
3. **Given** the leaderboard table header, **When** a user inspects the column headers, **Then** there is a single header labeled "Player(Division)" and no separate "Division" header.
4. **Given** a user hovers over a player's name to preview their roster, **When** the hover interaction is triggered on the combined "Name(Division)" text, **Then** the existing roster-preview dialog behavior continues to work unchanged.

---

### Edge Cases

- What happens when a player's division cannot be resolved to a display value? The combined cell falls back to showing the player's name with the raw division id in parentheses (matching the existing fallback behavior for the Division column), e.g. "Red(division-4)".
- Sorting, ranking, and scoring calculations that depend on `divisionId` are unaffected — this feature only changes how division is displayed, never how it is used to compute standings.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The leaderboard MUST NOT render a separate "Division" column.
- **FR-002**: The leaderboard's player column header MUST read "Player(Division)".
- **FR-003**: Each row's player cell MUST display the player's name immediately followed by their division's display value in parentheses, with no space between the name and the opening parenthesis (e.g., "Red(4)").
- **FR-004**: The division value shown in parentheses MUST use the same resolution and fallback rules previously used for the standalone Division column (resolved display name, or the raw division id if unresolvable).
- **FR-005**: The existing roster-hover-preview interaction (hovering a player's name to open a dialog of owned teams) MUST continue to function for the combined "Name(Division)" cell, unchanged in trigger area, timing, and dialog content.
- **FR-006**: Removing the Division column MUST NOT change the underlying leaderboard ranking, scoring, or data — this is a display-only change.

### Key Entities

- **Player**: Existing entity: has a name and a `divisionId`. No changes to this entity; only how its fields are presented together in the leaderboard's Player column changes.
- **Division**: Existing entity: has an id and a display name, used to resolve the value shown in parentheses.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of leaderboard rows display division information inline within the Player column, with zero separate Division column present.
- **SC-002**: A user scanning the leaderboard can identify a player's division without looking at a second column, verified by the combined header "Player(Division)" and per-row values like "Red(4)" and "Ian(2)".
- **SC-003**: The roster-hover-preview interaction remains fully functional after the change, with no regression in existing hover/dialog behavior.

## Assumptions

- The "Red(4)" / "Ian(2)" format means: player name, immediately followed by an opening parenthesis, the division's display value, and a closing parenthesis — no separating space.
- The division display value used inside the parentheses is the same resolved value the old Division column showed (e.g., division name "4"), not the internal division id (e.g., "division-4"), except when resolution fails, per the existing fallback rule.
- No other leaderboard columns (e.g., score, rank) are affected by this change.
