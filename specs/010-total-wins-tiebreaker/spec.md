# Feature Specification: Total-Wins Tiebreaker for Leaderboard Ranking

**Feature Branch**: `010-total-wins-tiebreaker`
**Created**: 2026-09-20
**Status**: Draft
**Input**: User description: "The tiebreaker if players have the same points is total wins"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Rank tied players by total wins (Priority: P1)

A league member viewing the leaderboard wants players who have the same
Score to be ordered by who won more games overall, so the ranking reflects
a meaningful distinction instead of an arbitrary or alphabetical order.

**Why this priority**: This is the entire scope of the feature — resolving
Score ties using Total Wins is the deliverable.

**Independent Test**: Load the leaderboard with two or more players who
share the same Score value but different Total Wins counts, and confirm
the player with more Total Wins is ranked higher (appears first / receives
the better rank number).

**Acceptance Scenarios**:

1. **Given** Player A and Player B both have a Score of 10, but Player A
   has 6 Total Wins and Player B has 4 Total Wins, **When** the leaderboard
   renders, **Then** Player A is ranked above Player B.
2. **Given** Player A and Player B have different Scores (Player A: 12,
   Player B: 10), **When** the leaderboard renders, **Then** Player A is
   ranked above Player B regardless of their respective Total Wins values
   (Score remains the primary sort key).
3. **Given** Player A and Player B have the same Score and the same Total
   Wins, **When** the leaderboard renders, **Then** they are ordered
   alphabetically by name, consistent with existing tie-handling behavior.

---

### Edge Cases

- Three or more players tied on Score: all of them are re-ordered among
  themselves by Total Wins (highest first), not just the first pair
  encountered.
- Players tied on both Score and Total Wins: fall back to the existing
  alphabetical-by-name ordering so the display order stays stable and
  non-arbitrary.
- A player with a Score tie but zero Total Wins (should not normally
  occur, since Score is derived from wins) is still ordered correctly
  relative to peers using the same rule.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The leaderboard MUST rank players primarily by Score
  (point-weighted total), highest first, as already established.
- **FR-002**: When two or more players have an equal Score, the
  leaderboard MUST rank those players by Total Wins, highest first, as a
  tiebreaker.
- **FR-003**: When two or more players have an equal Score and an equal
  Total Wins, the leaderboard MUST order those players alphabetically by
  name, consistent with existing behavior.
- **FR-004**: Players who are fully tied (equal Score and equal Total
  Wins) MUST continue to share the same displayed rank number.
- **FR-005**: Players who share a Score but are separated by the Total
  Wins tiebreaker MUST receive distinct rank numbers reflecting their new
  order (they are no longer considered tied for ranking purposes).
- **FR-006**: The tiebreaker MUST use each player's existing Total Wins
  value with no separate calculation.

### Key Entities

- **Leaderboard row (existing)**: Already exposes Score and Total Wins per
  player. This feature changes the sort/rank ordering rule applied to
  these existing values; it introduces no new data.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For any two players with equal Score, the one with more
  Total Wins always appears higher on the leaderboard.
- **SC-002**: For any two players with equal Score and equal Total Wins,
  they receive the same rank number and are ordered alphabetically.
- **SC-003**: Players with distinct Score values are never reordered
  relative to each other by this change (Score ordering is fully
  preserved for non-tied players).

## Assumptions

- "Total wins" refers to the existing Total Wins figure already displayed
  on the leaderboard (count of games won across all point tiers), not a
  new metric.
- Resolving a Score tie by Total Wins changes rank assignment (players
  are no longer grouped into one shared rank merely for matching Score) —
  only players tied on both Score and Total Wins continue to share a rank.
- No further tiebreaker beyond alphabetical-by-name is needed for players
  tied on both Score and Total Wins, consistent with current behavior.
