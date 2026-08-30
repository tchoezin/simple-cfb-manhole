---

description: "Task list template for feature implementation"
---

# Tasks: Player Name Hover Indicator

**Input**: Design documents from `/specs/005-player-hover-indicator/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Included — quickstart.md commits to extending `tests/integration/leaderboard.test.tsx`, matching this codebase's existing convention of test coverage for every feature (see 003-hover-player-roster, 004-division-column).

**Organization**: This feature has a single user story (P1) in spec.md. There is no separate Foundational phase — all state the indicator needs (`timerRef`, `dialogOpenForPlayerId`, `HOVER_DELAY_MS`) already exists in `Leaderboard.tsx` from feature 003, so all feature work lives in one implementation phase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1)

## Path Conventions

Single project (existing repo root `src/`, `tests/` — see plan.md Project Structure).

---

## Phase 1: User Story 1 - See that a dialog is about to appear while hovering a player name (Priority: P1) 🎯 MVP

**Goal**: A small circular progress cue appears next to a player's name as soon as the pointer hovers it, visibly animates over the existing 1-second hold, and disappears the instant the roster dialog (feature 003) opens or the pointer leaves early — with no change to the dialog's own timing.

**Independent Test**: Load the leaderboard, hover a player's name, and confirm the cue appears immediately, animates for ~1 second, and disappears exactly as the roster dialog opens; leaving early makes it disappear with no dialog opening.

### Implementation for User Story 1

- [X] T001 [P] [US1] In `src/components/Leaderboard.css`, add a `.hover-progress-indicator` class (small circle, `border-radius: 50%`, sized ~10px, `position: fixed` + `pointer-events: none` so it can track the cursor without intercepting hover) plus a `@keyframes hover-progress-spin` rotation animation using `--color-bronze` (active segment) and `--color-charcoal-light` (track), with `animation-duration: 1s` matching `HOVER_DELAY_MS`, `animation-timing-function: linear`, `animation-iteration-count: 1`, `animation-fill-mode: forwards` — per research.md
- [X] T002 [US1] In `src/components/Leaderboard.tsx`, add a `hoveringPlayerId: string | null` state value and a `cursorPos: {x,y} | null` state value; set both in `handleEnterName` on hover-start (from `event.clientX/clientY`), keep `cursorPos` updated via a new `handleMoveName` on `mouseMove`, and clear both in `close()` (covers both early-leave via `handleLeaveName` and the dialog-open case, since `close()` already runs on early leave, and the dialog-open path clears the cue by only rendering it when `dialogOpenForPlayerId !== playerId`, per FR-004) — depends on nothing, can proceed alongside T001
- [X] T003 [US1] In `src/components/Leaderboard.tsx`, inside the `.player-name-hover` wrapper span, render `<span className="hover-progress-indicator" aria-hidden="true" style={{ left: cursorPos.x + 12, top: cursorPos.y + 12 }} />` when `hoveringPlayerId === playerId && dialogOpenForPlayerId !== playerId && cursorPos` — positioned at the cursor (per explicit user direction, 2026-08-30), not anchored to the name — depends on T001 (class must exist), T002 (state must exist)
- [X] T004 [US1] Integration tests in `tests/integration/leaderboard.test.tsx` using fake timers (mirroring existing 003 hover tests): (a) the indicator element is present immediately after `mouseEnter` on a player's name, before advancing timers; (b) the indicator is absent after `mouseLeave` fired before `HOVER_DELAY_MS` elapses, and no dialog opened; (c) the indicator is absent once timers are advanced past `HOVER_DELAY_MS` and the roster dialog is open; (d) re-entering after leaving shows the indicator again (fresh hold) — depends on T002, T003

**Checkpoint**: User Story 1 is fully functional and independently testable — this is the entire feature (spec has only one user story).

---

## Phase 2: Polish & Cross-Cutting Concerns

**Purpose**: Final validation of the whole feature.

- [ ] T005 [P] Run the manual verification steps in `specs/005-player-hover-indicator/quickstart.md` against `npm run dev` (cue timing, disappearance on dialog-open/early-leave, short/long names, rapid cross-name hovering) — a human should eyeball the animation once in a real browser before merging; automated coverage in T004 exercises the same presence/absence logic
- [X] T006 Run `npm test`, `npm run lint`, and `npm run build` to confirm the new T004 assertions pass, the full existing suite (including feature 003's hover-timing tests, guarding FR-008/SC-005 against regression) still passes, and no type or lint errors were introduced

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (User Story 1)**: No blocking prerequisite phase — all shared state (`timerRef`, `dialogOpenForPlayerId`, `HOVER_DELAY_MS`) already exists from feature 003.
- **Phase 2 (Polish)**: Depends on Phase 1 completion.

### Within Phase 1

- T001 and T002 have no dependency on each other (different files: `Leaderboard.css` vs. `Leaderboard.tsx` state) — can run in parallel.
- T003 depends on T001 (CSS class) and T002 (state to read).
- T004 depends on T002 and T003 (exercises the fully wired feature).

### Parallel Opportunities

- T001 together with T002 (different files).

---

## Parallel Example: Phase 1

```bash
Task: "Add .hover-progress-indicator CSS + @keyframes to src/components/Leaderboard.css"
Task: "Add hoveringPlayerId state and wire it into handleEnterName/close in src/components/Leaderboard.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: User Story 1 (T001–T004)
2. **STOP and VALIDATE**: Test User Story 1 independently via quickstart.md
3. Complete Phase 2: Polish (T005–T006)
4. Deploy/demo if ready

This feature has only one user story, so Phase 1 delivers the complete, mergeable increment.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Verify tests fail before implementing (write T004 assertions against the pre-T001/T002/T003 codebase first if following strict TDD, or implement T001–T003 first then confirm T004 passes via T006's `npm test` run — either order is fine given the small scope)
- Commit after each task or logical group
- No new dependency, component file, or data file is introduced — matches constitution Principle I (Simplicity First)
