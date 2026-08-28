# Implementation Plan: Brand Color Refresh — Larger Header Logo

**Branch**: `002-brand-color-refresh` | **Date**: 2026-08-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-brand-color-refresh/spec.md`, refined by user
follow-up: "make the size of the logo a header size, it's too small at the moment"

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

FR-001 already requires the logo to be the header's brand mark; this is a further sizing pass on
top of the two prior header tweaks (centering + first size increase to `4.5rem`, then dark-mode
removal). The user says the logo is still too small — it should read as "header size," i.e. a
prominent visual anchor comparable to a page heading, not a small icon next to text. This plan
increases `.site-header__logo`'s height again and gives the header itself more vertical room
(`padding`) so the larger mark doesn't feel cramped against the border. No markup or component
logic changes — CSS-only, in `src/components/Header.css`.

## Technical Context

**Language/Version**: TypeScript 5.6 (React 18.3, ES2020+ target via Vite); this change is
CSS-only
**Primary Dependencies**: None new — plain CSS custom properties/values, no new dependency
**Storage**: N/A
**Testing**: Vitest + @testing-library/react (existing suite); no assertions target logo
dimensions today, and none are needed — size is a visual/CSS concern, not behavior
**Target Platform**: Browser (client-side only, per constitution Principle II)
**Project Type**: Single-page web application (frontend-only)
**Performance Goals**: N/A — a larger locally-bundled image has no meaningful performance impact
**Constraints**: Must keep the header responsive (FR-007 — no page-level horizontal scroll or
overflow at phone width) even at the larger size; must preserve centering (already in place) and
the FR-009 image-load-failure fallback (already in place, unaffected by sizing)
**Scale/Scope**: One file, `src/components/Header.css` — adjust `.site-header__logo` height and
`.site-header` padding; no other file changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Simplicity First**: PASS. Pure value tweak to two existing CSS rules; no new rule,
  selector, media query, or dependency introduced.
- **II. Frontend-Only, TypeScript + React**: PASS. No backend/server/persistence touched.
- **III. Deterministic Scoring from Live Data**: N/A. Does not touch scoring, game results, or
  conference data.

No violations — Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/002-brand-color-refresh/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md         # Phase 1 output (/speckit.plan command) — N/A, no data entities change
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # N/A — no external interface change (CSS-only)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── Header.tsx        # Unchanged (logic already handles centering + FR-009 fallback)
│   └── Header.css        # Modified: increase .site-header__logo height and .site-header padding
└── ...                    # No other file affected
```

**Structure Decision**: Existing single-project frontend structure (`src/`, `tests/`) is
unchanged. This feature touches only `src/components/Header.css`.

## Complexity Tracking

*No violations — table not needed.*
