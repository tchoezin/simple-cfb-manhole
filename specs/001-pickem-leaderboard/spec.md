# Feature Specification: Pick'em Leaderboard

**Feature Branch**: `001-pickem-leaderboard`
**Created**: 2026-08-27
**Status**: Draft
**Input**: User description: "A simple webapp for a college football fantasy team-ownership game called cfb-manhole. The only page will be a leaderboard displaying player name and their score. There are n players in the league and the players are split into m divisions. Divisions are only relevant for scoring. Each player owns a fixed roster of 10 FBS teams for the season. Players will all be ranked against each other on scoring. The core rule: for every finished game where one of a player's owned teams wins, that player gets 1 point by default, 2 points if the winning and losing teams share a conference, or 3 points (overriding the conference bonus) if the losing team is owned by another player in that player's own division."

## Clarifications

### Session 2026-08-27

- Q: How fresh must the leaderboard's scores be relative to real game results? → A: Refresh on page load only — no background polling or manual refresh control.
- Q: What should happen if the external college football data source is unreachable or returns incomplete data when the leaderboard loads? → A: Show the last-known scores with a visible stale/error notice, rather than a blank or error-only page.
- Q: Who should be able to access the leaderboard page? → A: Public, no login required.
- Q: Is viewing past seasons' leaderboards in scope? → A: No — current season only; historical seasons are out of scope.
- Q: How are players, their divisions, and their team rosters entered into the system? → A: Manually — a league administrator hand-enters the player roster, division assignments, and each player's owned teams; there is no in-app form for this.
- Q: What does "manual entry" mean concretely — a separate data file the admin edits, or something else? → A: The admin (developer) edits this data directly in the application's source code/config, then rebuilds/redeploys — it is not read from an external file or service at runtime, and there is no separate admin tool.
- Q: Confirmed — scores are calculated on page load only, with no background or periodic recalculation.
- Q: **Correction** — the game is team-ownership, not weekly picks. Each player owns a fixed set of 10 FBS teams for the entire season (not a weekly prediction). A player scores when one of *their owned teams* wins a game: 1 point by default, 2 points if the winning and losing teams share a conference, or 3 points (overriding the conference bonus, not stacking with it) if the losing team is owned by another player in the winning team's owner's division. → A: Confirmed; this replaces the earlier "picks" model throughout the spec.
- Q: Can a player's 10-team roster change during the season (trades/waivers)? → A: No — fixed for the whole season, set once by the administrator before the season starts.
- Q: Is a team's ownership unique across the whole league, or only within a division? → A: Only within a division — no two players *in the same division* may own the same team, but the same team may independently appear on a roster in a different division (e.g., a player in Division A and a player in Division B can both own Georgia Tech).
- Q: Should conference membership continue to come live from the ESPN data source, or switch to a hardcoded list? → A: Switch to a hardcoded, manually-maintained conference-to-teams list checked into the repo (FR-019) — game results (winner/loser/completion) remain live from ESPN, but conference membership does not. Prompted by the live source reporting conferences with internal divisions (e.g. Sun Belt East/West) as if they were separate conferences, which silently broke the same-conference scoring bonus (FR-005) for affected teams.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View the league leaderboard (Priority: P1)

A league member opens the app during the season to see how every player in the
league stands, ranked from highest to lowest score, regardless of which
division each player belongs to.

**Why this priority**: This is the entire product — a single leaderboard view.
Without it there is no feature.

**Independent Test**: Load the app with a populated set of players, team
rosters, and completed games; confirm every player appears exactly once,
sorted by score descending, with their name clearly visible next to their
score.

**Acceptance Scenarios**:

1. **Given** a league with players across multiple divisions and a mix of
   finished and unfinished games, **When** a user opens the leaderboard,
   **Then** every player is listed with their current total score, ordered
   from highest to lowest score.
2. **Given** two or more players have the same total score, **When** the
   leaderboard is displayed, **Then** those players are shown adjacent to one
   another (tied) rather than in an arbitrary or misleading order.
3. **Given** no games have finished yet this season, **When** a user opens the
   leaderboard, **Then** every player is listed with a score of 0.

---

### User Story 2 - Score updates as owned teams win (Priority: P2)

A league member checks the leaderboard after games have been completed and
sees scores that reflect how each player's owned teams performed, according
to the league's point rules.

**Why this priority**: The scoring logic is the core value proposition of the
leaderboard — without correct, current scores the leaderboard is just a list
of names.

**Independent Test**: Provide a fixed set of team rosters and a game result,
verify the resulting scores match the expected point rule outcome for each
affected player.

**Acceptance Scenarios**:

1. **Given** a finished game where one player's owned team beat a team not
   owned by any division rival, and the two teams are from different
   conferences, **When** the leaderboard is computed, **Then** that player
   receives 1 point for that game.
2. **Given** a finished game where a player's owned team beat a team from the
   same conference (and the losing team is not owned by a division rival),
   **When** the leaderboard is computed, **Then** that player receives 2
   points for that game.
3. **Given** a finished game where a player's owned team beat a team owned by
   another player in that same player's division, **When** the leaderboard
   is computed, **Then** the winning team's owner receives 3 points for that
   game, regardless of whether the two teams also share a conference.
4. **Given** a game that has not yet finished, **When** the leaderboard is
   computed, **Then** no points are awarded for that game to any player.
5. **Given** a finished game where one of a player's owned teams lost, **When**
   the leaderboard is computed, **Then** that player receives 0 points for
   that game (only the winning team's owner can score on a game).
6. **Given** a finished game between two teams where neither team is owned by
   any player, **When** the leaderboard is computed, **Then** no player
   receives points for that game.

---

### User Story 3 - Divisions affect scoring only, not visibility (Priority: P3)

A league member confirms that division membership changes point values but
never splits the leaderboard into separate views or rankings.

**Why this priority**: Clarifies a rule that is easy to get wrong (divisions
could mistakenly be implemented as separate leaderboards) but is lower
priority than getting the core score calculation right.

**Independent Test**: With players spread across at least two divisions,
confirm the leaderboard remains one single ranked list and that a player's
division only ever influences their score via the rivalry bonus.

**Acceptance Scenarios**:

1. **Given** players belonging to different divisions, **When** the
   leaderboard is displayed, **Then** all players appear in one combined,
   ranked list — never split or filtered by division.

---

### Edge Cases

- What happens when a game's winning team is not owned by any player? No
  points are awarded to anyone for that game, even if the losing team is
  owned.
- What happens when a game ends in a status other than a clear win/loss
  (e.g., cancelled, postponed)? No points are awarded for that game to any
  player until/unless it is played to completion.
- What happens when a division has only one player in it? The rivalry bonus
  (3 points) can never trigger for that player's owned teams, since it
  requires another player in the same division to own the losing team; the
  score falls back to the default/conference rule.
- What happens when the losing team is owned by a player in a *different*
  division than the winning team's owner? The rivalry bonus does not apply
  (it requires same-division ownership); the default or same-conference rule
  applies instead.
- What happens if a player's owned team loses a game? That player receives 0
  points for that game (they cannot score on a loss).
- What happens when the same team is owned by different players in different
  divisions and that team wins a game? Each owner is scored independently
  and simultaneously for that win (each applying their own division's
  rivalry check against the losing team), since ownership is scoped per
  division rather than exclusive league-wide.
- What happens if the external data source is unreachable or returns
  incomplete data when the page loads? The leaderboard shows the last
  successfully loaded scores along with a visible notice that the data may be
  stale, rather than showing a blank page or a hard error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST display a single leaderboard view listing
  every player in the league by name alongside their current total score.
- **FR-002**: The leaderboard MUST rank all players against one another in one
  combined list, sorted by score from highest to lowest, independent of
  division membership.
- **FR-003**: The system MUST calculate each player's score as the sum of
  points earned across all finished games won by any team on that player's
  roster.
- **FR-004**: For each finished game, the system MUST award 1 point to each
  player who owns the winning team (there may be zero, one, or — since
  ownership is unique only per division (FR-017) — multiple such players,
  one per division), unless a higher-value bonus rule (FR-005 or FR-006)
  applies to that player for that game.
- **FR-005**: For each finished game where the winning and losing teams
  belong to the same conference, the system MUST award 2 points (instead of
  1) to each player who owns the winning team, unless the rivalry bonus
  (FR-006) applies to that player.
- **FR-006**: For each finished game, for each player who owns the winning
  team, if the losing team is also owned by another player who shares that
  winning-team owner's division, the system MUST award 3 points to the
  winning team's owner — this rivalry bonus overrides (does not stack with)
  the same-conference bonus, and is evaluated independently per owner when
  the winning team has owners in more than one division.
- **FR-007**: The system MUST award 0 points to a player for a game where
  that player owns the losing team, and 0 points to anyone for a game where
  no player owns the winning team.
- **FR-008**: The system MUST only award points for games that have finished;
  games not yet completed MUST NOT affect any player's score.
- **FR-009**: The system MUST support a league divided into multiple
  divisions (m divisions) containing multiple players (n players total), where
  division membership affects only the scoring rules (FR-006, FR-017), never
  which players appear on or are excluded from the leaderboard.
- **FR-010**: The system MUST reflect players who are tied on score as
  occupying the same rank position on the leaderboard rather than an
  arbitrary tiebreak order.
- **FR-011**: The system MUST determine each finished game's winner, loser,
  and completion status from an authoritative, regularly updated college
  football data source.
- **FR-019**: The system MUST determine each team's conference membership
  from a hardcoded, manually-maintained conference-to-teams list — not from
  the live data source used for game results (FR-011). The league
  administrator maintains this list the same way they maintain league
  configuration (FR-012): by hand-editing it in the application's source
  code and redeploying.
- **FR-012**: League configuration — the roster of players, each player's
  division assignment, and each player's owned FBS teams (fixed for the
  season) — MUST be maintained by the league administrator hand-editing it
  directly in the application's source code/config (with changes taking
  effect on the next build/deploy), not read from an external file or
  service at runtime; the leaderboard page itself MUST NOT provide any form
  or flow for entering or editing players, divisions, or team ownership.
- **FR-013**: The leaderboard MUST be viewable by anyone with the page's
  address; the system MUST NOT require login or any access credential to
  view scores.
- **FR-014**: The system MUST re-fetch and recompute scores from the data
  source each time the leaderboard page is loaded (or reloaded); it MUST NOT
  poll or update in the background while the page remains open.
- **FR-015**: If the data source is unreachable or returns incomplete data
  at load time, the system MUST display the most recently successful scores
  it has along with a visible notice that the data may be stale, rather than
  showing a blank or error-only page. If no previously successful data
  exists yet, the system MUST show a clear message indicating scores are
  unavailable.
- **FR-016**: The leaderboard MUST display standings for the current season
  only; viewing or selecting a past season's standings is out of scope.
- **FR-017**: Each FBS team MUST be assignable to at most one player's
  roster *within a given division* — no two players in the same division may
  own the same team. The same team MAY independently appear on a roster in a
  different division (team ownership is unique per division, not
  league-wide).
- **FR-018**: Each player's roster of owned teams MUST be fixed for the
  entire season; the system has no requirement to support mid-season roster
  changes (trades/waivers).

### Key Entities

- **Player**: A league member. Attributes: name, division membership, fixed
  roster of 10 owned FBS teams, computed total score.
- **Division**: A group of players (m divisions total) used only to
  determine rivalry-bonus eligibility (based on team ownership, not picks);
  not used to filter or segment the leaderboard display.
- **Team**: An FBS college football team. Attributes: conference membership
  (from the hardcoded conference list, FR-019 — not from the live data
  source), and zero or more owning players — at most one owner *per
  division* (FR-017), but potentially a different owner in each other
  division.
- **Game**: A single college football matchup for a given week. Attributes:
  home/away teams, each team's conference, completion status, winning team,
  losing team.
- **Score**: The sum, per player, of points awarded across all finished
  games won by a team on that player's roster, per the point rules
  (FR-004–FR-007).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A league member can determine the current league standings
  (full ranked order of all players) within 5 seconds of opening the app.
- **SC-002**: Given a fixed set of team rosters and finished-game results, the
  score computed for every player matches the expected result of the point
  rules 100% of the time (verified against hand-calculated test cases).
- **SC-003**: Reloading the leaderboard page after a game finishes shows that
  game's effect on scores, with no manual recalculation or configuration
  required by league members.
- **SC-004**: The leaderboard remains readable and correctly ranked for a
  league of at least 50 players across at least 10 divisions without visual
  or ranking errors.

## Assumptions

- "Rival" in the scoring rule (FR-006) means any other player who shares the
  winning team owner's division and owns the losing team — not a separately
  designated 1:1 rival relationship between specific players. A division
  with only one player therefore has no possible rivals, per the Edge Cases
  section.
- Each player owns a fixed roster of exactly 10 FBS teams for the season.
  Team ownership is unique only *within* a division (FR-017) — the same team
  may be owned by different players in different divisions simultaneously.
  Ownership does not change mid-season (FR-018).
- Game results (winner, loser, completion) are determined by the live
  college football data source at game time. Conference membership is
  determined by a hardcoded, manually-maintained conference list instead
  (FR-019) — a deliberate change from an earlier version of this spec,
  after the live source proved to report some conferences' internal
  divisions (e.g. Sun Belt East/West) as if they were separate conferences.
- The leaderboard reflects the full current season to date (cumulative score
  across all finished games in that season), not a single week in isolation
  and not prior seasons.
- League setup (player list, division assignments, and team rosters) is
  maintained by the league administrator editing it directly in the
  application's source code/config and redeploying — not via any runtime
  data file, external service, or in-app form (confirmed — see
  Clarifications; FR-012), since the leaderboard is described as the
  application's only page.
- Ties in score share the same leaderboard rank (standard competition
  ranking), with no additional tiebreaker applied.
- No authentication or access control is required; the leaderboard is a
  public, read-only view suitable for casual sharing among league members.
