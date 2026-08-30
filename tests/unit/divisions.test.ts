import { describe, expect, it } from "vitest";
import { buildDivisionsById, resolveDivisionName } from "../../src/lib/divisions";
import type { Division } from "../../src/types/league";

describe("buildDivisionsById", () => {
  it("maps every division id to its Division", () => {
    const divisions: Division[] = [
      { id: "division-1", name: "Division 1" },
      { id: "division-2", name: "Division 2" },
    ];
    const divisionsById = buildDivisionsById(divisions);
    expect(divisionsById.get("division-1")).toEqual({ id: "division-1", name: "Division 1" });
    expect(divisionsById.get("division-2")).toEqual({ id: "division-2", name: "Division 2" });
  });

  it("returns an empty map for an empty list (no crash)", () => {
    expect(buildDivisionsById([]).size).toBe(0);
  });
});

describe("resolveDivisionName", () => {
  it("resolves a known id to its division name", () => {
    const divisionsById = buildDivisionsById([{ id: "division-1", name: "Division 1" }]);
    expect(resolveDivisionName("division-1", divisionsById)).toBe("Division 1");
  });

  it("falls back to the raw id for an id with no matching entry", () => {
    const divisionsById = buildDivisionsById([{ id: "division-1", name: "Division 1" }]);
    expect(resolveDivisionName("unknown-division", divisionsById)).toBe("unknown-division");
  });

  it("falls back to the raw id for an empty divisionsById map (no crash)", () => {
    expect(resolveDivisionName("division-1", new Map())).toBe("division-1");
  });
});
