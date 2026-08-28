/**
 * Shared domain types for the cfb-manhole pick'em leaderboard.
 *
 * This is a team-ownership game, not weekly picks: each Player owns a fixed
 * roster of 10 FBS teams for the season. Team ownership is unique only
 * *within* a division (FR-017) — the same team id may appear on players in
 * different divisions. See specs/001-pickem-leaderboard/data-model.md.
 */

/** A league member. */
export interface Player {
  /** Stable, unique identifier (e.g., a slug). */
  id: string;
  /** Display name shown on the leaderboard. */
  name: string;
  /** References Division.id — every player belongs to exactly one division. */
  divisionId: string;
  /**
   * The player's fixed roster of ESPN team ids for the season.
   * Exactly 10 entries (FR-018). No two players who share a divisionId may
   * have overlapping ownedTeamIds (FR-017) — the same id MAY recur across
   * different divisions.
   */
  ownedTeamIds: string[];
}

/**
 * A group of players used only to determine rivalry-bonus eligibility and
 * to scope team-ownership uniqueness (FR-006, FR-009, FR-017) — never used
 * to filter or segment the leaderboard display.
 */
export interface Division {
  /** Stable, unique identifier. */
  id: string;
  /** Human-readable label (admin data-entry clarity only). */
  name: string;
}

/** An FBS college football team, identified by its ESPN team id. */
export interface Team {
  /** ESPN team id (e.g., "59" for Georgia Tech). */
  id: string;
  /**
   * Conference, resolved from the hardcoded conference list
   * (src/data/conferences.ts, FR-019) — never fetched from ESPN.
   */
  conferenceId: string;
}

/**
 * A hardcoded, manually-maintained conference (FR-019, constitution III).
 * Lives in src/data/conferences.ts — never fetched from ESPN. If a
 * conference has named sub-divisions, list every team from every division
 * under the single parent conference entry; don't create one entry per
 * division (see contracts/conferences-schema.md rule 3).
 */
export interface Conference {
  /** Stable, unique identifier (e.g., a slug like "sec"). */
  id: string;
  /** Human-readable label. */
  name: string;
  /** ESPN team ids belonging to this conference. */
  teamIds: string[];
}

/** One college football matchup, sourced from ESPN at load time (FR-011). */
export interface Game {
  /** ESPN event id. */
  id: string;
  /** Season week number. */
  week: number;
  /** ESPN team id. */
  homeTeamId: string;
  /** ESPN team id. */
  awayTeamId: string;
  /** Whether the game has finished (FR-008). */
  completed: boolean;
  /** Set only when completed is true. */
  winnerTeamId: string | null;
  /** Set only when completed is true. */
  loserTeamId: string | null;
}

/**
 * The computed result of applying the point rules to one player's owned
 * teams' finished games (FR-003–FR-007). Derived, not source data.
 */
export interface Score {
  /** References Player.id. */
  playerId: string;
  /** Sum of per-game points. */
  total: number;
}

/** One row of the rendered/ranked leaderboard (FR-010). */
export interface LeaderboardEntry {
  player: Player;
  total: number;
  /** Standard competition ranking: 1, 2, 2, 4, ... (ties share rank). */
  rank: number;
}

/** The full computed leaderboard result, including staleness metadata. */
export interface LeaderboardResult {
  entries: LeaderboardEntry[];
  /** ISO timestamp of when this result was computed. */
  computedAt: string;
}

/**
 * A team's human-readable display name (roster hover preview feature,
 * FR-005). Hardcoded, checked-in data — see src/data/teams.ts and
 * specs/003-hover-player-roster/contracts/team-names-schema.md. Purely a
 * display concern; never read by src/lib/scoring.ts or
 * src/lib/conferences.ts.
 */
export interface TeamName {
  /** ESPN numeric team id (as a string) — same id space as Team.id. */
  id: string;
  /** Human-readable team name (e.g., "Georgia Tech"). */
  name: string;
}
