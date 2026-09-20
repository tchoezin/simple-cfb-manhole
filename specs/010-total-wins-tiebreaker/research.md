# Phase 0 Research: Total-Wins Tiebreaker

No unknowns were flagged in Technical Context — this feature reuses the
existing stack, testing tools, and data already established by
001-pickem-leaderboard and 009-leaderboard-score-columns. The only design
question worth recording is the tiebreaker/rank-grouping semantics, which
the spec's Assumptions section already resolves.

## Decision: Sort comparator adds Total Wins as a secondary key

**Decision**: In `computeLeaderboard`'s sort, compare `total` (Score)
first; if equal, compare `totalWins` (descending); if still equal, compare
player name alphabetically.

**Rationale**: Matches FR-001–FR-003 directly and requires touching only
the existing comparator function — no new data, no new fields.

**Alternatives considered**:
- *Keep alphabetical as the only tiebreaker and add Total Wins as a
  separate display-only column* — already the case today (009 added the
  column) but doesn't satisfy the user's explicit request that Total Wins
  break rank ties.
- *Weighted composite score (e.g. Score + 0.001×TotalWins)* — rejected as
  needlessly indirect; a multi-key comparator is simpler and avoids
  floating-point fragility (constitution I: Simplicity First).

## Decision: Rank grouping keys off (Score, Total Wins) pairs, not Score alone

**Decision**: The existing "share a rank when tied" logic
(`previousTotal` tracking in `computeLeaderboard`) is extended to track
both `total` and `totalWins`; a rank boundary is drawn whenever either
value changes between adjacent sorted entries.

**Rationale**: Directly implements FR-004/FR-005 — full ties (Score and
Total Wins both equal) still share a rank; partial ties (Score equal,
Total Wins different) now get distinct ranks, per spec Assumption 2.

**Alternatives considered**:
- *Leave rank grouping keyed on Score only* — would keep tied-Score
  players on the same displayed rank even though the tiebreaker separated
  their sort order, producing a confusing "rank 3, rank 3" pair displayed
  in a new relative order — rejected as contradicting the point of adding
  a tiebreaker.

**Output**: All Technical Context items resolved; no NEEDS CLARIFICATION
remain.
