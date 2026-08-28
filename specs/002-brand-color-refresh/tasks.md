---

description: "Task list for: Larger Header Logo — Brand Color Refresh follow-up"
---

# Tasks: Brand Color Refresh — Larger Header Logo

**Input**: Design documents from `/specs/002-brand-color-refresh/`
**Prerequisites**: plan.md, spec.md (User Story 1 / FR-001, FR-007), research.md, data-model.md,
quickstart.md

**Tests**: No test tasks — no existing test asserts logo pixel/rem dimensions, and adding one for
a pure CSS sizing value was rejected in `research.md` as unnecessary (size is a visual concern,
not behavior).

**Organization**: All tasks map to User Story 1 (P1) from `spec.md` — the header/logo brand
requirement (FR-001) and the responsive-layout requirement (FR-007) it must keep satisfying at the
larger size. No Setup or Foundational phase is needed: this is a two-value CSS tweak in an
already-initialized project, isolated to one file.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1 for all tasks here)
- Exact file paths are included in each description

---

## Phase 1: User Story 1 - Header-sized logo (Priority: P1) 🎯 MVP

**Goal**: The header logo reads as the header's dominant visual element ("header size") rather
than a small icon, while the header stays responsive with no page-level overflow (FR-007).

**Independent Test**: Run `npm run dev`, load the page, and confirm the logo is visibly larger and
more prominent than before. Resize to phone width (~320–375px) and confirm no page-level
horizontal scrolling or clipping; resize to desktop width and confirm the header still looks
proportionate.

- [X] T001 [US1] In `src/components/Header.css`, increase `.site-header__logo`'s size. **Revised**
      after user feedback ("still looks tiny"): the logo is a wide wordmark (480×281px), so sizing
      by `height` alone barely grew its width, the dimension that actually reads as "big." Changed
      to `width: min(90%, 24rem); height: auto;` (was `height: 6rem; width: auto;`) — see
      `research.md`'s "Correction" note.
- [X] T002 [P] [US1] In `src/components/Header.css`, increase `.site-header`'s vertical padding
      from `1rem 0` to `1.5rem 0` so the larger logo has proportionate breathing room against the
      bottom border.

**Checkpoint**: User Story 1 (header-sized logo) is fully implemented and independently verifiable
via the Independent Test above.

---

## Phase 2: Polish & Validation

**Purpose**: Confirm the larger logo doesn't break responsiveness and matches quickstart.

- [X] T003 [P] Run `npm run test` and `npm run lint` from the repo root; confirm both pass with no
      regressions. **Result**: 29/29 tests passed, 0 lint errors.
- [ ] T004 Walk through `specs/002-brand-color-refresh/quickstart.md` manually (`npm run dev`,
      visual check at phone/desktop widths) to confirm the larger logo renders as intended with no
      overflow. **Not run** — requires a browser, outside this session's automated tooling.
      Recommend the user run `npm run dev` and eyeball it, especially at phone width.

---

## Dependencies & Execution Order

- **T001** and **T002** both edit `src/components/Header.css` but touch different, non-overlapping
  rules (`.site-header__logo` vs `.site-header`) — parallel-safe as separate edits, though doing
  them in one pass is equally fine given the file's small size.
- **T003** and **T004** depend on T001–T002 being complete; T003 and T004 are parallel-safe with
  each other.

## Parallel Example

```bash
# T001 and T002 touch different rules in the same file and can be reasoned about independently:
Task: "Increase .site-header__logo height in src/components/Header.css"
Task: "Increase .site-header vertical padding in src/components/Header.css"
```

## Implementation Strategy

Single-story, single-file, two-value change — complete T001–T002 together (one coherent,
independently testable increment), then validate with T003–T004.
