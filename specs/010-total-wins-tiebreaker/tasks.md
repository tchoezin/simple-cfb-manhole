# Tasks: Total-Wins Tiebreaker for Leaderboard Ranking

**Input**: Design documents from `/specs/010-total-wins-tiebreaker/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Tests**: Included — the spec's acceptance scenarios are directly
testable against the pure `computeLeaderboard` function, and the existing
test suite (`tests/unit/scoring.test.ts`) already covers this function's
rank-grouping behavior, so extending it is the natural verification path.

**Organization**: This feature has a single user story (US1), so all
implementation tasks live in one phase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Maps to US1 (the feature's only user story)

## Path Conventions

Single project layout (existing repo): `src/`, `tests/` at repository root.

---

## Phase 1: Setup

No setup tasks — this feature modifies one existing function in an
already-configured project. No new dependencies, files, or scaffolding.

---

## Phase 2: Foundational

No foundational/blocking prerequisites — `computeLeaderboard` and
`totalWins` already exist (built in 009-leaderboard-score-columns). Work
starts directly in the user story phase.

---

## Phase 3: User Story 1 - Rank tied players by total wins (Priority: P1) 🎯 MVP

**Goal**: When two or more players share the same Score, rank them by
Total Wins (highest first) instead of grouping them into one shared rank;
players tied on both Score and Total Wins still share a rank and fall
back to alphabetical-by-name ordering.

**Independent Test**: Load the leaderboard (or call `computeLeaderboard`
directly in a test) with players who share a Score but differ in Total
Wins, and confirm the higher-Total-Wins player is ranked above the other
with a distinct rank number; confirm players tied on both Score and Total
Wins still share a rank.

### Tests for User Story 1

> Write these tests first; confirm they fail against the current
> Score-only/alphabetical comparator before implementing.

- [X] T001 [P] [US1] Add test in `tests/unit/scoring.test.ts`: two players with equal `total` but different `totalWins` receive distinct, correctly-ordered ranks (higher `totalWins` ranked first) — covers spec Acceptance Scenario 1.
- [X] T002 [P] [US1] Add test in `tests/unit/scoring.test.ts`: two players with different `total` values are ordered by `total` regardless of their `totalWins` values — covers spec Acceptance Scenario 2 and guards against regressing existing Score-primary ordering.
- [X] T003 [P] [US1] Add test in `tests/unit/scoring.test.ts`: two players tied on both `total` and `totalWins` share the same rank and are ordered alphabetically by name — covers spec Acceptance Scenario 3 and Edge Case (full tie fallback).
- [X] T004 [P] [US1] Add test in `tests/unit/scoring.test.ts`: three or more players tied on `total` with distinct `totalWins` values are all re-ordered among themselves by `totalWins` (not just the first pair) — covers spec Edge Case (3+-way Score tie).

### Implementation for User Story 1

- [X] T005 [US1] In `src/lib/scoring.ts`, update the sort comparator inside `computeLeaderboard` to compare `b.totalWins - a.totalWins` as a secondary key (after `total`, before the existing `player.name.localeCompare` fallback).
- [X] T006 [US1] In `src/lib/scoring.ts`, update the rank-grouping loop in `computeLeaderboard` (the `previousTotal` tracking) to track both `total` and `totalWins`, assigning a new rank whenever either value changes from the previous sorted entry, so only full (`total`, `totalWins`) ties share a rank. (Depends on T005.)
- [X] T007 [US1] Run `npm test` to confirm all new and existing `tests/unit/scoring.test.ts` cases pass, including the T001–T004 tiebreaker cases and prior 001/009-era rank/score tests. (Depends on T005, T006.)

**Checkpoint**: Total-wins tiebreaker is fully functional and independently verified via `computeLeaderboard` unit tests — no UI changes needed since `Leaderboard.tsx` already renders `rank` and `totalWins` as-is.

---

## Phase 4: Polish & Cross-Cutting Concerns

- [X] T008 [P] Review inline comments in `src/lib/scoring.ts` around the sort/rank block (lines referencing FR-010) and update them to describe the new (Score, Total Wins, name) precedence so future readers aren't misled by stale comments.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup**: N/A — skipped
- **Foundational**: N/A — skipped
- **User Story 1 (Phase 3)**: No dependencies on other phases; can start immediately
- **Polish (Phase 4)**: Depends on Phase 3 completion

### Within User Story 1

- Tests (T001–T004) should be written and failing before implementation (T005–T006)
- T005 (comparator) before T006 (rank grouping), since rank grouping reads the newly-sorted order
- T007 (full test run) after both implementation tasks

### Parallel Opportunities

- T001, T002, T003, T004 are all in the same file but independent test cases — write them together, then run once; they may be authored in parallel by different people but will need to be merged into the same file (mark [P] for authoring parallelism, not literal simultaneous file writes)
- T005 and T006 touch the same function sequentially — not parallelizable
- T008 can run in parallel with nothing else remaining, but has no dependents

---

## Implementation Strategy

### MVP (and full scope)

This feature is small enough that its single user story **is** the MVP:

1. Write tests T001–T004 in `tests/unit/scoring.test.ts`, confirm they fail
2. Implement T005 (comparator) and T006 (rank grouping) in `src/lib/scoring.ts`
3. Run T007 to confirm the full suite passes
4. Apply the T008 comment cleanup
5. Done — no further increments planned for this feature
