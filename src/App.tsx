/**
 * Single page: loads league data, resolves each owned team's conference
 * from the hardcoded conference list (FR-019 — never from ESPN), fetches
 * live ESPN game results for every distinct owned team, computes the
 * leaderboard, and renders it — or falls back to the last-known cached
 * result with a stale-data notice if any fetch fails (FR-001, FR-014,
 * FR-015).
 */
import { useEffect, useMemo, useState } from "react";
import { divisions, players } from "./data/league";
import { conferences } from "./data/conferences";
import { teamNames } from "./data/teams";
import { fetchOwnedTeamGames } from "./lib/espn";
import { buildTeamsById } from "./lib/conferences";
import { buildTeamNamesById } from "./lib/teams";
import { buildDivisionsById } from "./lib/divisions";
import { loadScores, saveScores } from "./lib/cache";
import { computeLeaderboard } from "./lib/scoring";
import type { Game, LeaderboardResult } from "./types/league";
import { Leaderboard } from "./components/Leaderboard";
import { StaleDataNotice } from "./components/StaleDataNotice";
import { Header } from "./components/Header";
import "./App.css";

// FR-016: current season only — no season selector.
const CURRENT_SEASON = String(new Date().getFullYear());

type LoadState =
  | { status: "loading" }
  | { status: "live"; result: LeaderboardResult }
  | { status: "stale"; result: LeaderboardResult }
  | { status: "unavailable" };

async function loadLeaderboard(): Promise<LoadState> {
  const distinctTeamIds = Array.from(
    new Set(players.flatMap((player) => player.ownedTeamIds)),
  );

  try {
    // Conference membership is hardcoded (FR-019) — no network call.
    const teams = buildTeamsById(conferences);

    const gamesLists = await Promise.all(
      distinctTeamIds.map((teamId) => fetchOwnedTeamGames(teamId)),
    );
    const gamesByTeam = new Map<string, Game[]>();
    distinctTeamIds.forEach((teamId, index) => {
      gamesByTeam.set(teamId, gamesLists[index]);
    });

    const result = computeLeaderboard(players, divisions, teams, gamesByTeam);
    saveScores(CURRENT_SEASON, result);
    return { status: "live", result };
  } catch {
    const cached = loadScores(CURRENT_SEASON);
    return cached
      ? { status: "stale", result: cached }
      : { status: "unavailable" };
  }
}

export default function App() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  // Team display names are static/hardcoded (FR-005) — build the lookup
  // once, no network call involved.
  const teamNamesById = useMemo(() => buildTeamNamesById(teamNames), []);
  // Division display names (004-division-column) — same static source
  // already used by computeLeaderboard's rivalry-bonus logic.
  const divisionsById = useMemo(() => buildDivisionsById(divisions), []);

  useEffect(() => {
    let cancelled = false;
    loadLeaderboard().then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="app-container">
      <Header />
      {state.status === "loading" && <p>Loading leaderboard…</p>}
      {state.status === "unavailable" && (
        <p role="alert">
          Scores are currently unavailable. Please try again later.
        </p>
      )}
      {state.status === "stale" && (
        <>
          <StaleDataNotice computedAt={state.result.computedAt} />
          <Leaderboard
            entries={state.result.entries}
            teamNamesById={teamNamesById}
            divisionsById={divisionsById}
          />
        </>
      )}
      {state.status === "live" && (
        <Leaderboard
          entries={state.result.entries}
          teamNamesById={teamNamesById}
          divisionsById={divisionsById}
        />
      )}
    </main>
  );
}
