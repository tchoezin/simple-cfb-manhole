# Implementation Plan: Pick'em Leaderboard

**Branch**: `001-pickem-leaderboard` | **Date**: 2026-08-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-pickem-leaderboard/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

A single static page that lists every player in the cfb-manhole team-ownership
league ranked by total score. Each player owns a fixed roster of 10 FBS teams
for the season (unique within their division, but the same team may be
independently owned by a player in a different division). Scores are
recomputed client-side on every page load: for each distinct owned team, the
app fetches that team's season schedule/results from ESPN's unofficial API,
looks up each team's conference from a hardcoded, manually-maintained
conference list (not from ESPN — research.md §2a), and for every finished
game a team won, awards its owner(s) 1 point by default, 2 if the
winning/losing teams share a conference, or 3 (overriding the conference
bonus) if the losing team is owned by another player in that owner's own
division. The scoring engine is a pure function of team-ownership data +
hardcoded conferences + ESPN game results. No backend, database, or
authentication is introduced — the app is a static TypeScript + React
bundle, with last-known scores cached client-side to survive a failed API
call.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18+
**Primary Dependencies**: React, Vite (dev server + static build), no state-management or backend framework — plain fetch to ESPN's site API
**Storage**: N/A (no database/server). League roster/divisions/team-ownership, and now also the conference-to-teams list (FR-019), live as version-controlled TypeScript data modules in `src/data/`. Last-known-good scores are cached in the browser's `localStorage` solely as a fallback display when the ESPN API is unreachable (FR-015).
**Testing**: Vitest (unit tests for the scoring engine and data validation) + React Testing Library (component/integration tests for the leaderboard render)
**Target Platform**: Static web app, served as pre-built static assets (any static host: GitHub Pages, Netlify, Vercel static, etc.); runs entirely in the visitor's browser
**Project Type**: Web — single frontend project, no backend
**Performance Goals**: Leaderboard is interactive within 5s of page load (SC-001); scoring recompute for the full league completes well within that budget (client-side computation over at most a few hundred distinct owned teams' season schedules, no heavy processing)
**Constraints**: No backend/server component (constitution II); no authentication (FR-013); scores recomputed on page load only, no polling (FR-014); must degrade gracefully to last-known data + stale notice when the ESPN endpoint fails (FR-015); browser-only fetch to a third-party unofficial API with no published SLA; team ownership is unique per division, not league-wide (FR-017), so the same team's win can score multiple players independently
**Scale/Scope**: One page; league of dozens of players across roughly single-digit-to-low-double-digit divisions (validated up to 50 players / 10 divisions per SC-004), each with a fixed 10-team roster; up to ~500 distinct (player, team) ownership entries, deduplicated to a smaller set of distinct owned teams whose season schedules are fetched

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|---|---|---|
| I. Simplicity First | No dependency, abstraction, or build step beyond what a one-page leaderboard needs | **PASS** — React + Vite + a small scoring module; no router, no state library, no CSS framework required for a single page |
| II. Frontend-Only, TypeScript + React | No backend/server/DB introduced; all state client-derivable | **PASS** — all computation happens in the browser; `localStorage` fallback is client-side only |
| III. Deterministic Scoring from Live Data | Scoring is a pure function of team ownership + hardcoded conferences + ESPN game data; precedence order 3 > 2 > 1 enforced | **PASS** — scoring engine designed as a pure function (see data-model.md); ESPN's site API is the sole source of game-result truth (FR-011), conference truth comes from the hardcoded list (FR-019) |
| Additional Constraint: Stack | TypeScript + React only | **PASS** |
| Additional Constraint: Data source — game results | Unofficial ESPN site API only for live game data | **PASS** |
| Additional Constraint: Data source — conferences | Hardcoded, manually-maintained list only, never fetched from ESPN | **PASS** — `src/data/conferences.ts` (research.md §2a) |
| Additional Constraint: Single page | One leaderboard page, no other routes | **PASS** — no router; a single `App` component |

No violations — Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-pickem-leaderboard/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md         # Phase 1 output (/speckit.plan command)
├── quickstart.md         # Phase 1 output (/speckit.plan command)
├── contracts/            # Phase 1 output (/speckit.plan command)
│   ├── league-data-schema.md
│   └── espn-api-usage.md
└── tasks.md              # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── data/
│   ├── league.ts           # Manually-maintained: players, divisions, per-division team ownership (FR-012)
│   └── conferences.ts      # Manually-maintained: conference-to-teams list (FR-019) — never fetched from ESPN
├── lib/
│   ├── espn.ts             # ESPN unofficial API client (fetch a team's schedule/results only — no conference lookup)
│   ├── scoring.ts          # Pure scoring engine (1/2/3-point precedence rule, per-division ownership aware)
│   └── cache.ts            # localStorage last-known-scores fallback (FR-015)
├── types/
│   └── league.ts           # Player, Division, Team, Game, Score types
├── components/
│   ├── Leaderboard.tsx      # Ranked table of players + scores
│   └── StaleDataNotice.tsx  # Visible notice when showing cached/stale data
├── App.tsx                  # Single page: loads data, computes scores, renders Leaderboard
└── main.tsx                 # Vite/React entry point

tests/
├── unit/
│   └── scoring.test.ts      # Scoring engine: default/conference/rivalry precedence, per-division ownership, edge cases
└── integration/
    └── leaderboard.test.tsx # Renders leaderboard from fixture data + mocked ESPN responses
```

**Structure Decision**: Single frontend-only project at the repository root
(no `backend/`, no monorepo split) since the constitution forbids a backend
entirely. `src/data/league.ts` and `src/data/conferences.ts` are the two
files the league administrator edits by hand — `league.ts` each season (per
FR-012/FR-018), `conferences.ts` only when conference realignment actually
happens (FR-019); everything else is application code.

## Complexity Tracking

*No Constitution Check violations — this section is intentionally empty.*
