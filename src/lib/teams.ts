/**
 * Resolves team display names from the hardcoded team name list
 * (FR-005) — never from ESPN. See
 * specs/003-hover-player-roster/contracts/team-names-schema.md.
 */
import type { TeamName } from "../types/league";

/**
 * Builds a teamId -> name lookup from the hardcoded team name list, for
 * use as the `namesById` argument to `resolveTeamNames`. Mirrors
 * `buildTeamsById` in src/lib/conferences.ts.
 */
export function buildTeamNamesById(teamNames: TeamName[]): Map<string, string> {
  const namesById = new Map<string, string>();
  for (const team of teamNames) {
    namesById.set(team.id, team.name);
  }
  return namesById;
}

/**
 * Resolves a player's owned team ids to display names, preserving order.
 * An id with no matching entry falls back to the raw id string rather
 * than throwing or being omitted — the roster preview dialog must still
 * render a usable (if imperfect) list for an incomplete team-names list
 * (spec Edge Cases).
 */
export function resolveTeamNames(
  teamIds: string[],
  namesById: Map<string, string>,
): string[] {
  return teamIds.map((teamId) => namesById.get(teamId) ?? teamId);
}
