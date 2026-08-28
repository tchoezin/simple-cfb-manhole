import { describe, expect, it } from "vitest";
import { buildTeamNamesById, resolveTeamNames } from "../../src/lib/teams";
import type { TeamName } from "../../src/types/league";

describe("buildTeamNamesById", () => {
  it("maps every team id to its name", () => {
    const teamNames: TeamName[] = [
      { id: "59", name: "Georgia Tech" },
      { id: "333", name: "Alabama" },
    ];
    const namesById = buildTeamNamesById(teamNames);
    expect(namesById.get("59")).toBe("Georgia Tech");
    expect(namesById.get("333")).toBe("Alabama");
  });

  it("returns an empty map for an empty list (no crash)", () => {
    expect(buildTeamNamesById([]).size).toBe(0);
  });
});

describe("resolveTeamNames", () => {
  it("resolves ids to names, preserving order", () => {
    const namesById = buildTeamNamesById([
      { id: "59", name: "Georgia Tech" },
      { id: "333", name: "Alabama" },
      { id: "99", name: "LSU" },
    ]);
    expect(resolveTeamNames(["333", "59", "99"], namesById)).toEqual([
      "Alabama",
      "Georgia Tech",
      "LSU",
    ]);
  });

  it("falls back to the raw id for an id with no matching entry", () => {
    const namesById = buildTeamNamesById([{ id: "59", name: "Georgia Tech" }]);
    expect(resolveTeamNames(["59", "unknown-id"], namesById)).toEqual([
      "Georgia Tech",
      "unknown-id",
    ]);
  });

  it("returns an empty list for an empty roster (no crash)", () => {
    const namesById = buildTeamNamesById([{ id: "59", name: "Georgia Tech" }]);
    expect(resolveTeamNames([], namesById)).toEqual([]);
  });
});
