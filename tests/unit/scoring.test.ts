import { describe, expect, it } from "vitest";
import {
  buildDivisionOwnership,
  computeLeaderboard,
  findDivisionOwnershipCollisions,
  scorePlayerGame,
  type TeamsById,
} from "../../src/lib/scoring";
import type { Division, Game, Player, Team } from "../../src/types/league";

// --- Fixtures -------------------------------------------------------------

const divisions: Division[] = [
  { id: "east", name: "East" },
  { id: "west", name: "West" },
];

function makeTeams(entries: Array<[string, string]>): TeamsById {
  const map: TeamsById = new Map();
  for (const [id, conferenceId] of entries) {
    map.set(id, { id, conferenceId } satisfies Team);
  }
  return map;
}

function makeGame(overrides: Partial<Game> & { id: string }): Game {
  return {
    week: 1,
    homeTeamId: "home",
    awayTeamId: "away",
    completed: false,
    winnerTeamId: null,
    loserTeamId: null,
    ...overrides,
  };
}

// --- scorePlayerGame (US2, T017) ------------------------------------------

describe("scorePlayerGame", () => {
  const alice: Player = {
    id: "alice",
    name: "Alice",
    divisionId: "east",
    ownedTeamIds: ["gt"],
  };
  const bob: Player = {
    id: "bob",
    name: "Bob",
    divisionId: "east",
    ownedTeamIds: ["duke"],
  };
  const dan: Player = {
    id: "dan",
    name: "Dan",
    divisionId: "west",
    ownedTeamIds: ["gt"], // same team as Alice, different division (FR-017)
  };

  it("awards 1 point by default when the owned team wins with no bonus", () => {
    const teams = makeTeams([
      ["gt", "acc"],
      ["oregon", "big-ten"],
    ]);
    const game = makeGame({
      id: "g1",
      completed: true,
      winnerTeamId: "gt",
      loserTeamId: "oregon",
    });
    const ownership = buildDivisionOwnership([alice]);
    expect(scorePlayerGame(alice, game, teams, ownership)).toBe(1);
  });

  it("awards 2 points when winner and loser share a conference", () => {
    const teams = makeTeams([
      ["gt", "acc"],
      ["duke", "acc"],
    ]);
    const game = makeGame({
      id: "g2",
      completed: true,
      winnerTeamId: "gt",
      loserTeamId: "duke",
    });
    // duke is not owned by anyone in this fixture, so no rivalry bonus.
    const ownership = buildDivisionOwnership([alice]);
    expect(scorePlayerGame(alice, game, teams, ownership)).toBe(2);
  });

  it("awards 3 points (overriding conference) when the loser is owned by a division rival", () => {
    const teams = makeTeams([
      ["gt", "acc"],
      ["duke", "acc"], // same conference too — rivalry must still win
    ]);
    const game = makeGame({
      id: "g3",
      completed: true,
      winnerTeamId: "gt",
      loserTeamId: "duke",
    });
    const ownership = buildDivisionOwnership([alice, bob]); // bob (east) owns duke
    expect(scorePlayerGame(alice, game, teams, ownership)).toBe(3);
  });

  it("does not apply the rivalry bonus when the loser is owned by a player in a different division", () => {
    const teams = makeTeams([
      ["gt", "acc"],
      ["oregon", "big-ten"],
    ]);
    const player: Player = {
      id: "erin",
      name: "Erin",
      divisionId: "west",
      ownedTeamIds: ["oregon"],
    };
    const game = makeGame({
      id: "g4",
      completed: true,
      winnerTeamId: "gt",
      loserTeamId: "oregon",
    });
    // alice (east) owns gt; erin (west) owns the loser — different division.
    const ownership = buildDivisionOwnership([alice, player]);
    expect(scorePlayerGame(alice, game, teams, ownership)).toBe(1);
  });

  it("awards 0 points when the player's team lost", () => {
    const teams = makeTeams([
      ["gt", "acc"],
      ["oregon", "big-ten"],
    ]);
    const game = makeGame({
      id: "g5",
      completed: true,
      winnerTeamId: "oregon",
      loserTeamId: "gt",
    });
    const ownership = buildDivisionOwnership([alice]);
    expect(scorePlayerGame(alice, game, teams, ownership)).toBe(0);
  });

  it("awards 0 points for an unfinished game", () => {
    const teams = makeTeams([["gt", "acc"]]);
    const game = makeGame({ id: "g6", completed: false });
    const ownership = buildDivisionOwnership([alice]);
    expect(scorePlayerGame(alice, game, teams, ownership)).toBe(0);
  });

  it("awards 0 points to everyone when neither team is owned", () => {
    const teams = makeTeams([
      ["nobody1", "acc"],
      ["nobody2", "acc"],
    ]);
    const game = makeGame({
      id: "g7",
      completed: true,
      winnerTeamId: "nobody1",
      loserTeamId: "nobody2",
    });
    const ownership = buildDivisionOwnership([alice, bob]);
    expect(scorePlayerGame(alice, game, teams, ownership)).toBe(0);
    expect(scorePlayerGame(bob, game, teams, ownership)).toBe(0);
  });

  it("falls back to the default/conference rule in a single-player division (no possible rival)", () => {
    const soloPlayer: Player = {
      id: "solo",
      name: "Solo",
      divisionId: "solo-division",
      ownedTeamIds: ["gt"],
    };
    const teams = makeTeams([
      ["gt", "acc"],
      ["duke", "acc"],
    ]);
    const game = makeGame({
      id: "g8",
      completed: true,
      winnerTeamId: "gt",
      loserTeamId: "duke",
    });
    const ownership = buildDivisionOwnership([soloPlayer]);
    expect(scorePlayerGame(soloPlayer, game, teams, ownership)).toBe(2);
  });

  it("scores the same team's win independently for owners in different divisions", () => {
    const teams = makeTeams([
      ["gt", "acc"],
      ["duke", "acc"],
    ]);
    const game = makeGame({
      id: "g9",
      completed: true,
      winnerTeamId: "gt",
      loserTeamId: "duke",
    });
    // alice (east) and dan (west) both own gt; bob (east) owns duke, so
    // alice gets the rivalry bonus but dan (west, no rival owns duke) does not.
    const ownership = buildDivisionOwnership([alice, bob, dan]);
    expect(scorePlayerGame(alice, game, teams, ownership)).toBe(3);
    expect(scorePlayerGame(dan, game, teams, ownership)).toBe(2);
  });
});

// --- findDivisionOwnershipCollisions (FR-017 diagnostic) -------------------

describe("findDivisionOwnershipCollisions", () => {
  it("reports no collisions for valid per-division-unique rosters", () => {
    const alice: Player = {
      id: "alice",
      name: "Alice",
      divisionId: "east",
      ownedTeamIds: ["gt", "duke"],
    };
    const dan: Player = {
      id: "dan",
      name: "Dan",
      divisionId: "west",
      ownedTeamIds: ["gt"], // same team, different division — allowed
    };
    expect(findDivisionOwnershipCollisions([alice, dan])).toEqual([]);
  });

  it("flags two players in the same division owning the same team", () => {
    const alice: Player = {
      id: "alice",
      name: "Alice",
      divisionId: "east",
      ownedTeamIds: ["gt"],
    };
    const bob: Player = {
      id: "bob",
      name: "Bob",
      divisionId: "east",
      ownedTeamIds: ["gt"], // collision: same division, same team
    };
    const collisions = findDivisionOwnershipCollisions([alice, bob]);
    expect(collisions).toEqual([
      { divisionId: "east", teamId: "gt", playerIds: ["alice", "bob"] },
    ]);
  });
});

// --- computeLeaderboard (US1, T010) ----------------------------------------

describe("computeLeaderboard", () => {
  const alice: Player = {
    id: "alice",
    name: "Alice",
    divisionId: "east",
    ownedTeamIds: ["gt"],
  };
  const bob: Player = {
    id: "bob",
    name: "Bob",
    divisionId: "east",
    ownedTeamIds: ["duke"],
  };
  const carol: Player = {
    id: "carol",
    name: "Carol",
    divisionId: "east",
    ownedTeamIds: ["unc"],
  };

  it("sorts players by score descending", () => {
    const teams = makeTeams([
      ["gt", "acc"],
      ["duke", "acc"],
      ["unc", "acc"],
    ]);
    const gamesByTeam = new Map<string, Game[]>([
      [
        "gt",
        [
          makeGame({
            id: "g1",
            completed: true,
            winnerTeamId: "gt",
            loserTeamId: "duke",
          }),
        ],
      ],
    ]);
    const result = computeLeaderboard(
      [alice, bob, carol],
      divisions,
      teams,
      gamesByTeam,
    );
    expect(result.entries.map((e) => e.player.id)).toEqual([
      "alice",
      "bob",
      "carol",
    ]);
    // gt beat duke; duke is owned by bob, who shares alice's division, so
    // the rivalry bonus (3) applies rather than just the conference bonus.
    expect(result.entries[0].total).toBe(3);
  });

  it("gives tied players the same rank (standard competition ranking)", () => {
    const teams = makeTeams([["gt", "acc"]]);
    const result = computeLeaderboard(
      [alice, bob, carol],
      divisions,
      teams,
      new Map(),
    );
    expect(result.entries.every((e) => e.total === 0)).toBe(true);
    expect(result.entries.map((e) => e.rank)).toEqual([1, 1, 1]);
  });

  it("orders tied players alphabetically by name (display order only, rank unchanged)", () => {
    const teams = makeTeams([["gt", "acc"]]);
    const result = computeLeaderboard(
      [carol, alice, bob],
      divisions,
      teams,
      new Map(),
    );
    expect(result.entries.map((e) => e.player.id)).toEqual([
      "alice",
      "bob",
      "carol",
    ]);
    expect(result.entries.map((e) => e.rank)).toEqual([1, 1, 1]);
  });

  it("returns all players at score 0 when no games have finished", () => {
    const teams = makeTeams([["gt", "acc"]]);
    const gamesByTeam = new Map<string, Game[]>([
      ["gt", [makeGame({ id: "g1", completed: false })]],
    ]);
    const result = computeLeaderboard(
      [alice, bob, carol],
      divisions,
      teams,
      gamesByTeam,
    );
    expect(result.entries.every((e) => e.total === 0)).toBe(true);
    expect(result.entries).toHaveLength(3);
  });
});
