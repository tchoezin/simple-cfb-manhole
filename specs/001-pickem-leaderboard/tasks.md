---

description: "Task list for Pick'em Leaderboard implementation"
---

# Tasks: Pick'em Leaderboard

**Input**: Design documents from `/specs/001-pickem-leaderboard/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Included — plan.md establishes Vitest + React Testing Library as part of the stack and data-model.md/quickstart.md define exact scoring behaviors the tests must lock in, so test tasks are generated alongside implementation.

**Organization**: Tasks are grouped by user story (from spec.md: US1 = P1, US2 = P2, US3 = P3) to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Paths are relative to the repository root; see plan.md's Project Structure

## Path Conventions

Single frontend-only project (no backend): `src/`, `tests/` at repository root, per [plan.md](./plan.md#project-structure).

## Domain model note

This feature is a **team-ownership** game, not weekly picks: each player has
a fixed roster of 10 FBS teams for the season (`Player.ownedTeamIds`), unique
*within* their division only (the same team may be owned by different
players in different divisions — FR-017). A player scores when one of their
owned teams wins a finished game. See [data-model.md](./data-model.md) for
the full `scorePlayerGame` pseudocode.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project directories per plan.md: `src/data/`, `src/lib/`, `src/types/`, `src/components/`, `tests/unit/`, `tests/integration/`
- [X] T002 Initialize the TypeScript + React + Vite project (`package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`) per research.md §4
- [X] T003 [P] Configure linting and formatting (ESLint + Prettier configs) for TypeScript/React
- [X] T004 [P] Configure Vitest + React Testing Library (`vitest.config.ts` or Vite test block, test setup file) per research.md §5

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types, data access, and app scaffold that every user story builds on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 [P] Define `Player` (with `ownedTeamIds: string[10]`), `Division`, `Team`, `Game`, `Score` types in `src/types/league.ts` per [data-model.md](./data-model.md)
- [X] T006 [P] Implement ESPN API client — `fetchTeamSchedule(teamId)` and `fetchTeamDetail(teamId)` (raw response shapes only) — in `src/lib/espn.ts` per [contracts/espn-api-usage.md](./contracts/espn-api-usage.md)
- [X] T007 [P] Implement last-known-scores cache module (`saveScores`, `loadScores` against `localStorage`, keyed by season) in `src/lib/cache.ts` per research.md §6
- [X] T008 [P] Create starter `src/data/league.ts` with sample `divisions` and `players` (each with a 10-team `ownedTeamIds` roster, including one team intentionally repeated across two different divisions to exercise FR-017) matching [contracts/league-data-schema.md](./contracts/league-data-schema.md) — placeholder data, replaced with the real roster in Polish phase
- [X] T009 Scaffold `src/main.tsx` and an empty `src/App.tsx` (renders nothing but a placeholder yet) wired into `index.html`

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - View the league leaderboard (Priority: P1) 🎯 MVP

**Goal**: A user opens the app and sees every player ranked by score in one combined list, including the all-zero-scores and tied-score cases.

**Independent Test**: Load the app with fixture players/rosters and a mix of finished/unfinished games (or none finished); confirm every player appears exactly once, sorted by score descending, ties adjacent, all at 0 when nothing has finished.

### Tests for User Story 1

- [X] T010 [P] [US1] Unit test `computeLeaderboard` ranking behavior (sorts descending, tied scores share rank, empty-games case yields all zeros) in `tests/unit/scoring.test.ts`
- [X] T011 [P] [US1] Integration test: `Leaderboard` renders every player from fixture data with name + score, correctly ordered, in `tests/integration/leaderboard.test.tsx`

### Implementation for User Story 1

- [X] T012 [US1] Implement `computeLeaderboard(players, divisions, teams, gamesByOwnedTeam)` in `src/lib/scoring.ts` — for each player, gather the deduplicated finished games won by any team in their `ownedTeamIds`, sum per-game points, and apply standard competition ranking (ties share rank, FR-010) (depends on T005; game-level scoring stubbed at 0 until US2 lands in T018/T020)
- [X] T013 [P] [US1] Implement `Leaderboard` component (ranked table: rank, name, score) in `src/components/Leaderboard.tsx` (depends on T005)
- [X] T014 [P] [US1] Implement `StaleDataNotice` component (visible "showing last-known scores as of {timestamp}" banner, FR-015) in `src/components/StaleDataNotice.tsx`
- [X] T015 [US1] Wire up `src/App.tsx`: load `src/data/league.ts`, determine the distinct set of owned team ids across all players, fetch each one's schedule + detail via `src/lib/espn.ts`, compute the leaderboard via `src/lib/scoring.ts`, render `Leaderboard`; on any fetch failure load `src/lib/cache.ts` and render `StaleDataNotice`; on success persist the computed result via `src/lib/cache.ts` (depends on T006, T007, T008, T009, T012, T013, T014)
- [X] T016 [US1] Style the leaderboard table for readability at scale (legible for at least 50 players across 10 divisions, per SC-004) in `src/components/Leaderboard.tsx`

**Checkpoint**: User Story 1 is fully functional and independently testable — the leaderboard renders and ranks correctly (scores will all read 0 until US2 adds real point calculation).

---

## Phase 4: User Story 2 - Score updates as owned teams win (Priority: P2)

**Goal**: Scores reflect the league's point rules (1 default / 2 same-conference / 3 division-rival-owned, with rivalry overriding conference) for every finished game won by an owned team.

**Independent Test**: Given a fixed set of team rosters and one finished game per scenario (default, same-conference, rivalry, unfinished, owned-team-lost, unowned-vs-unowned), verify each affected player's score matches the expected rule outcome.

### Tests for User Story 2

- [X] T017 [P] [US2] Unit tests for `scorePlayerGame` covering: owned team wins with no bonus → 1, owned team wins vs. same-conference opponent → 2, owned team wins vs. a team owned by another player in the same division → 3 (overrides conference bonus even when both would apply), owned team loses → 0, unfinished game → 0, neither team owned → 0 for everyone, single-player division has no possible rival → falls back to default/conference rule, same team owned by different players in different divisions scores each independently, and a same-division ownership collision in fixture data (two players in one division both listing the same team id) is detectable (e.g., a `findDivisionOwnershipCollisions(players)` helper flags it, per FR-017) in `tests/unit/scoring.test.ts`

### Implementation for User Story 2

- [X] T018 [US2] Implement `scorePlayerGame(player, game, teams, divisionOwnership)` precedence logic (rivalry 3 > same-conference 2 > default 1 > 0) in `src/lib/scoring.ts` per the pseudocode in [data-model.md](./data-model.md#scoring-function-pure-srclibscoringts) (depends on T005)
- [X] T019 [US2] Build the `divisionOwnership: Map<divisionId, Map<teamId, playerId>>` lookup from `src/data/league.ts` at load time in `src/lib/scoring.ts`, including a `findDivisionOwnershipCollisions(players)` helper that flags any team id owned by two players in the same division (FR-017) (depends on T005, T008)
- [X] T020 [US2] Map raw ESPN team-schedule/team-detail responses into `Game[]` (`id`, `week`, `completed`, `winnerTeamId`, `loserTeamId`) and `Team` (`conferenceId`) in `src/lib/espn.ts` per [contracts/espn-api-usage.md](./contracts/espn-api-usage.md), deduplicating games that appear in more than one owned team's schedule (depends on T006)
- [X] T021 [US2] Replace the stubbed per-game score in `computeLeaderboard` with calls to `scorePlayerGame` (using the `divisionOwnership` lookup from T019) so player totals reflect real point rules in `src/lib/scoring.ts` (depends on T012, T018, T019)

**Checkpoint**: User Stories 1 AND 2 both work — the leaderboard shows real, rule-correct scores computed from live ESPN data and each player's owned-team roster.

---

## Phase 5: User Story 3 - Divisions affect scoring only, not visibility (Priority: P3)

**Goal**: Confirm division membership never splits or filters the leaderboard — it only feeds the rivalry-bonus/ownership-uniqueness rules from US2.

**Independent Test**: With players spread across at least two divisions (including one team owned by players in two different divisions), confirm the leaderboard remains one single ranked list with no division-based grouping or filtering in the UI.

### Tests for User Story 3

- [X] T022 [P] [US3] Integration test: fixture data with players across ≥2 divisions (including a team owned in two different divisions) renders as one combined ranked list (no division headers/grouping/filtering) in `tests/integration/leaderboard.test.tsx`

### Implementation for User Story 3

- [X] T023 [US3] Review `src/components/Leaderboard.tsx` and `src/lib/scoring.ts` to confirm `divisionId` is read only inside the `divisionOwnership` rivalry lookup and never used to group, sort, or filter the rendered list; add a short code comment noting this constraint (FR-002, FR-009) (depends on T013, T018, T019)

**Checkpoint**: All user stories are independently functional — leaderboard renders correctly, scores are rule-correct, and divisions provably never affect the display.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize real data and validate the whole feature end-to-end

- [~] T024 Replace the placeholder `src/data/league.ts` with the real league roster, division assignments, and each player's 10-team ownership per [quickstart.md](./quickstart.md#season-start-admin-workflow-manual-data-entry--fr-012-fr-018) — **Division 1 (Taylor, Choezin, JR, Alcus, Ethan, Gordie; 60 team ids resolved and verified live against ESPN, zero same-division collisions) is real data now in place; remaining divisions still to be provided by the league admin**
- [X] T025 [P] Add a `README.md` section (or update quickstart.md if needed) documenting the season-start manual-roster-entry workflow for future reference
- [X] T026 Run full quickstart.md validation: `npm run dev`, `npm run test`, `npm run build` all succeed against the real data from T024 — `npm run dev` (serves, HTTP 200), `npm run test` (17/17 pass), `npm run build` (succeeds), `npm run lint` (clean), and a live end-to-end run against real ESPN data (all 60 Division 1 team ids fetched successfully, 0 failures, leaderboard computed) all verified; will need re-running once additional divisions are added
- [ ] T027 [P] Verify the ESPN-unreachable fallback path manually (simulate a failed fetch) and confirm `StaleDataNotice` renders correctly per FR-015 — logic is unit/integration-tested (StaleDataNotice render, cache fallback wiring in App.tsx), but a true manual browser check (throttle/block network, reload, observe) has not been performed and needs a human with a browser
- [ ] T028 Confirm SC-001 (leaderboard interactive within 5s of load) and SC-004 (readable/correctly ranked at 50 players / 10 divisions) against the built app — needs a real browser session against real league data + live ESPN access to measure; not verifiable from this environment
- [X] T029 Confirm as non-goals (no code required): FR-013 — no auth/login exists anywhere in the built app; FR-016 — no season selector or historical-season fetch exists, only the current season's data is ever requested (verified via `grep` — no auth-related code found; only reference to "season selector" is the code comment documenting its absence)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion only
- **User Story 2 (Phase 4)**: Depends on Foundational completion; extends `scoring.ts`/`espn.ts` from US1 (T012, T006) but is independently testable via `scorePlayerGame` unit tests before US1's UI even exists
- **User Story 3 (Phase 5)**: Depends on Foundational completion; its verification task depends on US1's `Leaderboard.tsx` (T013) and US2's ownership/scoring logic (T018, T019) existing to review
- **Polish (Phase 6)**: Depends on US1 + US2 + US3 all being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependency on other stories — MVP on its own (scores read 0 until US2 lands)
- **User Story 2 (P2)**: Independently testable at the unit level (T017) without US1's UI; full end-to-end value requires US1's `App.tsx` wiring (T015) to display it
- **User Story 3 (P3)**: A verification/regression story over US1 + US2's existing code — no new components

### Within Each User Story

- Tests written before their corresponding implementation tasks (fail first, per plan.md's testing approach)
- Types/data before scoring logic; scoring logic before UI wiring
- Story checkpoint reached before moving to the next priority

### Parallel Opportunities

- T003, T004 (Setup) in parallel
- T005, T006, T007, T008 (Foundational) in parallel — different files, no shared dependencies
- T010, T011 (US1 tests) in parallel
- T013, T014 (US1 components) in parallel once T005 is done
- T017 (US2 tests) can start in parallel with US1's Phase 3 once Foundational is done
- T022 (US3 test) has no other parallel task in its phase (depends on prior phases)
- T025, T027 (Polish) in parallel

---

## Parallel Example: User Story 1

```bash
# Launch US1 tests together:
Task: "Unit test computeLeaderboard ranking behavior in tests/unit/scoring.test.ts"
Task: "Integration test Leaderboard renders all players in tests/integration/leaderboard.test.tsx"

# Launch US1 components together (after T005):
Task: "Implement Leaderboard component in src/components/Leaderboard.tsx"
Task: "Implement StaleDataNotice component in src/components/StaleDataNotice.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Leaderboard renders and ranks correctly (scores at 0)
5. Demo if useful, then continue to US2 for real scoring

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. User Story 1 → validate independently → leaderboard shell works (MVP!)
3. User Story 2 → validate independently → scores become rule-correct
4. User Story 3 → validate independently → division-isolation regression test locked in
5. Polish → real league data, end-to-end quickstart validation

---

## Notes

- [P] tasks touch different files with no unmet dependencies
- [Story] label maps each task to its user story for traceability
- This is a solo/small-team static app — the "parallel team" strategy from the earlier template is omitted as not applicable here
- Commit after each task or logical group (per constitution's Simplicity First, keep commits small and reviewable)
- Avoid: vague tasks, same-file conflicts, cross-story dependencies that break independent testability

---

## Phase 7: Post-implementation change — hardcoded conference list (constitution v1.1.0, FR-019)

**Purpose**: Replace the live ESPN team-detail conference fetch with a
hardcoded, manually-maintained conference list, after the live source
proved to report Sun Belt's East/West divisions as separate conferences —
silently breaking the same-conference bonus (FR-005) for JMU/Louisiana.

- [X] T030 Add `Conference` type (`id`, `name`, `teamIds`) to `src/types/league.ts`
- [X] T031 Create `src/data/conferences.ts` — hardcoded conference-to-teams list (FR-019). Initially seeded from ESPN's own grouping data (60-team, "pending review" placeholder), then **replaced with the league admin's authoritative 2026 realignment list**: 138 FBS schools across 10 real conferences + 2 independents (Notre Dame, UConn each modeled as a unique singleton "conference" so they never conference-match each other or anyone — see [conferences-schema.md](./contracts/conferences-schema.md) rule 5), verified live against ESPN's own FBS team roster (148 group-80 ids minus 10 non-school "all-star"/placeholder entries = 138, matching the admin's count exactly with zero name-match misses)
- [X] T032 Create `src/lib/conferences.ts` — `buildTeamsById(conferences)` and `findConferenceCollisions(conferences)`, mirroring `findDivisionOwnershipCollisions` in `src/lib/scoring.ts`
- [X] T033 Remove team-detail fetching from `src/lib/espn.ts` (`fetchTeamDetail`, `mapTeamDetail`, `EspnTeamDetailResponse` deleted); `fetchOwnedTeamGames(teamId)` now returns `Game[]` only — the client calls exactly one ESPN endpoint (schedule)
- [X] T034 Update `src/App.tsx` to build `teams` via `buildTeamsById(conferences)` instead of fetching per-team conference data; only `fetchOwnedTeamGames` is called per distinct owned team now
- [X] T035 [P] Update tests: `tests/unit/espn.test.ts` (remove `mapTeamDetail` tests, keep `mapTeamSchedule`), `tests/unit/conferences.test.ts` (`buildTeamsById`, `findConferenceCollisions`, Sun Belt-merge regression case, independents-never-match-each-other regression case)
- [X] T036 Verify live against real data: all 60 owned team ids (from `league.ts`) resolve to a conference via the final 138-team hardcoded list, zero `findConferenceCollisions`, zero missing coverage (confirmed via a throwaway script)

**Checkpoint**: `npm run test` (25/25 pass), `npm run lint` (clean), `npm run build` (succeeds) all re-verified with the final conference data in place.
