/**
 * Resolves conference membership from the hardcoded conference list
 * (FR-019, constitution III) — never from ESPN. See
 * specs/001-pickem-leaderboard/contracts/conferences-schema.md.
 */
import type { Conference, Team } from "../types/league";

/**
 * Builds a teamId -> Team lookup from the hardcoded conference list, for
 * use as the `teams` argument to `scorePlayerGame`/`computeLeaderboard`
 * (src/lib/scoring.ts). A team id that appears in no conference simply has
 * no entry here — scorePlayerGame treats a missing conferenceId as never
 * matching the same-conference bonus (FR-005), not as an error.
 */
export function buildTeamsById(conferences: Conference[]): Map<string, Team> {
  const teams = new Map<string, Team>();
  for (const conference of conferences) {
    for (const teamId of conference.teamIds) {
      teams.set(teamId, { id: teamId, conferenceId: conference.id });
    }
  }
  return teams;
}

export interface ConferenceCollision {
  teamId: string;
  conferenceIds: string[];
}

/**
 * Flags any team id listed under more than one conference — a violation of
 * conferences-schema.md rule 2. Diagnostic only, not runtime-enforced
 * (constitution I: Simplicity First — no admin UI to validate against),
 * mirroring findDivisionOwnershipCollisions in src/lib/scoring.ts.
 */
export function findConferenceCollisions(
  conferences: Conference[],
): ConferenceCollision[] {
  const byTeam = new Map<string, string[]>();
  for (const conference of conferences) {
    for (const teamId of conference.teamIds) {
      const owners = byTeam.get(teamId) ?? [];
      owners.push(conference.id);
      byTeam.set(teamId, owners);
    }
  }

  const collisions: ConferenceCollision[] = [];
  for (const [teamId, conferenceIds] of byTeam) {
    if (conferenceIds.length > 1) {
      collisions.push({ teamId, conferenceIds });
    }
  }
  return collisions;
}
