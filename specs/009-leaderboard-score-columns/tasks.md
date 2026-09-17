# Tasks: Leaderboard Win-Breakdown Columns

**Input**: Design documents from `/specs/009-leaderboard-score-columns/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Included — this repo has an established unit/integration test
convention (`tests/unit/scoring.test.ts`, `tests/integration/leaderboard.test.tsx`)
that every prior feature extended; this feature follows the same pattern.

**Organization**: Tasks are grouped by user story. Both user stories (US1:
per-tier win counts, US2: total wins) share one foundational data change,
since `totalWins` is defined as the sum of the three tier counts and both
are computed together in `computeLeaderboard`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)

## Path Conventions

Single frontend project: `src/`, `tests/` at repository root (per plan.md).

---

## Phase 1: Setup

No new setup required — this feature adds fields/columns to existing
files only (`src/types/league.ts`, `src/lib/scoring.ts`,
`src/components/Leaderboard.tsx`). No new dependencies, directories, or
tooling.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend the shared data model and scoring computation that
both user stories' UI work depends on.

**⚠️ CRITICAL**: Must complete before Phase 3/4 (both stories render
fields defined here).

- [X] T001 Extend `LeaderboardEntry` in `src/types/league.ts` with
      `threePointWins: number`, `twoPointWins: number`,
      `onePointWins: number`, and `totalWins: number` fields (per
      data-model.md).
- [X] T002 In `src/lib/scoring.ts`, extend `computeLeaderboard`'s
      per-player loop to tally a counter per tier (3/2/1) from each
      `scorePlayerGame` call (alongside the existing `total` sum), and set
      `threePointWins`, `twoPointWins`, `onePointWins`, and
      `totalWins` (= sum of the three) on each resulting entry, in
      addition to the existing `total` and `rank` (depends on T001).
- [X] T003 [P] Add unit tests in `tests/unit/scoring.test.ts` asserting,
      for representative player/game fixtures: (a) `totalWins ===
      threePointWins + twoPointWins + onePointWins` (SC-001), (b) `total
      === 3*threePointWins + 2*twoPointWins + 1*onePointWins` (SC-002),
      and (c) a player with zero wins in a tier gets `0` (not undefined)
      for that tier (depends on T002).

**Checkpoint**: `computeLeaderboard` now returns the four new fields,
verified correct by unit tests — UI work in Phase 3/4 can proceed.

---

## Phase 3: User Story 1 - See win breakdown by point value (Priority: P1) 🎯 MVP

**Goal**: Leaderboard rows show separate counts of 3 pt, 2 pt, and 1 pt
wins per player.

**Independent Test**: Load the leaderboard and confirm each row shows a
3 pt / 2 pt / 1 pt count matching the underlying game data, with `0`
shown (not blank) for tiers with no wins.

### Implementation for User Story 1

- [X] T004 [US1] In `src/components/Leaderboard.tsx`, add three
      `<th scope="col">` headers ("3 pt", "2 pt", "1 pt") to the table
      header row, positioned after the existing "Score" header.
- [X] T005 [US1] In `src/components/Leaderboard.tsx`, add three matching
      `<td>` cells per row rendering `entry.threePointWins`,
      `entry.twoPointWins`, and `entry.onePointWins` (depends on T004,
      T002).
- [X] T006 [P] [US1] Extend `tests/integration/leaderboard.test.tsx` with
      a test asserting the rendered 3 pt / 2 pt / 1 pt cell values for a
      set of fixture entries, including a player with `0` in one tier
      (depends on T005).

**Checkpoint**: User Story 1 is fully functional and independently
testable — breakdown columns render correctly.

---

## Phase 4: User Story 2 - See total wins alongside the breakdown (Priority: P1)

**Goal**: Leaderboard rows show a Total Wins column equal to the sum of
the three tier columns.

**Independent Test**: Load the leaderboard and confirm the Total Wins
column value for each row equals the sum of that row's 3 pt, 2 pt, and
1 pt values.

### Implementation for User Story 2

- [X] T007 [US2] In `src/components/Leaderboard.tsx`, add a
      `<th scope="col">` header ("Total Wins") to the table header row,
      after the 3 pt/2 pt/1 pt headers added in T004.
- [X] T008 [US2] In `src/components/Leaderboard.tsx`, add a matching
      `<td>` cell per row rendering `entry.totalWins` (depends on T007,
      T002).
- [X] T009 [P] [US2] Extend `tests/integration/leaderboard.test.tsx` with
      a test asserting the rendered Total Wins cell equals the sum of the
      3 pt/2 pt/1 pt cells for a set of fixture entries, including an
      all-zero-wins player showing `0` (depends on T008).

**Checkpoint**: User Stories 1 AND 2 both work — the full leaderboard
shows 3 pt, 2 pt, 1 pt, and Total Wins columns, all internally consistent.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T010 Run `npm test` and confirm all existing and new tests pass
      (no regressions to Score, rank order, or other columns).
- [X] T011 Run `npm run dev`, load the leaderboard in a browser, and
      manually verify per quickstart.md: 3pt + 2pt + 1pt = Total Wins,
      and 3×3pt + 2×2pt + 1×1pt = Score, for at least two players.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — BLOCKS both user stories
  (T004–T009 all read the fields defined in T001/T002).
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion. Independent
  of User Story 2.
- **User Story 2 (Phase 4)**: Depends on Phase 2 completion. Independent
  of User Story 1 (adds its own header/cell; does not modify US1's cells).
  Listed second only because it reads as a natural continuation of the
  same header row in the markup — either story can be implemented first.
- **Polish (Phase 5)**: Depends on Phase 3 and Phase 4 completion.

### Parallel Opportunities

- T003 (unit tests) can be written in parallel with T004+ once T002 lands,
  since it touches a different file (`tests/unit/scoring.test.ts`).
- T006 and T009 (integration tests) touch the same test file
  (`tests/integration/leaderboard.test.tsx`) as each other but different
  files from their respective implementation tasks — run them after T005
  and T008 respectively to avoid merge conflicts if working in parallel.
- US1 (T004–T006) and US2 (T007–T009) both edit
  `src/components/Leaderboard.tsx`; if split across two people, coordinate
  on that single file rather than running fully in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T001–T003).
2. Complete Phase 3: User Story 1 (T004–T006).
3. **STOP and VALIDATE**: Confirm 3 pt/2 pt/1 pt columns render correctly.
4. This alone satisfies the "see win breakdown" half of the request.

### Incremental Delivery

1. Foundational (T001–T003) → shared data ready.
2. User Story 1 (T004–T006) → breakdown columns visible → validate.
3. User Story 2 (T007–T009) → Total Wins column visible → validate.
4. Polish (T010–T011) → full regression pass + manual spot-check.
