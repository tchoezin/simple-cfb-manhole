# Tasks: Leaderboard Loading Indicator

**Input**: Design documents from `/specs/006-loading-indicator/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Included — this codebase's established convention (`tests/integration/leaderboard.test.tsx`) adds a `describe` block per feature, and `quickstart.md` for this feature already documents the test expectations.

**Organization**: This feature has a single user story (US1 — P1). Tasks are grouped Setup → Foundational → US1 → Polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Maps to US1 from spec.md

## Path Conventions

Single frontend project — `src/`, `tests/` at repository root (per plan.md).

---

## Phase 1: Setup

**Purpose**: No new dependencies or project scaffolding needed — existing Vite/React/Vitest setup is reused as-is.

- [X] T001 Confirm no new dependency is needed: verify `package.json` still lists no icon/animation library (per research.md decision) before starting implementation.

---

## Phase 2: Foundational

**Purpose**: No shared infrastructure changes are required — this feature touches only one render branch in an existing component and adds one new self-contained component. There are no blocking prerequisites beyond Setup.

**Checkpoint**: Foundation ready — proceed directly to User Story 1.

---

## Phase 3: User Story 1 - See a visual cue while the leaderboard loads (Priority: P1) 🎯 MVP

**Goal**: Replace the plain-text `"Loading leaderboard…"` message with a spinner that is visually distinct, accessible, brand-consistent, and reduced-motion aware.

**Independent Test**: Throttle network requests so the app stays in `status: "loading"` momentarily; confirm the spinner (not text) renders, a screen reader announces "Loading leaderboard…", and the spinner is replaced by the correct next view once loading resolves.

### Tests for User Story 1 ⚠️

> Write these tests FIRST, ensure they FAIL before implementation (no `LoadingIndicator` component exists yet).

- [X] T002 [P] [US1] Add a `describe("LoadingIndicator (006-loading-indicator)")` block to `tests/integration/leaderboard.test.tsx` covering: (a) the component renders a spinner element, (b) the component (or its root) has `aria-hidden="true"` and exposes no accessible text — assert `screen.queryByText("Loading leaderboard…")` is null, (c) the visible/rendered DOM contains no separate plain-text loading paragraph.

### Implementation for User Story 1

- [X] T003 [P] [US1] Create `src/components/LoadingIndicator.tsx`: a props-less component rendering an `aria-hidden="true"` spinner element with no text content and no accessible label (per research.md's revised accessibility decision and spec FR-002/FR-004).
- [X] T004 [P] [US1] Create `src/components/LoadingIndicator.css`: spinner styling using brand tokens from `src/styles/theme.css` (e.g. `--color-bronze` for the spin accent) and a `@keyframes` rotation (per spec FR-006). No sr-only/visually-hidden utility class is needed — the indicator carries no text.
- [X] T005 [US1] In `LoadingIndicator.css`, gate the rotation animation behind `@media (prefers-reduced-motion: no-preference)` so a static (non-rotating) ring renders when reduced motion is preferred (spec FR-005, SC-003; depends on T004).
- [X] T006 [US1] In `src/App.tsx`, import `LoadingIndicator` and replace `{state.status === "loading" && <p>Loading leaderboard…</p>}` with `{state.status === "loading" && <LoadingIndicator />}` (depends on T003).
- [X] T007 [US1] Run `npm test` and confirm the T002 tests now pass, and all pre-existing tests in `tests/integration/leaderboard.test.tsx` still pass unmodified (depends on T002, T003, T004, T005, T006).

**Checkpoint**: User Story 1 (the entire feature) is fully functional and independently testable — this is also the final scope of the feature.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final verification against the spec and quickstart.

- [X] T008 Follow `specs/006-loading-indicator/quickstart.md` manually: verify the spinner in a throttled dev-server load, verify the reduced-motion static state via OS accessibility settings, and verify the indicator is silent under a screen reader (VoiceOver or equivalent) — nothing should be announced.
- [X] T009 Run `npm run lint` to confirm no lint errors were introduced in the new files.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Empty — nothing blocks User Story 1.
- **User Story 1 (Phase 3)**: Depends on Setup (T001) only.
- **Polish (Phase 4)**: Depends on User Story 1 (Phase 3) completion.

### Within User Story 1

- T002 (test) should be written and fail before T003–T006 (implementation) begin.
- T003 and T004 can run in parallel (different files: `.tsx` vs `.css`).
- T005 depends on T004 (same file, sequential edit).
- T006 depends on T003 (imports the component).
- T007 depends on all prior US1 tasks.

### Parallel Opportunities

- T002, T003, T004 can all be started in parallel (three different files, no interdependencies at start).
- T005 must follow T004 (same file).
- T006 must follow T003 (needs the component to exist to import it).

---

## Parallel Example: User Story 1

```bash
# Launch in parallel at the start of Phase 3:
Task: "Add LoadingIndicator describe block to tests/integration/leaderboard.test.tsx"
Task: "Create src/components/LoadingIndicator.tsx"
Task: "Create src/components/LoadingIndicator.css"
```

---

## Implementation Strategy

### MVP First (and Only)

This feature has a single P1 user story with no follow-on stories:

1. Complete Phase 1: Setup (T001 — trivial check)
2. Phase 2: Foundational — nothing to do
3. Complete Phase 3: User Story 1 (T002–T007)
4. **STOP and VALIDATE**: Run Phase 4 (T008–T009)
5. Feature complete — ready to merge

---

## Notes

- [P] tasks = different files, no dependencies.
- Commit after T007 (feature functionally complete) and again after T008–T009 (verified).
- No cross-story dependencies to worry about — this is a single-story feature.
