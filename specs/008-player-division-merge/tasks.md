---

description: "Task list for merging the Division column into the Player column"
---

# Tasks: Merge Division into Player Column

**Input**: Design documents from `/specs/008-player-division-merge/`
**Prerequisites**: plan.md, spec.md, data-model.md, quickstart.md

**Tests**: This feature touches an existing, already-passing test suite
(`tests/integration/leaderboard.test.tsx`) that asserts on the current
separate Division column. Those assertions must be updated to match the new
combined behavior, or the suite will fail after the markup change — so test
updates are included as part of User Story 1's implementation, not as a
separate optional phase.

**Organization**: Single user story (P1) — there is only one story in
spec.md, so there is no Foundational phase and no cross-story dependency
section.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 (this feature's only user story)
- Paths are repository-root-relative (single-project layout, no `backend/`/`frontend/` split)

## Phase 1: Setup

No setup required — existing project, existing dependencies, no new tooling.

## Phase 2: Foundational

None — this feature has no shared infrastructure to build before US1; it
edits one existing component directly.

---

## Phase 3: User Story 1 - View player with division inline (Priority: P1) 🎯 MVP

**Goal**: Replace the standalone "Division" column with a combined
"Player(Division)" column so each row reads e.g. `Red(4)`, with no
separate Division cell, while the roster-hover-preview interaction keeps
working unchanged.

**Independent Test**: Render `<Leaderboard>` with fixture entries and
confirm: (a) there is one column header "Player(Division)" and no
"Division" header, (b) a row for a player in a resolvable division renders
`Name(Division)` with no space, (c) a row for a player with an
unresolvable `divisionId` falls back to `Name(divisionId)`, and (d)
hovering a player's name still opens the roster-preview dialog after the
existing delay.

### Tests for User Story 1

> Update these first so they fail against the current (pre-change) markup, confirming they actually exercise the new behavior once implementation lands.

- [X] T001 [US1] In `tests/integration/leaderboard.test.tsx`, replace the `describe("Leaderboard (US1 — division column, 004-division-column)")` block (currently asserting a standalone "Division" columnheader and separate Division cell text) with assertions for the merged column: a `columnheader` named exactly "Player(Division)" (and no "Division" columnheader), a row for a player in a resolvable division rendering the exact text `Red(4)`-style `Name(Division)` (no space) via `resolveDivisionName`, a row with an unresolvable `divisionId` falling back to `Name(divisionId)` (no space), and unchanged rank-order/tie-breaking after the change.
- [X] T002 [US1] In `tests/integration/leaderboard.test.tsx`, update the `describe("Leaderboard (US3 — divisions never split the display)")` test's row-content assertions (currently `rows[0]).toHaveTextContent("east")` etc., relying on the old Division cell) to instead expect the division text to appear inline within the Player cell (e.g. `toHaveTextContent("Alice(east)")`), keeping the "one table, no per-division grouping" assertions unchanged.
- [X] T003 [P] [US1] In `tests/integration/leaderboard.test.tsx`, confirm (or add if missing) an assertion in the roster-hover-preview `describe` block that hovering the combined "Name(Division)" text for the existing delay still opens `RosterPreviewDialog` with unchanged content, so the merge doesn't regress FR-005 of this feature.

### Implementation for User Story 1

- [X] T004 [US1] In `src/components/Leaderboard.tsx`, remove the `<th scope="col">Division</th>` header cell and change `<th scope="col">Player</th>` to `<th scope="col">Player(Division)</th>`.
- [X] T005 [US1] In `src/components/Leaderboard.tsx`, remove the standalone `<td>{resolveDivisionName(entry.player.divisionId, divisionsLookup)}</td>` cell, and in the existing Player `<td>`'s `.player-name-hover` span, replace the bare `{entry.player.name}` text node with `{entry.player.name}({resolveDivisionName(entry.player.divisionId, divisionsLookup)})` so the division text renders immediately after the name with no space, inside the same hover-trigger wrapper (depends on T004; same file).
- [X] T006 [US1] Update the file-level doc comment in `src/components/Leaderboard.tsx` (currently describing a separate "Division column" added in 004-division-column) to describe the merged "Player(Division)" column instead, noting 008-player-division-merge (depends on T005; same file).
- [X] T007 [US1] Run `npm run test` and `npm run lint` and fix any remaining failures so the full suite (including the updated tests from T001-T003) passes against the new markup (depends on T001-T006).

**Checkpoint**: User Story 1 is fully functional and independently testable — the leaderboard shows one merged "Player(Division)" column, no separate Division column, and hover-preview still works.

---

## Phase 4: Polish & Cross-Cutting Concerns

- [ ] T008 Manually run `npm run dev`, open the app, and walk through the verification steps in `specs/008-player-division-merge/quickstart.md` (header text, a couple of row values, hover-preview timing) to confirm the change looks right in the browser, not just in tests.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup / Foundational**: None — skipped, nothing to build first.
- **User Story 1 (Phase 3)**: Can start immediately.
- **Polish (Phase 4)**: Depends on User Story 1 (Phase 3) being complete.

### Within User Story 1

- T001, T002, T003 (test updates) should be written/updated first and observed failing against the current markup.
- T004 before T005 (T005's replacement span sits inside the row markup T004 also touches — same file, do header first for a clean diff).
- T005 before T006 (doc comment describes the code T005 just changed).
- T007 last — depends on all of T001-T006 being in place.

### Parallel Opportunities

- T003 is marked [P]: it's an independent assertion check in a different `describe` block from T001/T002 and doesn't touch the same lines, though all three land in the same file so apply them as one coordinated edit pass rather than literally simultaneous writes.
- T004-T006 are sequential edits to the same file/region (`Leaderboard.tsx`) — do not parallelize.

---

## Parallel Example: User Story 1

```bash
# T001 and T002 both edit tests/integration/leaderboard.test.tsx in different
# describe blocks — review together, but apply as one coordinated edit since
# they share a file:
Task: "Replace Division-column assertions with Player(Division) assertions (T001)"
Task: "Update US3 row-content assertions for inline division text (T002)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Update tests (T001-T003) to describe the target behavior.
2. Update `Leaderboard.tsx` markup and doc comment (T004-T006).
3. Run the suite and lint (T007) until green.
4. **STOP and VALIDATE**: manually confirm in the browser (T008).

This feature has exactly one user story, so User Story 1 *is* the entire
scope — there is no further incremental phase beyond Polish.

---

## Notes

- [P] tasks = different files or clearly separated regions, no dependencies
- [US1] label maps every task to this feature's single user story
- Verify the updated tests fail against the pre-change markup before implementing, then pass after
- Commit after the test-update pass and again after the implementation pass
- Avoid: reintroducing a separate Division `<th>`/`<td>`, adding a space before the parenthesis, or changing anything in `src/lib/scoring.ts` or `src/data/league.ts`
