/**
 * Resolves division display names from the existing hardcoded division
 * list (src/data/league.ts) — the same source already used by
 * computeLeaderboard's rivalry-bonus logic (src/lib/scoring.ts). Purely a
 * display concern for the leaderboard's Division column
 * (004-division-column, FR-002, FR-005); never used to filter, group, or
 * re-rank the leaderboard.
 */
import type { Division } from "../types/league";

/**
 * Builds a divisionId -> Division lookup from the hardcoded division list.
 * Mirrors buildTeamsById (src/lib/conferences.ts) and buildTeamNamesById
 * (src/lib/teams.ts).
 */
export function buildDivisionsById(divisions: Division[]): Map<string, Division> {
  const divisionsById = new Map<string, Division>();
  for (const division of divisions) {
    divisionsById.set(division.id, division);
  }
  return divisionsById;
}

/**
 * Resolves a player's divisionId to its display name. An id with no
 * matching entry falls back to the raw id string rather than throwing or
 * rendering blank — the Division column must still render a usable (if
 * imperfect) value for an unresolvable id (spec Edge Cases, FR-005).
 */
export function resolveDivisionName(
  divisionId: string,
  divisionsById: Map<string, Division>,
): string {
  return divisionsById.get(divisionId)?.name ?? divisionId;
}
