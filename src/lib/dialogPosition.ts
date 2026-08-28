/**
 * Positions the roster preview dialog so it never renders outside the
 * viewport (FR-009). The dialog is `position: fixed`
 * (RosterPreviewDialog.css), so the returned top/left are viewport
 * coordinates — the same coordinate space `getBoundingClientRect()`
 * already returns, so no scroll-offset math is needed.
 *
 * Two-pass approach (research.md §3): the dialog's default placement is
 * just below the anchor (the hovered player-name wrapper); if that would
 * clip the right or bottom edge, it's pulled back on-screen. If the
 * default placement would clip the top (rare, only for a very tall
 * dialog near the top of the viewport) it flips to render above the
 * anchor instead.
 */

// Zero gap: the dialog must sit flush against the anchor so the pointer
// can move directly from the name onto the dialog with no dead pixels in
// between (FR-010 relies on this — see Leaderboard.tsx's relatedTarget
// check, which also treats the dialog as adjacent to the anchor).
const GAP = 0;
const EDGE_MARGIN = 4; // px minimum distance from the viewport edge

export interface Rect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface Size {
  width: number;
  height: number;
}

export function clampToViewport(
  anchorRect: Rect,
  dialogSize: Size,
  viewport: Size,
): { top: number; left: number } {
  // Default: just below and left-aligned with the anchor.
  let top = anchorRect.bottom + GAP;
  let left = anchorRect.left;

  // Flip above the anchor if it doesn't fit below.
  if (top + dialogSize.height > viewport.height - EDGE_MARGIN) {
    const above = anchorRect.top - GAP - dialogSize.height;
    top = above >= EDGE_MARGIN ? above : top;
  }

  // Clamp vertically as a last resort (dialog taller than the viewport).
  top = Math.min(
    Math.max(top, EDGE_MARGIN),
    Math.max(viewport.height - dialogSize.height - EDGE_MARGIN, EDGE_MARGIN),
  );

  // Clamp horizontally so the dialog never overflows either edge.
  left = Math.min(
    Math.max(left, EDGE_MARGIN),
    Math.max(viewport.width - dialogSize.width - EDGE_MARGIN, EDGE_MARGIN),
  );

  return { top, left };
}
