# Implementation Plan: Leaderboard Loading Indicator

**Branch**: `006-loading-indicator` | **Date**: 2026-08-30 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/006-loading-indicator/spec.md`

## Summary

Replace the plain-text `"Loading leaderboard…"` message shown in [App.tsx](../../src/App.tsx) while leaderboard data is loading with a small, brand-consistent spinner component. The spinner is a CSS-animated rotating ring with a visually-hidden `"Loading leaderboard…"` label so screen readers keep the same announcement. It respects `prefers-reduced-motion` (no rotation animation when set) and does not touch the existing `loading`/`live`/`stale`/`unavailable` state machine — only what renders for `loading` changes.

## Technical Context

**Language/Version**: TypeScript 5.6, React 18.3 (existing stack, no changes)
**Primary Dependencies**: None new — plain CSS animation, no icon/animation library
**Storage**: N/A
**Testing**: Vitest + @testing-library/react (existing `tests/integration/leaderboard.test.tsx` pattern)
**Target Platform**: Browser (Vite-built SPA)
**Project Type**: Single frontend project (existing `src/` structure)
**Performance Goals**: No measurable perf target beyond existing app — a CSS-only spinner has negligible cost
**Constraints**: Light-mode-only design (per `src/styles/theme.css`, no dark-mode variant); must respect `prefers-reduced-motion`
**Scale/Scope**: One new presentational component + one App.tsx render-branch change

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Simplicity First**: PASS — one small presentational component (`LoadingIndicator`), no new dependency, no new abstraction layer. Plain CSS `@keyframes` spinner, consistent with how `StaleDataNotice` is a single small component with its own CSS file.
- **II. Frontend-Only, TypeScript + React**: PASS — pure client-side rendering change, no backend/server/persistence involved.
- **III. Deterministic Scoring from Live Data**: PASS — this feature touches only the loading-state UI, not scoring, ESPN data, or conference data in any way.

No violations. Complexity Tracking section not needed.

## Project Structure

### Documentation (this feature)

```text
specs/006-loading-indicator/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command) — skipped, no external interface
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── App.tsx                          # MODIFIED: render <LoadingIndicator /> instead of <p>Loading leaderboard…</p>
├── components/
│   ├── LoadingIndicator.tsx         # NEW: spinner component, sr-only label, reduced-motion aware
│   ├── LoadingIndicator.css         # NEW: spinner styles + @keyframes + reduced-motion media query
│   ├── StaleDataNotice.tsx          # (reference pattern — unchanged)
│   └── ...
└── styles/
    └── theme.css                     # (reference — brand tokens reused, unchanged)

tests/
└── integration/
    └── leaderboard.test.tsx          # MODIFIED (or new loading-indicator.test.tsx): asserts spinner
                                       # renders during loading, sr-only text present, and no
                                       # "Loading leaderboard…" *visible* text node in DOM
```

**Structure Decision**: Single frontend project (existing structure, per Constitution II). No new top-level directories — the new component follows the exact `ComponentName.tsx` + `ComponentName.css` colocated pattern already used by `StaleDataNotice` and `Header`.

## Complexity Tracking

*No violations — table omitted.*
