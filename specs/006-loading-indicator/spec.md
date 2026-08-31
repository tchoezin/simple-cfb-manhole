# Feature Specification: Leaderboard Loading Indicator

**Feature Branch**: `006-loading-indicator`
**Created**: 2026-08-30
**Status**: Draft
**Input**: User description: "Add a visual loading indicator when the leaderboard is loading in instead of the "Loading leaderboard..." text"

## Clarifications

### Session 2026-08-30

- Q: What type of visual loading indicator should replace the text? → A: Spinner/animated icon only (e.g., a rotating ring), no layout mimicry
- Q: What text should assistive technology announce for the loading indicator? → A: Keep "Loading leaderboard…" as a screen-reader-only label (visually hidden, same wording as today)
- Q: (Revised 2026-08-30, later in same session) Should any accessible text remain for the loading indicator? → A: No — remove all text; the indicator is purely visual with no accessible label. This supersedes the prior answer and is a deliberate scope reduction: screen reader users no longer receive a loading announcement (a regression from today's behavior), accepted as a tradeoff for a purely visual indicator.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See a visual cue while the leaderboard loads (Priority: P1)

A visitor opens the app while the leaderboard's live scores are still being fetched. Instead of reading a plain line of text ("Loading leaderboard…"), they see a visual loading indicator (e.g., a spinner or animated placeholder) that clearly signals the page is working and not stalled or broken.

**Why this priority**: This is the entire scope of the feature — replacing the text-only loading state is the one change being requested.

**Independent Test**: Load the app with network requests artificially delayed; confirm a visual loading indicator is displayed in place of the "Loading leaderboard…" text during the loading phase, and that it is replaced by the leaderboard (or an error/stale-data state) once loading finishes.

**Acceptance Scenarios**:

1. **Given** the app has just been opened and leaderboard data has not yet resolved, **When** the page renders, **Then** a visual loading indicator is shown instead of the "Loading leaderboard…" text.
2. **Given** the visual loading indicator is showing, **When** the leaderboard data finishes loading successfully, **Then** the loading indicator is removed and the leaderboard is displayed.
3. **Given** the visual loading indicator is showing, **When** the data fetch fails and no cached data is available, **Then** the loading indicator is removed and the "unavailable" error message is displayed.
4. **Given** the visual loading indicator is showing, **When** the data fetch fails but cached data is available, **Then** the loading indicator is removed and the stale-data leaderboard is displayed.

### Edge Cases

- What happens if the loading phase completes almost instantly (e.g., served from a fast cache)? The indicator should not visibly flash/flicker in a jarring way — a brief appearance is acceptable, but the transition should remain smooth.
- What happens if a user has "reduced motion" accessibility preferences enabled? The indicator should respect that preference rather than forcing a spinning/animated motion effect on them.
- What happens if loading takes an unusually long time (e.g., slow network)? The indicator should continue to display for as long as the loading state persists, without needing a timeout or fallback message, since long loads are already handled by the existing stale/unavailable states once the fetch resolves.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a visual loading indicator while the leaderboard data is being fetched, replacing the current plain-text "Loading leaderboard…" message.
- **FR-002**: The visual loading indicator MUST be a spinner/animated icon (e.g., a rotating ring) rather than a skeleton placeholder mimicking the leaderboard layout or a progress bar.
- **FR-003**: The system MUST remove the loading indicator and show the appropriate next state (live leaderboard, stale leaderboard, or unavailable message) as soon as loading completes, matching current behavior for those states.
- **FR-004**: The loading indicator MUST be purely visual with no accessible text label or announcement — it MUST be hidden from assistive technology (e.g., via `aria-hidden`) rather than exposing any text, including the previous "Loading leaderboard…" wording.
- **FR-005**: The loading indicator MUST respect the user's reduced-motion preference by presenting a non-animated (or minimally animated) alternative when that preference is set.
- **FR-006**: The loading indicator MUST be visually consistent with the app's existing look and feel (colors, spacing, styling conventions already used elsewhere in the app).

### Key Entities

- **Load State**: The existing loading/live/stale/unavailable status already tracked by the app; this feature only changes what is rendered for the "loading" status, not the state machine itself.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of app loads that pass through a loading phase display the visual indicator instead of the "Loading leaderboard…" text.
- **SC-002**: The loading indicator is replaced by the correct subsequent view (leaderboard, stale notice, or unavailable message) with no perceptible delay beyond current load-completion behavior.
- **SC-003**: Users with reduced-motion preferences enabled do not see a spinning/animated indicator.

## Assumptions

- The existing load-state machine (`loading` / `live` / `stale` / `unavailable`) in the app is unchanged; only the visual presentation of the `loading` state is affected.
- No minimum display duration or artificial delay is introduced — the indicator shows for exactly as long as loading actually takes.
- No loading progress percentage or step-by-step status text is required — a simple indeterminate indicator is sufficient, since the underlying fetch does not expose progress information.
