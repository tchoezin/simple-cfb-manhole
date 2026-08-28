import { describe, expect, it } from "vitest";
import { clampToViewport, type Rect } from "../../src/lib/dialogPosition";

const viewport = { width: 1024, height: 768 };
const dialogSize = { width: 200, height: 100 };

function anchor(overrides: Partial<Rect>): Rect {
  return {
    top: 100,
    left: 100,
    right: 150,
    bottom: 120,
    width: 50,
    height: 20,
    ...overrides,
  };
}

describe("clampToViewport", () => {
  it("places the dialog flush below (zero gap) and left-aligned with the anchor when it fits", () => {
    // Zero gap is required for FR-010: the pointer must be able to move
    // directly from the name onto the dialog with no dead pixels between
    // them (see Leaderboard.tsx's relatedTarget-based leave handling).
    const pos = clampToViewport(anchor({}), dialogSize, viewport);
    expect(pos).toEqual({ top: 120, left: 100 });
  });

  it("pulls the dialog back on-screen when the anchor is near the right edge", () => {
    const rightAnchor = anchor({ left: 950, right: 1000 });
    const pos = clampToViewport(rightAnchor, dialogSize, viewport);
    expect(pos.left + dialogSize.width).toBeLessThanOrEqual(viewport.width);
    expect(pos.left).toBeGreaterThanOrEqual(0);
  });

  it("flips above the anchor when it doesn't fit below (near the bottom edge)", () => {
    const bottomAnchor = anchor({ top: 700, bottom: 720 });
    const pos = clampToViewport(bottomAnchor, dialogSize, viewport);
    expect(pos.top).toBeLessThan(bottomAnchor.top);
    expect(pos.top + dialogSize.height).toBeLessThanOrEqual(bottomAnchor.top);
  });

  it("clamps into the corner when the anchor is at the bottom-right corner", () => {
    const cornerAnchor = anchor({
      top: 750,
      bottom: 760,
      left: 1000,
      right: 1010,
    });
    const pos = clampToViewport(cornerAnchor, dialogSize, viewport);
    expect(pos.top).toBeGreaterThanOrEqual(0);
    expect(pos.top + dialogSize.height).toBeLessThanOrEqual(viewport.height);
    expect(pos.left).toBeGreaterThanOrEqual(0);
    expect(pos.left + dialogSize.width).toBeLessThanOrEqual(viewport.width);
  });
});
