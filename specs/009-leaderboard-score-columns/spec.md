# Feature Specification: Leaderboard Win-Breakdown Columns

**Feature Branch**: `009-leaderboard-score-columns`
**Created**: 2026-09-17
**Status**: Draft
**Input**: User description: "Add columns for 3 pt, 2 pt, 1 pt and total wins on the leaderboard"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See win breakdown by point value (Priority: P1)

A league member viewing the leaderboard wants to see, for each player, how
many of their wins were worth 3 points (rivalry/cannibalization), 2 points
(same-conference), and 1 point (default), rather than only the combined
Score total.

**Why this priority**: This is the entire scope of the feature — the
breakdown columns are the deliverable.

**Independent Test**: Load the leaderboard and confirm each row shows a
count of 3-point wins, 2-point wins, and 1-point wins that sum to the
player's total win count.

**Acceptance Scenarios**:

1. **Given** a player has won 2 games at 3 points, 1 game at 2 points, and
   4 games at 1 point, **When** the leaderboard renders, **Then** the row
   shows "2" in the 3 pt column, "1" in the 2 pt column, and "4" in the
   1 pt column.
2. **Given** a player has zero wins at a given point value, **When** the
   leaderboard renders, **Then** that column shows "0" for the player (not
   blank).

---

### User Story 2 - See total wins alongside the breakdown (Priority: P1)

A league member wants a single column showing the player's total number of
game wins (the count of games that scored any points), independent of the
point-weighted Score total already shown.

**Why this priority**: Total wins is the natural companion figure to the
breakdown and was explicitly requested alongside it; without it the
breakdown columns lack a visible check-sum.

**Independent Test**: Load the leaderboard and confirm the Total Wins
column value for each row equals the sum of that row's 3 pt, 2 pt, and
1 pt column values.

**Acceptance Scenarios**:

1. **Given** a player has 2 wins at 3 points, 1 win at 2 points, and 4 wins
   at 1 point, **When** the leaderboard renders, **Then** the Total Wins
   column shows "7".
2. **Given** a player has zero wins, **When** the leaderboard renders,
   **Then** the Total Wins column shows "0".

---

### Edge Cases

- A player who owns teams with no finished, winning games yet shows 0 in
  every new column.
- The existing Score column (point-weighted total) is unaffected by this
  feature and continues to reflect the sum of 3×(3pt wins) + 2×(2pt wins) +
  1×(1pt wins).
- Sorting/ranking of the leaderboard continues to be driven by Score only
  (FR-010 of 001-pickem-leaderboard) — the new columns are additional
  display data, not new sort keys.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The leaderboard MUST display, for each player row, a count of
  that player's wins scored at 3 points (rivalry/cannibalization wins).
- **FR-002**: The leaderboard MUST display, for each player row, a count of
  that player's wins scored at 2 points (same-conference wins).
- **FR-003**: The leaderboard MUST display, for each player row, a count of
  that player's wins scored at 1 point (default wins).
- **FR-004**: The leaderboard MUST display, for each player row, a Total
  Wins count equal to the sum of that player's 3 pt, 2 pt, and 1 pt win
  counts.
- **FR-005**: The existing Score column MUST continue to display the
  point-weighted total (3×3pt-wins + 2×2pt-wins + 1×1pt-wins) unchanged.
- **FR-006**: Win-breakdown counts MUST be computed using the same
  per-game scoring rules already defined for Score (rivalry overrides
  same-conference, which overrides default) so the two are always
  consistent for the same underlying game results.
- **FR-007**: The new columns MUST appear for every row already shown on
  the leaderboard (no separate filtering or pagination).

### Key Entities

- **Leaderboard row (existing)**: Currently exposes a player and a
  point-weighted Score total per game outcome. This feature adds a
  breakdown of that total into per-point-value win counts, plus a total
  win count.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For every player on the leaderboard, the displayed 3 pt + 2
  pt + 1 pt column values sum to exactly the displayed Total Wins value.
- **SC-002**: For every player on the leaderboard, 3×(3 pt column) +
  2×(2 pt column) + 1×(1 pt column) equals the existing Score column value.
- **SC-003**: A league member can determine, without leaving the
  leaderboard page, how many of a player's wins came from each point tier.

## Assumptions

- "Total wins" means total number of games won (count), not the
  point-weighted Score — the two are shown as separate columns since they
  already exist as separate concepts in scoring (win count vs. weighted
  points).
- No new sorting behavior is requested; the leaderboard continues to rank
  by point-weighted Score as established in 001-pickem-leaderboard.
- No games-lost or games-played columns are requested — scope is limited
  to the three win-tier counts plus the total wins count.
