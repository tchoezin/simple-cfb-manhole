---

description: "Task list template for feature implementation"
---

# Tasks: Leaderboard Division Column

**Input**: Design documents from `/specs/004-division-column/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Included — quickstart.md already commits to `tests/unit/divisions.test.ts` and an update to `tests/integration/leaderboard.test.tsx`, matching this codebase's existing convention of a unit + integration test for every feature (see 003-hover-player-roster).

**Organization**: This feature has a single user story (P1) in spec.md, so all feature work lives in one phase after the shared data-layer foundation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1)

## Path Conventions

Single project (existing repo root `src/`, `tests/` — see plan.md Project Structure).

---

## Phase 1: Foundational — Division Name Lookup (Blocking Prerequisite)

**Purpose**: The column cannot display division names until a name-lookup helper exists (FR-002, FR-005). No `divisionId` type change is needed — `Player.divisionId` and `Division.name` already exist in `src/types/league.ts` / `src/data/league.ts`.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T001 Create `src/lib/divisions.ts` exporting `buildDivisionsById(divisions: Division[]): Map<string, Division>` and `resolveDivisionName(divisionId: string, divisionsById: Map<string, Division>): string` (falls back to the raw `divisionId` when unresolved), per data-model.md — mirrors `buildTeamsById` (`src/lib/conferences.ts`) and `buildTeamNamesById`/`resolveTeamNames` (`src/lib/teams.ts`)
- [X] T002 [P] Unit test `tests/unit/divisions.test.ts` covering `buildDivisionsById` (correct map from the `divisions` sample list) and `resolveDivisionName` (correct name for a known id; falls back to the raw id for an unmatched id) — depends on T001

**Checkpoint**: Division-name lookup is available and tested — user story implementation can now begin.

---

## Phase 2: User Story 1 - See each player's division on the leaderboard (Priority: P1) 🎯 MVP

**Goal**: The leaderboard table shows a "Division" column with each row's player's division display name, without changing existing rank/sort/tie-break behavior.

**Independent Test**: Load the leaderboard, confirm a "Division" column header is visible, and confirm every row shows its player's division name (currently "Division 1" for all players).

### Implementation for User Story 1

- [X] T003 [US1] In `src/components/Leaderboard.tsx`, add an optional `divisionsById?: Map<string, Division>` prop to `LeaderboardProps` (default to an empty `Map`, matching the existing `teamNamesById` defaulting pattern); import `Division` from `../types/league`
- [X] T004 [US1] In `src/components/Leaderboard.tsx`, add a `<th scope="col">Division</th>` header cell between "Player" and "Score" (column order: Rank, Player, Division, Score — Score stays rightmost per user feedback), and a `<td>{resolveDivisionName(entry.player.divisionId, divisionsById)}</td>` in each row — depends on T001, T003
- [X] T005 [US1] Update `src/App.tsx` to build `divisionsById` once via `buildDivisionsById(divisions)` (the `divisions` array is already imported from `./data/league.ts`) and pass it to both `<Leaderboard>` usages as the new `divisionsById` prop — depends on T001
- [X] T006 [US1] Integration tests in `tests/integration/leaderboard.test.tsx`: (a) a "Division" column header renders, (b) each row renders the correct division name for its player, (c) a player whose `divisionId` doesn't match any entry in `divisionsById` still renders a fallback value (the raw id) instead of a blank cell or crash, (d) rank order and alphabetical tie-breaking are unchanged from existing tests after the column is added — depends on T003, T004, T005

**Checkpoint**: User Story 1 is fully functional and independently testable — this is the entire feature (spec has only one user story).

---

## Phase 3: Polish & Cross-Cutting Concerns

**Purpose**: Final validation of the whole feature.

- [ ] T007 [P] Run the manual verification steps in `specs/004-division-column/quickstart.md` against `npm run dev` (column visible, correct values, resize/scroll behavior) — a human should eyeball it once in a real browser before merging; automated coverage in T006 exercises the same data-correctness scenarios
- [X] T008 Run `npm run lint` and `npm run build` to confirm no type or lint errors were introduced

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Foundational)**: No dependencies — start immediately. BLOCKS Phase 2.
- **Phase 2 (User Story 1)**: Depends on Phase 1 completion (needs `src/lib/divisions.ts`).
- **Phase 3 (Polish)**: Depends on Phase 2 completion.

### Within Phase 1

- T001 has no dependency (pure function, reuses existing `Division` type/data).
- T002 depends on T001 (tests the module it produces).

### Within Phase 2

- T003 has no dependency on Phase 2 siblings (prop addition only).
- T004 depends on T001 (Phase 1) and T003 (needs the prop to read from).
- T005 depends on T001 (Phase 1); can run in parallel with T003/T004 (different file, `App.tsx`).
- T006 depends on T003, T004, T005 (exercises the fully wired feature).

### Parallel Opportunities

- T003 together with T005 (different files: `Leaderboard.tsx` prop signature vs. `App.tsx` wiring — though T004 must land in `Leaderboard.tsx` after T003 before T006 can pass).
- T002 can run alongside T003/T005 once T001 is done.

---

## Parallel Example: Phase 1

```bash
Task: "Create src/lib/divisions.ts with buildDivisionsById/resolveDivisionName"
```

(T002 depends on T001, so true parallelism here is limited to preparing the test file skeleton alongside implementation.)

## Parallel Example: Phase 2

```bash
Task: "Add divisionsById prop to LeaderboardProps in src/components/Leaderboard.tsx"
Task: "Wire buildDivisionsById(divisions) into src/App.tsx and pass divisionsById to both Leaderboard usages"
```

---

## Implementation Strategy

### MVP First (and only) — this feature is one user story

1. Complete Phase 1: Foundational (division-name lookup helper).
2. Complete Phase 2: User Story 1 (the Division column itself).
3. **STOP and VALIDATE**: Run `tests/integration/leaderboard.test.tsx` and the quickstart.md manual steps.
4. Complete Phase 3: Polish (lint/build/manual pass).

---

## Notes

- [P] tasks = different files, no dependencies.
- [US1] label maps every Phase 2 task to the feature's single user story.
- Verify `tests/unit/divisions.test.ts` fails (or doesn't exist) before T001 lands, then passes after.
- Commit after each task or logical group.
- Avoid: introducing a new `src/data/*.ts` file for division names — `src/data/league.ts`'s existing `divisions` array is already the source of truth (research.md, Simplicity First).
- Avoid: using the Division column to group, filter, or re-rank rows — constitution and FR-004 require the leaderboard stay one combined, division-agnostic list.
