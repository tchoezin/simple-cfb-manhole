import { describe, expect, it } from "vitest";
import {
  buildTeamsById,
  findConferenceCollisions,
} from "../../src/lib/conferences";
import type { Conference } from "../../src/types/league";

describe("buildTeamsById", () => {
  it("maps every team in every conference to its conference id", () => {
    const conferences: Conference[] = [
      { id: "acc", name: "ACC", teamIds: ["gt", "duke"] },
      { id: "sec", name: "SEC", teamIds: ["uga"] },
    ];
    const teams = buildTeamsById(conferences);
    expect(teams.get("gt")).toEqual({ id: "gt", conferenceId: "acc" });
    expect(teams.get("duke")).toEqual({ id: "duke", conferenceId: "acc" });
    expect(teams.get("uga")).toEqual({ id: "uga", conferenceId: "sec" });
  });

  it("merges a conference's sub-divisions into one conference id (Sun Belt regression)", () => {
    // Regression: previously, a live ESPN fetch reported Sun Belt East/West
    // as separate conferences. The hardcoded list must collapse these into
    // one entry so both teams resolve to the same conferenceId.
    const conferences: Conference[] = [
      { id: "sun-belt", name: "Sun Belt", teamIds: ["jmu", "ul"] },
    ];
    const teams = buildTeamsById(conferences);
    expect(teams.get("jmu")?.conferenceId).toBe("sun-belt");
    expect(teams.get("ul")?.conferenceId).toBe("sun-belt");
  });

  it("leaves a team with no conference entry unresolved (no crash)", () => {
    const teams = buildTeamsById([]);
    expect(teams.get("nowhere")).toBeUndefined();
  });
});

describe("buildTeamsById (independents)", () => {
  it("never gives two independent schools the same conferenceId, even though both are independents", () => {
    // Regression: grouping independents under a shared "independents" id
    // would incorrectly award the same-conference bonus (FR-005) if two
    // independents played each other. Each independent gets its own unique
    // singleton conference instead.
    const conferences: Conference[] = [
      { id: "independent-notre-dame", name: "Independent (Notre Dame)", teamIds: ["87"] },
      { id: "independent-uconn", name: "Independent (UConn)", teamIds: ["41"] },
    ];
    const teams = buildTeamsById(conferences);
    expect(teams.get("87")?.conferenceId).not.toBe(teams.get("41")?.conferenceId);
  });
});

describe("findConferenceCollisions", () => {
  it("reports no collisions for a valid list", () => {
    const conferences: Conference[] = [
      { id: "acc", name: "ACC", teamIds: ["gt"] },
      { id: "sec", name: "SEC", teamIds: ["uga"] },
    ];
    expect(findConferenceCollisions(conferences)).toEqual([]);
  });

  it("flags a team id listed under two conferences", () => {
    const conferences: Conference[] = [
      { id: "acc", name: "ACC", teamIds: ["gt"] },
      { id: "sec", name: "SEC", teamIds: ["gt"] },
    ];
    expect(findConferenceCollisions(conferences)).toEqual([
      { teamId: "gt", conferenceIds: ["acc", "sec"] },
    ]);
  });
});
