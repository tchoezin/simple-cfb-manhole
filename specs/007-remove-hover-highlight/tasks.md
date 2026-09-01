# Tasks: Remove Player Row Hover Highlight

**Input**: Design documents from `/specs/007-remove-hover-highlight/`
**Prerequisites**: plan.md, spec.md, quickstart.md

**Tests**: Not requested in the feature spec, and the project currently has no automated test files — no test tasks are included. Verification is manual, per quickstart.md.

**Organization**: This feature has a single user story (P1). All tasks live in that story's phase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Include exact file paths in descriptions

## Path Conventions

Single frontend project: `src/components/`

---

## Phase 1: Setup

*No setup required — this feature modifies one existing file in the existing project; no new dependencies, tooling, or scaffolding needed.*

---

## Phase 2: Foundational

*No foundational/blocking work required — there is no shared infrastructure to build before the user story below.*

---

## Phase 3: User Story 1 - Leaderboard rows no longer change appearance on hover (Priority: P1) 🎯 MVP

**Goal**: Hovering the mouse pointer over any leaderboard row no longer changes that row's background/appearance, while alternating row shading and the unrelated player-name hover interactions (roster dialog, progress indicator) remain unaffected.

**Independent Test**: Load the leaderboard, move the pointer over every row, and confirm no row's appearance changes on hover; confirm alternating shading is unchanged; confirm hovering a player's name still triggers the roster preview dialog and its progress indicator.

### Implementation for User Story 1

- [X] T001 [US1] Remove the `.leaderboard tbody tr:hover { background: var(--color-bronze-tint); }` rule from `src/components/Leaderboard.css` (the block currently preceded by the `/* Distinct highlight on hover ... (FR-004) */` comment); remove that comment along with it since it documents the removed behavior.
- [X] T002 [US1] Search `src/components/Leaderboard.css` and `src/components/Leaderboard.tsx` for any other reference to the removed hover highlight (e.g., a lingering comment, class name, or `--color-bronze-tint` usage tied to row hover) and remove it if found; leave `--color-bronze-tint` itself untouched if it is still used elsewhere.

### Verification for User Story 1

- [X] T003 [US1] Run `npm run dev`, open the leaderboard, and manually verify per `specs/007-remove-hover-highlight/quickstart.md`: no row changes appearance on hover, alternating shading is intact, and hovering a player's name still opens the roster preview dialog with its progress indicator unchanged.
- [X] T004 [US1] Run `npm test` and `npm run lint` to confirm the existing suite and linter still pass with no regressions.

**Checkpoint**: At this point, User Story 1 (the entire feature) should be fully functional and independently verified.

---

## Phase 4: Polish & Cross-Cutting Concerns

*No cross-cutting polish work identified beyond the User Story 1 verification above — this is a single-rule CSS removal with no other affected surfaces.*

---

## Dependencies & Execution Order

- T001 → T002 (T002 depends on T001 being done first so the search reflects the post-removal state) → T003 → T004 (sequential; each verifies the prior step).
- No cross-story dependencies — there is only one user story.

## Parallel Example

This feature has no meaningful parallelization opportunity: it is a single small edit to one file followed by sequential verification steps.

## Implementation Strategy

### MVP = User Story 1 (the entire feature)

1. Complete T001–T002 (the CSS removal).
2. Complete T003–T004 (verification).
3. Feature complete — this is the full scope of the request.
