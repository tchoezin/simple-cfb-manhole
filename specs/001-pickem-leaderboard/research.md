# Phase 0 Research: Pick'em Leaderboard

## 1. Calling the unofficial ESPN API directly from the browser

**Decision**: Call `site.api.espn.com` endpoints directly from client-side
`fetch`, no proxy.

**Rationale**: `site.api.espn.com` responses include permissive CORS headers
(`Access-Control-Allow-Origin: *`) for its public/unofficial site API
endpoints, which is why it's widely used client-side in hobby projects. This
lets the app stay backend-free per constitution II. If a specific endpoint
needed turns out not to send CORS headers, the fallback is a static
build-time fetch instead of a runtime one (still no server), not adding a
proxy server.

**Alternatives considered**:
- **Server-side proxy** — rejected: violates constitution II (no backend).
- **Serverless function as CORS proxy** — rejected: still a backend
  component to build/deploy/maintain, against Simplicity First.

## 2. Which ESPN endpoints supply the needed data (team-ownership model)

**Decision**: For each *distinct* team appearing on any player's roster,
fetch that team's season schedule via
`site.api.espn.com/apis/site/v2/sports/football/college-football/teams/{teamId}/schedule`
for game results only (winner, loser, completion status). Conference
membership is **not** fetched from ESPN at all — see §2a.

**Rationale**: The team-ownership model means the app only ever needs to know
how *owned* teams' seasons went — not the full slate of every FBS game each
week. A team's schedule endpoint returns every game that team has played or
will play, each with the opponent's team id, a completion flag, and the
result (win/loss) once played — everything FR-008/FR-011 need per owned
team. Fetching per distinct owned team (deduplicated across all rosters,
since the same team can appear on multiple players' rosters across
divisions per FR-017) is far fewer requests than scanning every week's
league-wide scoreboard and filtering.

**Alternatives considered**:
- **Weekly scoreboard scan, filtered to owned teams** (the earlier picks-era
  approach) — rejected now: with team ownership instead of weekly picks, the
  set of relevant games is "all games any owned team plays all season,"
  which the per-team schedule endpoint answers directly and more efficiently
  than replaying every week's full scoreboard client-side.
- **Team endpoint only, ignoring schedule** — rejected: the team endpoint
  alone doesn't return game-by-game results.

## 2a. Sourcing conference membership (superseded decision)

**Decision**: Conference membership comes from a hardcoded,
manually-maintained `conferenceId -> teamId[]` list in
`src/data/conferences.ts` (FR-019, constitution III), checked into the repo
like `league.ts`. ESPN's team-detail endpoint is no longer called at all —
the app only ever fetches each owned team's *schedule* (§2), never its
detail/conference info.

**Rationale**: This project originally fetched conference membership live
from ESPN's team-detail endpoint (`team.groups`/`team.conference`), including
a resolution step to walk up from a sub-division group (e.g. "Sun Belt East")
to its parent conference when `groups.isConference` was `false`. In practice
this proved fragile: ESPN's own grouping data is a moving target as
conferences realign, and mapping it correctly requires guessing at API
shape edge cases the league administrator has no visibility into or control
over. A hardcoded list removes that entire class of risk — conference
membership changes a few times a decade at most, so requiring a manual edit
on realignment is a non-burden, and the administrator can see and fix any
error directly, immediately, without depending on how a third party's API
happens to model divisions this week.

**Alternatives considered**:
- **Live ESPN team-detail fetch with `isConference` walk-up** (the prior
  approach) — rejected: worked for the conferences tested, but is an
  unaudited trust boundary on a third party's internal taxonomy; a single
  case (Sun Belt's East/West split reporting as separate "conferences")
  already broke the same-conference scoring bonus (FR-005) for affected
  teams before this decision was made.
- **Live fetch with a hardcoded override list for known-fragile cases** —
  rejected: adds two data sources to keep in sync (a live fetch path *and*
  an exceptions list) for no benefit over a single hardcoded list, against
  Simplicity First.

## 3. Resolving the losing team's owner(s) for the rivalry bonus

**Decision**: Build an in-memory lookup, per division, of `teamId -> playerId`
from `src/data/league.ts` at load time (`Map<divisionId, Map<teamId,
playerId>>`). For a finished game won by team W (owned by player P in
division D), check `divisionOwnership.get(D).get(loserTeamId)` — if present
and not P themself, the rivalry bonus applies.

**Rationale**: This directly mirrors FR-006 and FR-017's per-division
uniqueness: ownership only needs to be looked up *within* the winning
owner's own division, and building one lookup map per division at load time
keeps the check O(1) per game rather than scanning every player's roster.

**Alternatives considered**:
- **Single league-wide `teamId -> playerId` map** — rejected: unsound now
  that the same team can have different owners in different divisions
  (FR-017); a league-wide map can only hold one owner per team.

## 4. Framework/tooling for a single-page TypeScript + React app

**Decision**: Vite as the dev server and static build tool; plain React
(no Next.js/Remix) since there is exactly one page and no routing or SSR
need.

**Rationale**: Vite is the lowest-ceremony way to get a TypeScript + React
static build with fast local iteration — directly aligned with Simplicity
First. A meta-framework would add server-rendering, routing, and API-route
concepts this single static page doesn't use.

**Alternatives considered**:
- **Create React App** — rejected: unmaintained/deprecated upstream.
- **Next.js** — rejected: brings in a server-capable framework for a feature
  that is one static page; conflicts with Simplicity First and the
  no-backend constraint if its server features were ever reached for.

## 5. Testing approach

**Decision**: Vitest for unit tests (scoring engine, edge cases, per-division
ownership resolution) + React Testing Library for rendering the
`Leaderboard` component against fixture data and mocked `fetch` responses.

**Rationale**: Vitest shares Vite's config/transform pipeline (no separate
Jest/babel setup), keeping the toolchain minimal. RTL is the standard,
low-ceremony way to assert on rendered React output without testing
implementation details.

**Alternatives considered**:
- **Jest** — rejected: duplicate transform config alongside Vite for no
  added benefit.
- **End-to-end browser testing (Playwright/Cypress)** — deferred: not
  required to validate the scoring logic or single-page render that make up
  this feature's entire surface; can be added later without any redesign.

## 6. Handling a failed/incomplete ESPN response (FR-015)

**Decision**: On load, attempt all per-team ESPN fetches; on full success,
compute scores and store the computed result (not raw API payloads) in
`localStorage` keyed by season. On any failure or incomplete data, read that
cached result if present and render it with a visible "showing last-known
scores as of [cache timestamp]" notice; if no cache exists yet, render a
clear "scores unavailable" state.

**Rationale**: Directly satisfies FR-015 and the "public, no login, static
host" constraints — no server-side cache is needed, and the failure mode is
handled entirely in the browser the user is already in.

**Alternatives considered**:
- **In-memory-only cache (no localStorage)** — rejected: doesn't survive a
  reload, which is exactly the moment FR-015's fallback is needed (scores
  recompute only on page load, per FR-014).
- **Partial-success rendering (use whichever teams' fetches succeeded)** —
  deferred: simpler all-or-nothing fallback (full cache or full failure
  notice) is easier to reason about and test; can be revisited if partial
  ESPN outages prove common in practice.

## Outstanding NEEDS CLARIFICATION

None. All technical unknowns above have a decision made against
constitution-driven defaults (simplicity, no backend, ESPN API only) and the
corrected team-ownership domain model.
