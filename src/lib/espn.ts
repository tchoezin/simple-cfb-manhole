/**
 * Client for ESPN's unofficial college football site API — the sole source
 * of live game-result data: winner, loser, completion status (FR-011,
 * constitution III). See specs/001-pickem-leaderboard/contracts/espn-api-usage.md.
 *
 * Conference membership is NOT fetched from ESPN — it comes from the
 * hardcoded list in src/data/conferences.ts (FR-019, src/lib/conferences.ts).
 * This client only ever calls one endpoint: a distinct owned team's season
 * schedule (once per unique owned team id, deduplicated across all
 * players' rosters) — never a league-wide weekly scoreboard (research.md §2)
 * and never the team-detail endpoint (research.md §2a).
 */
import type { Game } from "../types/league";

const BASE_URL =
  "https://site.api.espn.com/apis/site/v2/sports/football/college-football";

/** Raw shape (subset) of an ESPN team-schedule competitor. */
interface EspnCompetitor {
  id: string;
  homeAway: "home" | "away";
  winner?: boolean;
  team?: { id?: string; abbreviation?: string };
}

/** Raw shape (subset) of an ESPN team-schedule event. */
interface EspnScheduleEvent {
  id: string;
  week?: { number?: number };
  competitions?: Array<{
    competitors?: EspnCompetitor[];
    status?: { type?: { completed?: boolean } };
  }>;
}

interface EspnScheduleResponse {
  events?: EspnScheduleEvent[];
}

/** Thrown when an ESPN fetch fails or returns an unexpected shape. */
export class EspnFetchError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "EspnFetchError";
  }
}

/** Fetches the raw season schedule response for one ESPN team id. */
export async function fetchTeamSchedule(
  teamId: string,
): Promise<EspnScheduleResponse> {
  const response = await fetch(`${BASE_URL}/teams/${teamId}/schedule`);
  if (!response.ok) {
    throw new EspnFetchError(
      `ESPN schedule fetch failed for team "${teamId}" (${response.status})`,
    );
  }
  return (await response.json()) as EspnScheduleResponse;
}

/**
 * Maps a raw ESPN schedule response into this app's Game[] shape.
 * Only events with two competitors and a resolvable team id on each side
 * are included; anything else is skipped rather than thrown, since a
 * partially-shaped bye-week or exhibition entry shouldn't fail the whole
 * fetch (FR-015's failure handling operates at the per-team-fetch level,
 * not the per-event level).
 */
export function mapTeamSchedule(raw: EspnScheduleResponse): Game[] {
  const events = raw.events ?? [];
  const games: Game[] = [];

  for (const event of events) {
    const competition = event.competitions?.[0];
    const competitors = competition?.competitors ?? [];
    const home = competitors.find((c) => c.homeAway === "home");
    const away = competitors.find((c) => c.homeAway === "away");
    const homeTeamId = home?.team?.id ?? home?.team?.abbreviation;
    const awayTeamId = away?.team?.id ?? away?.team?.abbreviation;
    if (!homeTeamId || !awayTeamId) continue;

    const completed = competition?.status?.type?.completed ?? false;
    let winnerTeamId: string | null = null;
    let loserTeamId: string | null = null;
    if (completed) {
      if (home?.winner) {
        winnerTeamId = homeTeamId;
        loserTeamId = awayTeamId;
      } else if (away?.winner) {
        winnerTeamId = awayTeamId;
        loserTeamId = homeTeamId;
      }
    }

    games.push({
      id: event.id,
      week: event.week?.number ?? 0,
      homeTeamId,
      awayTeamId,
      completed,
      winnerTeamId,
      loserTeamId,
    });
  }

  return games;
}

/**
 * Fetches and maps the season schedule for one distinct owned team id.
 * Throws EspnFetchError on any failure — callers are expected to catch at
 * the batch level and fall back to cached data (FR-015).
 */
export async function fetchOwnedTeamGames(teamId: string): Promise<Game[]> {
  const scheduleRaw = await fetchTeamSchedule(teamId);
  return mapTeamSchedule(scheduleRaw);
}
