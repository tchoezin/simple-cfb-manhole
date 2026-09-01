# Feature Specification: Remove Player Row Hover Highlight

**Feature Branch**: `007-remove-hover-highlight`
**Created**: 2026-08-31
**Status**: Draft
**Input**: User description: "Remove the highlighting of player row when the mouse hovers over it"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Leaderboard rows no longer change appearance on hover (Priority: P1)

A visitor viewing the leaderboard moves the mouse pointer over a player's row. Today the row's background changes color to highlight it. After this change, the row's appearance stays the same whether or not the pointer is over it.

**Why this priority**: This is the entire feature — it is the only user-facing behavior requested, and removing it fully delivers the requested value.

**Independent Test**: Load the leaderboard, move the pointer over any player's row, and confirm the row's background/appearance does not change. Move the pointer across multiple rows and confirm none of them change appearance on hover.

**Acceptance Scenarios**:

1. **Given** the leaderboard is displayed, **When** the user moves the pointer over a player's row, **Then** the row's background/appearance remains unchanged from its non-hovered state.
2. **Given** the leaderboard is displayed with alternating row shading, **When** the user moves the pointer over any row, **Then** that row continues to show only its existing alternating-shading appearance, with no additional hover-triggered change.
3. **Given** the user moves the pointer across several rows in succession, **When** each row is hovered, **Then** no row at any point shows a different appearance than when unhovered.

---

### Edge Cases

- What happens to the existing per-player-name hover behaviors (the roster preview dialog and its loading-style progress indicator, from features 003 and 005)? Those are unaffected — this change only removes the row-level background highlight; hovering a player's name still triggers the existing dialog and progress indicator behavior.
- What happens on touch devices with no persistent hover state? No change in behavior is expected there, since no hover highlight was shown on touch devices previously.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST NOT change a leaderboard row's background or appearance when the mouse pointer hovers over it.
- **FR-002**: System MUST continue to display existing non-hover row styling (e.g., alternating row shading) unchanged.
- **FR-003**: System MUST preserve existing hover behavior scoped to player names (the roster preview dialog and its progress indicator), which is unaffected by removal of the row-level highlight.

### Key Entities

- **Leaderboard Row**: The existing table row displaying one player's ranking data; loses its hover-triggered background highlight while retaining its other visual styling.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of leaderboard rows show no visual change when hovered, verified by moving the pointer over every row.
- **SC-002**: Existing player-name hover interactions (roster preview dialog and its progress indicator) continue to function exactly as before, with 0 regressions.

## Assumptions

- The row-level hover highlight being removed is the background-color change currently applied to an entire table row on hover, distinct from the player-name-specific hover interactions (roster dialog, progress indicator), which remain in place.
- No replacement visual treatment is desired for row hover; rows simply behave as if unhovered at all times.
