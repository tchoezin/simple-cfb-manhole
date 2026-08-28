<!--
Sync Impact Report
- Version change: 1.0.1 → 1.1.0
- Modified principles: III. Deterministic Scoring from Live Data — changed
  the data-source rule for conference membership from "live from ESPN" to
  "hardcoded, manually-maintained list checked into the repo"; game results
  (winner/loser/completion) remain sourced live from ESPN. This is a
  behavior change (not wording-only), hence a MINOR bump.
- Added sections: none
- Removed sections: none
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (generic Constitution Check gate, no changes needed)
  - ✅ .specify/templates/spec-template.md (no changes needed)
  - ✅ .specify/templates/tasks-template.md (no changes needed)
  - ✅ .claude/skills/speckit-constitution (this file)
- Follow-up TODOs: TODO(RATIFICATION_DATE) — original adoption date not supplied by user; set to today's date pending confirmation.
-->

# cfb-manhole Constitution

## Core Principles

### I. Simplicity First
The application MUST stay as small and easy to reason about as the leaderboard
feature it serves. Every addition (dependency, abstraction layer, build step,
config option) MUST justify itself against the single page it supports —
a leaderboard showing player name and score. When a simpler approach and a
more "correct" or extensible one both satisfy the current requirement, the
simpler one MUST be chosen. Speculative generality (features, config, or
architecture for hypothetical future needs) is not permitted.

**Rationale**: This is a small pick-em leaderboard for a friend group, not a
platform. Complexity added "just in case" costs more in upkeep than it will
ever save.

### II. Frontend-Only, TypeScript + React
The application MUST be implemented entirely in TypeScript using React, and
MUST NOT introduce a backend server, database, or persistent server-side
process. All state (player rosters, division assignments, picks, computed
scores) MUST be derivable client-side from static/config data and live calls
to external APIs. Any data that must persist across sessions MUST use
client-side storage or static config files checked into the repo — not a
server the team would have to run, deploy, or maintain.

**Rationale**: Removing the backend removes an entire category of operational
concerns (hosting, auth, deployment, uptime) that this project has no need
for, directly supporting Simplicity First.

### III. Deterministic Scoring from Live Data
Game results (which team won, which lost, whether the game has finished)
MUST be sourced from the unofficial ESPN College Football API (e.g.
`https://site.api.espn.com/apis/site/v2/sports/football/college-football/...`).
Conference membership MUST be sourced from a hardcoded, manually-maintained
conference-to-teams list checked into the repo (see Additional Constraints
below), not fetched from ESPN. Given the same team rosters, division
assignments, hardcoded conference list, and ESPN game results, the scoring
engine MUST always compute the same scores — the scoring rules are pure
functions of that data, not stateful or randomized. The point rule MUST be
applied in this precedence order: (1) 3 points if the losing team is owned
by another player in the winning team owner's own division, overriding (2) 2
points if winner and loser shared a conference (per the hardcoded list),
otherwise (3) 1 point by default — awarded only to the player(s) who own the
winning team (team ownership is unique per division, so a team may have at
most one owner per division but different owners across divisions).

**Rationale**: A leaderboard people trust requires scoring that is
predictable, auditable, and reproducible. Game results change constantly and
must stay live; conference membership changes rarely (realignment happens a
few times a decade) but must be *exactly* right for the scoring the league
cares about, and ESPN's own conference/division grouping data has proven
inconsistent in practice (e.g. reporting Sun Belt's East/West divisions as
if they were separate conferences). A hardcoded, human-reviewed list removes
that inconsistency and gives the league administrator direct control over
conference accuracy without depending on a third party's internal taxonomy.

## Additional Constraints

- **Stack**: TypeScript + React only. No backend framework, no server-side
  database, no custom API server.
- **Data source — game results**: The unofficial ESPN site API is the sole
  source of live game data (winner, loser, completion status).
- **Data source — conferences**: A hardcoded conference-to-teams list,
  checked into the repo as project-owned config/data, is the sole source of
  conference membership — never fetched from ESPN or any other live source.
  Player rosters, division assignments, and each player's owned teams remain
  project-owned config/data as well (static files or client-side storage).
- **Single page**: The application ships one page — a leaderboard listing
  each player's name and score, rankable across the whole league regardless
  of division.

## Governance

This constitution supersedes ad-hoc technical preferences for this project.
Any change that adds a backend, a new required framework/language, or
persistent server infrastructure is a MAJOR amendment and MUST update this
document with rationale before implementation begins. New principles or
materially expanded guidance are MINOR amendments. Wording clarifications
and typo fixes are PATCH amendments.

All plans and specs produced by Spec Kit commands for this project MUST be
checked against these principles before implementation; a plan that requires
a backend, a non-TypeScript/React stack, or a non-deterministic scoring path
MUST either be revised or justified here as an amendment first.

**Version**: 1.1.0 | **Ratified**: TODO(RATIFICATION_DATE): original adoption date not provided | **Last Amended**: 2026-08-27
