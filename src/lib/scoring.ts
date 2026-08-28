/**
 * Pure scoring engine (constitution III: deterministic, no side effects).
 * See specs/001-pickem-leaderboard/data-model.md for the full rule
 * derivation this implements.
 */
import type {
  Division,
  Game,
  LeaderboardEntry,
  LeaderboardResult,
  Player,
  Team,
} from "../types/league";

export type TeamsById = Map<string, Team>;

/** divisionId -> teamId -> owning playerId (last write wins on collision). */
export type DivisionOwnership = Map<string, Map<string, string>>;

/**
 * Builds a per-division team-ownership lookup from the league roster, for
 * O(1) rivalry-bonus checks in scorePlayerGame (FR-006, FR-017).
 */
export function buildDivisionOwnership(players: Player[]): DivisionOwnership {
  const ownership: DivisionOwnership = new Map();
  for (const player of players) {
    if (!ownership.has(player.divisionId)) {
      ownership.set(player.divisionId, new Map());
    }
    const divisionMap = ownership.get(player.divisionId)!;
    for (const teamId of player.ownedTeamIds) {
      divisionMap.set(teamId, player.id);
    }
  }
  return ownership;
}

export interface DivisionOwnershipCollision {
  divisionId: string;
  teamId: string;
  playerIds: string[];
}

/**
 * Flags any team id owned by more than one player within the same division
 * — a violation of FR-017's data contract (league-data-schema.md rule 3).
 * This does not throw; it's a diagnostic helper for validating
 * `src/data/league.ts`, since ownership uniqueness is a manually-maintained
 * contract, not a runtime-enforced constraint (constitution I: Simplicity
 * First — no admin UI to validate against).
 */
export function findDivisionOwnershipCollisions(
  players: Player[],
): DivisionOwnershipCollision[] {
  const byDivision = new Map<string, Map<string, string[]>>();
  for (const player of players) {
    if (!byDivision.has(player.divisionId)) {
      byDivision.set(player.divisionId, new Map());
    }
    const teamMap = byDivision.get(player.divisionId)!;
    for (const teamId of player.ownedTeamIds) {
      const owners = teamMap.get(teamId) ?? [];
      owners.push(player.id);
      teamMap.set(teamId, owners);
    }
  }

  const collisions: DivisionOwnershipCollision[] = [];
  for (const [divisionId, teamMap] of byDivision) {
    for (const [teamId, playerIds] of teamMap) {
      if (playerIds.length > 1) {
        collisions.push({ divisionId, teamId, playerIds });
      }
    }
  }
  return collisions;
}

/**
 * Scores one player's outcome for one game (FR-004–FR-007). Precedence:
 * rivalry (3) overrides same-conference (2), which overrides default (1).
 * Returns 0 if the game isn't finished or the player doesn't own the
 * winning team.
 */
export function scorePlayerGame(
  player: Player,
  game: Game,
  teams: TeamsById,
  divisionOwnership: DivisionOwnership,
): 0 | 1 | 2 | 3 {
  if (!game.completed || !game.winnerTeamId || !game.loserTeamId) {
    return 0;
  }
  if (!player.ownedTeamIds.includes(game.winnerTeamId)) {
    return 0;
  }

  const rivalOwnerId = divisionOwnership
    .get(player.divisionId)
    ?.get(game.loserTeamId);
  if (rivalOwnerId && rivalOwnerId !== player.id) {
    return 3; // FR-006 — overrides the same-conference bonus
  }

  const winnerConferenceId = teams.get(game.winnerTeamId)?.conferenceId;
  const loserConferenceId = teams.get(game.loserTeamId)?.conferenceId;
  if (
    winnerConferenceId !== undefined &&
    winnerConferenceId === loserConferenceId
  ) {
    return 2; // FR-005
  }

  return 1; // FR-004
}

/**
 * Aggregates every player's score across their owned teams' finished games
 * and returns the full ranked leaderboard (FR-003, FR-010). `gamesByTeam`
 * maps a team id to that team's full season schedule (as fetched from
 * ESPN); games are deduplicated by id so a matchup between two owned teams
 * isn't double-counted.
 */
export function computeLeaderboard(
  players: Player[],
  _divisions: Division[],
  teams: TeamsById,
  gamesByTeam: Map<string, Game[]>,
): LeaderboardResult {
  const divisionOwnership = buildDivisionOwnership(players);

  const totals = players.map((player) => {
    const seenGameIds = new Set<string>();
    let total = 0;
    for (const teamId of player.ownedTeamIds) {
      const games = gamesByTeam.get(teamId) ?? [];
      for (const game of games) {
        if (seenGameIds.has(game.id)) continue;
        seenGameIds.add(game.id);
        total += scorePlayerGame(player, game, teams, divisionOwnership);
      }
    }
    return { player, total };
  });

  const sorted = [...totals].sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    // Tied players share a rank (FR-010); order them alphabetically by name
    // for a stable, non-arbitrary display order — this never changes rank.
    return a.player.name.localeCompare(b.player.name);
  });

  const entries: LeaderboardEntry[] = [];
  let rank = 0;
  let previousTotal: number | null = null;
  sorted.forEach((entry, index) => {
    if (previousTotal === null || entry.total !== previousTotal) {
      rank = index + 1;
      previousTotal = entry.total;
    }
    entries.push({ player: entry.player, total: entry.total, rank });
  });

  return { entries, computedAt: new Date().toISOString() };
}
