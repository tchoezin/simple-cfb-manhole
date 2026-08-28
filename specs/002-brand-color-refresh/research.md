# Phase 0 Research: Larger Header Logo

No open `NEEDS CLARIFICATION` items — "too small, make it header size" is a direct, low-risk
sizing adjustment to an existing CSS rule.

## Decision: What size counts as "header size"

- **Decision (superseded once, see below)**: Initially sized by `height` (`4.5rem` → `6rem`),
  keeping `width: auto`.
- **Correction**: This undershot the user's intent — the logo asset is a **wide wordmark**
  (480×281px, ≈1.7:1 aspect ratio: "CFB MANHOLE" text plus a thin underline graphic, not a square
  mark). Sizing by a fixed `height` means the *width* — the dimension that actually carries the
  wordmark's visual weight — barely grows: at `height: 6rem` (96px) the rendered width is only
  ≈164px, which still reads as small. **Final decision**: size by `width` instead —
  `width: min(90%, 24rem); height: auto;` — so the logo grows to ≈384px wide on desktop (height
  ≈225px, following the image's own aspect ratio) while `min(90%, ...)` keeps it from overflowing
  narrow containers on phone widths.
- **Rationale**: For a wide/banner-shaped logo, the dimension that reads as "big" to a viewer is
  width, not height. Capping via `min(90%, 24rem)` means the logo scales down proportionally on
  any container narrower than ≈27rem (device width, since it sits inside `.app-container`'s
  padding) rather than overflowing, and caps out at a fixed max on wide screens so it doesn't
  dominate the whole viewport on desktop.
- **Alternatives considered**:
  - *Use a CSS custom property for the logo size*: Rejected — single consumer of the value;
    violates Simplicity First for one hardcoded number.
  - *Keep sizing by `height` and just increase it further*: Rejected — this is the mistake being
    corrected; continuing to push `height` up without addressing the aspect-ratio mismatch would
    require an implausibly large height (well over `10rem`) to reach a comparable visual width,
    making the header disproportionately tall relative to its actual visual gain.
  - *Fixed pixel `width` (no `min()` cap)*: Rejected — would overflow or force horizontal scroll
    on narrow phone viewports, violating FR-007.

## Decision: Responsive behavior at the larger size

- **Decision**: No new media query is added. The logo continues to scale via `width: auto` at a
  fixed `height`, and the header remains inside `.app-container`'s existing `max-width: 720px`
  layout (see `src/App.css`), so the larger logo cannot cause page-level horizontal overflow —
  it's bounded by the same container every other element already respects.
- **Rationale**: FR-007 requires no page-level horizontal scrolling at phone width. Because the
  logo's `width` is `auto` (derived from its own aspect ratio, not a percentage of the container),
  and the container itself is already responsive, a taller fixed `height` doesn't introduce any
  new overflow risk that phone-width testing under `quickstart.md` wouldn't already have caught
  for the prior size increase.
- **Alternatives considered**: *Add a `@media (max-width: ...)` override to shrink the logo on
  phones* — rejected as unnecessary; `6rem` (96px) height at `width: auto` for this logo's
  proportions comfortably fits within the smallest common phone viewport (~320px) without a
  dedicated breakpoint, so adding one would be speculative complexity ahead of an observed problem.
