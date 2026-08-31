# Phase 0 Research: Leaderboard Loading Indicator

No `NEEDS CLARIFICATION` markers remain in the Technical Context — the spec's Clarifications session (2026-08-30) already resolved the two decisions with real design impact. This file records the remaining small implementation-approach decisions made to keep the feature consistent with the existing codebase.

## Decision: Plain CSS spinner, no animation library

**Decision**: Implement the spinner as a CSS `@keyframes` rotation on a bordered `div`/`span`, no icon font or animation library.

**Rationale**: The app has zero animation/icon dependencies today (`package.json` lists only React + build tooling). A CSS-only spinner is the simplest option satisfying Constitution Principle I (Simplicity First) and needs no new dependency.

**Alternatives considered**:
- SVG spinner icon — more control over exact look, but not meaningfully better than a CSS border-spin for this small, brand-neutral use case; adds inline-SVG maintenance for no real benefit.
- Icon library (e.g., a spinner from a component/icon package) — rejected outright, violates Simplicity First by adding a dependency for one glyph.

## Decision: Colocated component + CSS file, following `StaleDataNotice` pattern

**Decision**: New `LoadingIndicator.tsx` + `LoadingIndicator.css` in `src/components/`, mirroring the existing `StaleDataNotice.tsx`/`.css` pair (small presentational component, own stylesheet, imported directly).

**Rationale**: Matches established project convention exactly — no new pattern introduced.

**Alternatives considered**: Inlining the markup/styles directly in `App.tsx`/`App.css` — rejected; every other distinct visual state (`StaleDataNotice`, `Header`) already gets its own component, and `App.tsx`'s doc comment already treats each render branch as backed by a named component.

## Decision: Purely decorative, `aria-hidden="true"`, no accessible text (revised 2026-08-30)

**Decision**: The indicator carries no accessible text or label at all. The root element is marked `aria-hidden="true"` so assistive technology skips it entirely, rather than using `role="status"` with a hidden label as originally planned.

**Rationale**: Per the spec's revised Clarification (2026-08-30, superseding the earlier "keep a screen-reader-only label" answer), the requirement was deliberately narrowed to a purely visual indicator with zero accessible text. `aria-hidden="true"` is the standard way to keep a decorative element out of the accessibility tree.

**Tradeoff accepted**: This is a regression from the current text-based `"Loading leaderboard…"` message, which screen readers do announce today. After this change, screen reader users receive no signal that the page is loading. This was an explicit, informed scope decision, not an oversight.

**Alternatives considered**: `role="status"` + visually-hidden text (the original plan) — rejected per the revised requirement. `aria-busy` on a container — also rejected, since even that would still surface some signal to some assistive tech; the revised requirement calls for none.

## Decision: `prefers-reduced-motion` handled via CSS media query

**Decision**: The rotation `@keyframes` animation is gated behind `@media (prefers-reduced-motion: no-preference)`; under reduced motion, the spinner renders as a static (non-rotating) ring.

**Rationale**: Pure CSS, no JS media-query listener needed, works even if JS re-renders are throttled, and is the standard idiom for this requirement.

**Alternatives considered**: Detecting the preference in JS via `window.matchMedia` and conditionally rendering — rejected as unnecessary complexity; CSS alone satisfies FR-005/SC-003.

## Output

All Technical Context fields are resolved (see plan.md). Ready for Phase 1.
