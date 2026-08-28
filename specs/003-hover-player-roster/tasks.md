---

description: "Task list template for feature implementation"
---

# Tasks: Player Roster Hover Preview

**Input**: Design documents from `/specs/003-hover-player-roster/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/team-names-schema.md, quickstart.md

**Tests**: Included — the plan's Project Structure and quickstart.md already commit to `tests/unit/teams.test.ts`, `tests/unit/dialogPosition.test.ts`, and updates to `tests/integration/leaderboard.test.tsx`, matching this codebase's existing convention of a unit + integration test for every feature.

**Organization**: This feature has a single user story (P1) in spec.md, so all feature work lives in one phase after the shared data-layer foundation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1)

## Path Conventions

Single project (existing repo root `src/`, `tests/` — see plan.md Project Structure).

---

## Phase 1: Foundational — Team Name Data Layer (Blocking Prerequisite)

**Purpose**: The dialog cannot display team names until a name-lookup exists (FR-005). This is shared infrastructure the user story depends on; no UI work starts until it's done.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T001 [P] Add a `TeamName` type (`{ id: string; name: string }`) to `src/types/league.ts`, per contracts/team-names-schema.md
- [X] T002 [P] Create `src/data/teams.ts` exporting `teamNames: TeamName[]`, a hardcoded id→name list covering every team id referenced in `src/data/league.ts`'s `ownedTeamIds` (source the names from the existing inline `// Comment` annotations in `src/data/conferences.ts` / `src/data/league.ts`), per contracts/team-names-schema.md
- [X] T003 Create `src/lib/teams.ts` with `buildTeamNamesById(teamNames: TeamName[]): Map<string, string>` and `resolveTeamNames(teamIds: string[], namesById: Map<string, string>): string[]` (falls back to the raw id when a name is missing) — depends on T001, T002
- [X] T004 [P] Unit test `tests/unit/teams.test.ts` covering `buildTeamNamesById` (correct map from a sample list) and `resolveTeamNames` (correct order; falls back to raw id for an unmatched id) — depends on T003

**Checkpoint**: Team-name lookup is available and tested — user story implementation can now begin.

---

## Phase 2: User Story 1 - Preview a player's roster without leaving the leaderboard (Priority: P1) 🎯 MVP

**Goal**: Hovering a player's name for 2 continuous seconds opens a dialog listing that player's teams by name; the dialog stays open while the pointer is over the name or the dialog, and closes the instant the pointer leaves both.

**Independent Test**: Load the leaderboard, hover a player's name for 1 second, confirm the roster dialog opens with team names; move off and confirm it closes; move onto the dialog itself and confirm it stays open.

### Implementation for User Story 1

- [X] T005 [US1] Create `src/lib/dialogPosition.ts` exporting `clampToViewport(anchorRect: DOMRect, dialogSize: { width: number; height: number }, viewport: { width: number; height: number }): { top: number; left: number }`, implementing the two-pass measure-then-clamp approach from research.md §3 (FR-009)
- [X] T006 [P] [US1] Unit test `tests/unit/dialogPosition.test.ts` for `clampToViewport`: default placement when it fits, and clamped placement when the anchor is near each viewport edge (right, bottom, corner) — depends on T005
- [X] T007 [P] [US1] Create presentational component `src/components/RosterPreviewDialog.tsx`: renders a list of team name strings (props: `teamNames: string[]`, `style` for computed position, `dialogRef` for size measurement); shows an explicit "no teams" message when the list is empty (spec Edge Cases)
- [X] T008 [P] [US1] Create `src/components/RosterPreviewDialog.css` styling the dialog using existing theme custom properties (`--color-ink`, `--color-surface-alt`, `--color-charcoal-light`, etc., per `src/styles/theme.css`), positioned `fixed` (not `absolute` — avoids clipping by `.leaderboard-scroll`'s `overflow-x: auto`; `getBoundingClientRect()` already returns the matching viewport coordinate space)
- [X] T009 [US1] In `src/components/Leaderboard.tsx`, wrap each player-name cell's content and the conditionally-rendered `RosterPreviewDialog` in one wrapper `<span>` with `onMouseEnter` (start a 1000ms `setTimeout` held in a `useRef`) / `onMouseLeave` (clear the timer; close the dialog, UNLESS the pointer is moving directly onto the open dialog — checked via `event.relatedTarget` against `dialogRef`, since the dialog is `position: fixed` and rendered away from the name's box, so plain DOM-nesting isn't sufficient; see the `handleLeaveName`/`handleLeaveDialog`/`isInDialog`/`isInNameWrapper` helpers and the file-header comment) handlers; the dialog itself also gets an `onMouseLeave` that keeps it open if the pointer is moving back onto its own name wrapper; track `dialogOpenForPlayerId: string | null` in component state so only one dialog is ever open (FR-008) — depends on T007
- [X] T010 [US1] In `src/components/Leaderboard.tsx`, on dialog open, measure the wrapper (`getBoundingClientRect`) and the dialog's rendered size, call `clampToViewport` from `src/lib/dialogPosition.ts`, and pass the resulting `top`/`left` as the dialog's `style` — depends on T005, T009
- [X] T011 [US1] Update `src/components/Leaderboard.css` to give the name-cell wrapper `display: inline-block` so its hover hit-region matches the name text exactly — depends on T009
- [X] T012 [US1] Update `src/App.tsx` to import `teamNames` from `src/data/teams.ts`, build the lookup once via `buildTeamNamesById`, and pass it to `Leaderboard` as a new optional prop `teamNamesById: Map<string, string>`; `Leaderboard` resolves each row's `entry.player.ownedTeamIds` via `resolveTeamNames` before passing to `RosterPreviewDialog` — depends on T003, T009
- [X] T013 [US1] Integration tests in `tests/integration/leaderboard.test.tsx` using `vi.useFakeTimers()`: (a) dialog opens after advancing 1000ms of continuous hover over a name and shows the player's team names, (b) dialog does NOT open if the pointer leaves before 1000ms, (c) dialog closes immediately on leaving the name (and not onto the dialog), (d) dialog stays open when the pointer moves from the name onto the dialog itself, (e) hovering a second player's name for 1s while a dialog is open closes the first and opens the second, (f) a roster containing an id absent from `teams.ts` still renders (falls back to the raw id), (g) leaving before 1s then re-entering restarts the timer from zero (FR-007), (h) an empty roster renders the "no teams listed" fallback (spec Edge Cases) — depends on T009, T010, T012

**Checkpoint**: User Story 1 is fully functional and independently testable — this is the entire feature (spec has only one user story).

---

## Phase 3: Polish & Cross-Cutting Concerns

**Purpose**: Final validation of the whole feature.

- [ ] T014 [P] Run the manual verification steps in `specs/003-hover-player-roster/quickstart.md` against `npm run dev` (hover-open timing, stays-open-over-dialog, edge-of-viewport clamping, rapid-hover no-op) — NOT run by the implementer agent (no interactive browser session available); automated coverage in T013 exercises the same scenarios, but a human should still eyeball it once in a real browser before merging
- [X] T015 Run `npm run lint` and `npm run build` to confirm no type or lint errors were introduced

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Foundational)**: No dependencies — start immediately. BLOCKS Phase 2.
- **Phase 2 (User Story 1)**: Depends on Phase 1 completion (needs `src/lib/teams.ts`).
- **Phase 3 (Polish)**: Depends on Phase 2 completion.

### Within Phase 1

- T001, T002 can run in parallel ([P], different files).
- T003 depends on T001 and T002 (imports the type and the data).
- T004 depends on T003 (tests the module it produces).

### Within Phase 2

- T005 has no dependency on Phase 2 siblings (pure function, only needs Phase 1 complete).
- T006 depends on T005.
- T007, T008 can run in parallel with T005/T006 (different files, no shared dependency).
- T009 depends on T007 (renders `RosterPreviewDialog`).
- T010 depends on T005 and T009.
- T011 depends on T009 (styles the wrapper T009 introduces).
- T012 depends on T003 (Phase 1) and T009.
- T013 depends on T009, T010, T012 (exercises the fully wired feature).

### Parallel Opportunities

- T001 + T002 together.
- T005 together with T007 + T008 (different files, independent concerns).
- T006 can run alongside T007/T008/T009 once T005 is done.

---

## Parallel Example: Phase 1

```bash
Task: "Add TeamName type to src/types/league.ts"
Task: "Create src/data/teams.ts hardcoded team name list"
```

## Parallel Example: Phase 2

```bash
Task: "Create src/lib/dialogPosition.ts clampToViewport helper"
Task: "Create src/components/RosterPreviewDialog.tsx"
Task: "Create src/components/RosterPreviewDialog.css"
```

---

## Implementation Strategy

### MVP First (and only) — this feature is one user story

1. Complete Phase 1: Foundational (team-name data layer).
2. Complete Phase 2: User Story 1 (the entire hover/dialog behavior).
3. **STOP and VALIDATE**: Run `tests/integration/leaderboard.test.tsx` and the quickstart.md manual steps.
4. Complete Phase 3: Polish (lint/build/manual pass).

---

## Notes

- [P] tasks = different files, no dependencies.
- [US1] label maps every Phase 2 task to the feature's single user story.
- Verify `tests/unit/teams.test.ts` and `tests/unit/dialogPosition.test.ts` fail (or don't exist) before their implementation tasks land, then pass after.
- Commit after each task or logical group.
- Avoid: adding a tooltip/positioning npm dependency (Simplicity First, research.md §1 & §3 already rejected this).
