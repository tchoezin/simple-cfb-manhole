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

  it("awards 3 points (cannibalization) when the player owns both the winner and the loser", () => {
    const teams = makeTeams([
      ["gt", "acc"],
      ["oregon", "big-ten"],
    ]);
    const cannibal: Player = {
      id: "carl",
      name: "Carl",
      divisionId: "east",
      ownedTeamIds: ["gt", "oregon"],
    };
    const game = makeGame({
      id: "g3b",
      completed: true,
      winnerTeamId: "gt",
      loserTeamId: "oregon",
    });
    const ownership = buildDivisionOwnership([cannibal]);
    expect(scorePlayerGame(cannibal, game, teams, ownership)).toBe(3);
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

  // --- win-tier breakdown (009-leaderboard-score-columns, SC-001/SC-002) ---

  it("tallies win-tier counts that sum to totalWins and reconcile with total", () => {
    const teams = makeTeams([
      ["gt", "acc"],
      ["duke", "acc"], // owned by bob (same division as alice) -> rivalry (3)
      ["unc", "acc"], // not owned by anyone in this fixture -> conference (2)
      ["oregon", "big-ten"], // not owned, different conference -> default (1)
    ]);
    const alex: Player = {
      id: "alex",
      name: "Alex",
      divisionId: "east",
      ownedTeamIds: ["gt"],
    };
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
          makeGame({
            id: "g2",
            completed: true,
            winnerTeamId: "gt",
            loserTeamId: "unc",
          }),
          makeGame({
            id: "g3",
            completed: true,
            winnerTeamId: "gt",
            loserTeamId: "oregon",
          }),
        ],
      ],
    ]);
    const result = computeLeaderboard([alex, bob], divisions, teams, gamesByTeam);
    const entry = result.entries.find((e) => e.player.id === "alex")!;

    expect(entry.threePointWins).toBe(1);
    expect(entry.twoPointWins).toBe(1);
    expect(entry.onePointWins).toBe(1);
    expect(entry.totalWins).toBe(
      entry.threePointWins + entry.twoPointWins + entry.onePointWins,
    );
    expect(entry.total).toBe(
      3 * entry.threePointWins + 2 * entry.twoPointWins + 1 * entry.onePointWins,
    );
  });

  it("reports 0 (not undefined) for win-tier counts when a player has no wins", () => {
    const teams = makeTeams([["gt", "acc"]]);
    const result = computeLeaderboard([alice], divisions, teams, new Map());
    const entry = result.entries[0];

    expect(entry.threePointWins).toBe(0);
    expect(entry.twoPointWins).toBe(0);
    expect(entry.onePointWins).toBe(0);
    expect(entry.totalWins).toBe(0);
  });

  // --- total-wins tiebreaker (010-total-wins-tiebreaker) -------------------

  it("ranks a Score tie by Total Wins, higher Total Wins first", () => {
    const teams = makeTeams([
      ["gt", "acc"],
      ["duke", "acc"], // owned by fred (same division as dave) -> rivalry (3)
      ["unc", "acc"],
      ["ncstate", "acc"],
      ["wake", "acc"],
      ["oregon", "big-ten"],
      ["utah", "big-ten"],
      ["stanford", "big-ten"],
    ]);
    const dave: Player = {
      id: "dave",
      name: "Dave",
      divisionId: "east",
      ownedTeamIds: ["gt"],
    };
    const fred: Player = {
      id: "fred",
      name: "Fred",
      divisionId: "east",
      ownedTeamIds: ["duke"],
    };
    const erin: Player = {
      id: "erin",
      name: "Erin",
      divisionId: "east",
      ownedTeamIds: ["unc", "ncstate", "wake"],
    };
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
      [
        "unc",
        [
          makeGame({
            id: "g2",
            completed: true,
            winnerTeamId: "unc",
            loserTeamId: "oregon",
          }),
        ],
      ],
      [
        "ncstate",
        [
          makeGame({
            id: "g3",
            completed: true,
            winnerTeamId: "ncstate",
            loserTeamId: "utah",
          }),
        ],
      ],
      [
        "wake",
        [
          makeGame({
            id: "g4",
            completed: true,
            winnerTeamId: "wake",
            loserTeamId: "stanford",
          }),
        ],
      ],
    ]);
    const result = computeLeaderboard(
      [dave, fred, erin],
      divisions,
      teams,
      gamesByTeam,
    );

    const daveEntry = result.entries.find((e) => e.player.id === "dave")!;
    const erinEntry = result.entries.find((e) => e.player.id === "erin")!;
    expect(daveEntry.total).toBe(3);
    expect(daveEntry.totalWins).toBe(1);
    expect(erinEntry.total).toBe(3);
    expect(erinEntry.totalWins).toBe(3);
    expect(erinEntry.rank).toBeLessThan(daveEntry.rank);
    expect(erinEntry.rank).not.toBe(daveEntry.rank);
  });

  it("keeps Score as the primary sort key regardless of Total Wins", () => {
    // All loser teams below are unowned, so every win scores purely by the
    // conference/default rule — no rivalry or cannibalization bonus applies.
    const teams = makeTeams([
      ["gt", "acc"],
      ["duke", "acc"],
      ["unc", "acc"],
      ["clemson", "acc"],
      ["miami", "acc"],
      ["ncstate", "acc"], // unowned loser
      ["wake", "acc"], // unowned loser
      ["oregon", "big-ten"], // unowned loser
      ["utah", "big-ten"], // unowned loser
      ["stanford", "big-ten"], // unowned loser
    ]);
    const dave: Player = {
      id: "dave",
      name: "Dave",
      divisionId: "east",
      ownedTeamIds: ["gt", "duke"], // two same-conference wins -> total 4, totalWins 2
    };
    const erin: Player = {
      id: "erin",
      name: "Erin",
      divisionId: "west",
      // three different-conference wins -> total 3, totalWins 3
      ownedTeamIds: ["unc", "clemson", "miami"],
    };
    const gamesByTeam = new Map<string, Game[]>([
      [
        "gt",
        [
          makeGame({
            id: "g1",
            completed: true,
            winnerTeamId: "gt",
            loserTeamId: "ncstate",
          }),
        ],
      ],
      [
        "duke",
        [
          makeGame({
            id: "g2",
            completed: true,
            winnerTeamId: "duke",
            loserTeamId: "wake",
          }),
        ],
      ],
      [
        "unc",
        [
          makeGame({
            id: "g3",
            completed: true,
            winnerTeamId: "unc",
            loserTeamId: "oregon",
          }),
        ],
      ],
      [
        "clemson",
        [
          makeGame({
            id: "g4",
            completed: true,
            winnerTeamId: "clemson",
            loserTeamId: "utah",
          }),
        ],
      ],
      [
        "miami",
        [
          makeGame({
            id: "g5",
            completed: true,
            winnerTeamId: "miami",
            loserTeamId: "stanford",
          }),
        ],
      ],
    ]);
    const result = computeLeaderboard(
      [dave, erin],
      divisions,
      teams,
      gamesByTeam,
    );

    const daveEntry = result.entries.find((e) => e.player.id === "dave")!;
    const erinEntry = result.entries.find((e) => e.player.id === "erin")!;
    expect(daveEntry.total).toBe(4);
    expect(daveEntry.totalWins).toBe(2);
    expect(erinEntry.total).toBe(3);
    expect(erinEntry.totalWins).toBe(3);
    expect(daveEntry.rank).toBeLessThan(erinEntry.rank);
  });

  it("keeps a full tie (same Score and Total Wins) on one shared rank, ordered alphabetically", () => {
    const teams = makeTeams([
      ["gt", "acc"],
      ["oregon", "big-ten"],
      ["duke", "acc"],
      ["utah", "big-ten"],
    ]);
    const zoe: Player = {
      id: "zoe",
      name: "Zoe",
      divisionId: "east",
      ownedTeamIds: ["gt"],
    };
    const amy: Player = {
      id: "amy",
      name: "Amy",
      divisionId: "west",
      ownedTeamIds: ["duke"],
    };
    const gamesByTeam = new Map<string, Game[]>([
      [
        "gt",
        [
          makeGame({
            id: "g1",
            completed: true,
            winnerTeamId: "gt",
            loserTeamId: "oregon",
          }),
        ],
      ],
      [
        "duke",
        [
          makeGame({
            id: "g2",
            completed: true,
            winnerTeamId: "duke",
            loserTeamId: "utah",
          }),
        ],
      ],
    ]);
    const result = computeLeaderboard(
      [zoe, amy],
      divisions,
      teams,
      gamesByTeam,
    );

    expect(result.entries.map((e) => e.player.id)).toEqual(["amy", "zoe"]);
    expect(result.entries.map((e) => e.rank)).toEqual([1, 1]);
  });

  it("orders a three-way Score tie entirely by Total Wins, giving each a distinct rank", () => {
    const teams = makeTeams([
      ["gt", "acc"],
      ["duke", "acc"], // owned by a division rival of p1 -> rivalry (3)
      ["unc", "acc"],
      ["oregon", "big-ten"],
      ["ncstate", "acc"],
      ["utah", "big-ten"],
      ["wake", "acc"],
      ["stanford", "big-ten"],
      ["colorado", "big-ten"],
    ]);
    const rival: Player = {
      id: "rival",
      name: "Rival",
      divisionId: "east",
      ownedTeamIds: ["duke"],
    };
    const p1: Player = {
      id: "p1",
      name: "P1",
      divisionId: "east",
      ownedTeamIds: ["gt"], // 1 rivalry win -> total 3, totalWins 1
    };
    const p2: Player = {
      id: "p2",
      name: "P2",
      divisionId: "west",
      ownedTeamIds: ["unc", "ncstate"], // 1 conference + 1 default -> total 3, totalWins 2
    };
    const p3: Player = {
      id: "p3",
      name: "P3",
      divisionId: "west",
      ownedTeamIds: ["wake"], // will get 3 default wins below -> total 3, totalWins 3
    };
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
      [
        "unc",
        [
          // duke (owned by rival, a different division than p2) is not a
          // rivalry target for p2 -> same-conference bonus only (2 pts).
          makeGame({
            id: "g2",
            completed: true,
            winnerTeamId: "unc",
            loserTeamId: "duke",
          }),
        ],
      ],
      [
        "ncstate",
        [
          makeGame({
            id: "g2b",
            completed: true,
            winnerTeamId: "ncstate",
            loserTeamId: "colorado", // different conference, unowned -> 1 pt
          }),
        ],
      ],
      [
        "wake",
        [
          makeGame({
            id: "g3",
            completed: true,
            winnerTeamId: "wake",
            loserTeamId: "oregon",
          }),
          makeGame({
            id: "g4",
            completed: true,
            winnerTeamId: "wake",
            loserTeamId: "utah",
          }),
          makeGame({
            id: "g5",
            completed: true,
            winnerTeamId: "wake",
            loserTeamId: "stanford",
          }),
        ],
      ],
    ]);
    const result = computeLeaderboard(
      [rival, p1, p2, p3],
      divisions,
      teams,
      gamesByTeam,
    );

    const byId = (id: string) => result.entries.find((e) => e.player.id === id)!;
    expect(byId("p1").total).toBe(3);
    expect(byId("p2").total).toBe(3);
    expect(byId("p3").total).toBe(3);
    expect(byId("p1").totalWins).toBe(1);
    expect(byId("p2").totalWins).toBe(2);
    expect(byId("p3").totalWins).toBe(3);

    const ranks = [byId("p3").rank, byId("p2").rank, byId("p1").rank];
    expect(ranks[0]).toBeLessThan(ranks[1]);
    expect(ranks[1]).toBeLessThan(ranks[2]);
  });
});
