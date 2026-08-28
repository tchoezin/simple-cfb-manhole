import { describe, expect, it } from "vitest";
import { mapTeamSchedule } from "../../src/lib/espn";

describe("mapTeamSchedule", () => {
  it("derives winner/loser only for completed games", () => {
    const games = mapTeamSchedule({
      events: [
        {
          id: "g1",
          week: { number: 3 },
          competitions: [
            {
              status: { type: { completed: true } },
              competitors: [
                { id: "a", homeAway: "home", winner: true, team: { id: "gt" } },
                { id: "b", homeAway: "away", winner: false, team: { id: "duke" } },
              ],
            },
          ],
        },
        {
          id: "g2",
          week: { number: 4 },
          competitions: [
            {
              status: { type: { completed: false } },
              competitors: [
                { id: "a", homeAway: "home", team: { id: "gt" } },
                { id: "b", homeAway: "away", team: { id: "unc" } },
              ],
            },
          ],
        },
      ],
    });

    expect(games).toHaveLength(2);
    expect(games[0]).toMatchObject({
      id: "g1",
      completed: true,
      winnerTeamId: "gt",
      loserTeamId: "duke",
    });
    expect(games[1]).toMatchObject({
      id: "g2",
      completed: false,
      winnerTeamId: null,
      loserTeamId: null,
    });
  });

  it("skips events missing a resolvable competitor team id", () => {
    const games = mapTeamSchedule({
      events: [
        {
          id: "bad",
          competitions: [{ competitors: [{ id: "a", homeAway: "home" }] }],
        },
      ],
    });
    expect(games).toHaveLength(0);
  });
});
