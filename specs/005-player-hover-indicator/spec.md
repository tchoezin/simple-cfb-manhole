# Feature Specification: Player Name Hover Indicator

**Feature Branch**: `005-player-hover-indicator`
**Created**: 2026-08-30
**Status**: Draft
**Input**: User description: "Add a visual indicator when the mouse hovers over a player name, shown before the roster preview dialog (from feature 003-hover-player-roster) opens. This should give the user a clear signal that hovering over the name is being recognized during the pre-dialog delay, so it's clear the name is interactive and a dialog is pending."

## Clarifications

### Session 2026-08-30

- Q: What form should the visual indicator take? → A: A small progress/loading-style cue (e.g., a tiny circular loader near the cursor or on the name) that fills or animates over the 1-second hold, implicitly communicating that a dialog is about to appear — rather than a static style change like an underline or color shift.
- Q: Once the roster dialog actually opens (after the 1-second hold), what should the loading-style indicator do? → A: Disappear once the dialog opens — the indicator's job is to signal that a dialog is imminent; once the dialog is showing, the anticipation is resolved and the dialog itself is the signal, so the indicator completes/disappears rather than lingering.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See that a dialog is about to appear while hovering a player name (Priority: P1)

A visitor scanning the leaderboard moves the pointer over a player's name and, during the 1-second hold before the roster preview dialog (feature 003) appears, sees a small progress/loading-style cue building up on or near the name — implicitly signaling that continuing to hover will open a dialog. Once the dialog opens, the cue disappears, since the dialog itself now confirms what was about to happen.

**Why this priority**: This is the entire feature — it is the only user-facing behavior requested, and it delivers the full value on its own.

**Independent Test**: Load the leaderboard, position the mouse pointer over any player's name, and confirm a progress/loading-style cue appears immediately and builds up over the 1-second hold, then disappears exactly as the roster dialog opens. Move the pointer away before the hold completes and confirm the cue disappears without a dialog opening.

**Acceptance Scenarios**:

1. **Given** the leaderboard is displayed, **When** the user moves the pointer over a player's name, **Then** a progress/loading-style visual cue appears immediately and animates/fills over the course of the 1-second hold, without waiting for the roster dialog to open.
2. **Given** a player's name is showing the loading-style indicator, **When** the user moves the pointer off of that name before the 1-second hold completes, **Then** the indicator disappears immediately and no dialog opens (consistent with existing feature 003 behavior).
3. **Given** the user hovers over a player's name for less than 1 second and moves away before the roster dialog opens, **When** the pointer leaves, **Then** the indicator disappears and no dialog opens.
4. **Given** the pointer has held over a player's name for the full 1-second hold, **When** the roster dialog opens, **Then** the loading-style indicator disappears at that moment, since the dialog itself now signals what the indicator was building toward.
5. **Given** the roster dialog is open for a player's name, **When** the user moves the pointer from the name onto the dialog itself, **Then** the dialog remains open per existing feature 003 behavior (the indicator is already gone, having disappeared when the dialog opened).

---

### Edge Cases

- What happens when the user hovers over a player's name near a screen edge where the roster dialog would need to reposition? The loading-style indicator's appearance and timing are unaffected by dialog positioning; it depends only on pointer-over-name state and elapsed hold time.
- What happens on touch devices with no persistent hover state? Consistent with feature 003, the indicator is a pointer/mouse-only affordance; no equivalent is required for touch input in this iteration.
- What happens if the user rapidly moves the pointer across multiple player names in quick succession? Each name independently restarts its own progress indicator from zero when hovered, and only one name shows an active indicator at a time.
- What happens if a player's name is very short or very long? The indicator must be positioned consistently relative to the name (e.g., near the cursor or anchored to the name) regardless of the name's length.
- What happens if the user moves the pointer off the name and back on before the 1-second hold completes? The progress indicator restarts from zero, consistent with feature 003's existing hover-timer restart behavior (FR-007 of 003-hover-player-roster).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a progress/loading-style visual cue as soon as the pointer enters a player's name hoverable area, without waiting for the roster preview dialog's 1-second threshold to complete.
- **FR-002**: The visual cue MUST visibly animate or fill over the course of the 1-second hold, so its progression implicitly communicates that a dialog will open if the hover continues.
- **FR-003**: System MUST remove the visual cue immediately if the pointer leaves the player's name before the 1-second hold completes, and no dialog opens in that case (consistent with existing feature 003 behavior).
- **FR-004**: System MUST make the visual cue disappear at the moment the roster dialog opens (i.e., when the 1-second hold completes) — the cue does not persist alongside the open dialog.
- **FR-005**: System MUST apply the visual cue independently per player name, so hovering one name never shows or affects the cue for another name.
- **FR-006**: System MUST restart the visual cue from its initial state each time the pointer re-enters a player's name after having left it, mirroring the existing hover-timer restart behavior from feature 003.
- **FR-007**: System MUST support the visual cue on every player name in the leaderboard, not a limited subset.
- **FR-008**: System MUST NOT alter the existing roster dialog open/close timing or behavior defined in feature 003 — this feature only adds a progress-style visual cue during the existing pre-dialog hold.

### Key Entities

- **Player Name Cell**: The existing leaderboard table element that displays a player's name and triggers the feature 003 roster preview dialog on hover; gains a progress/loading-style hover cue as part of this feature.
- **Hover Progress Indicator**: A transient visual element (e.g., a small circular loader) tied to the pointer's hold time over a single player's name; animates from empty to complete across the 1-second hold and disappears once the hold completes and the dialog opens, or immediately if the pointer leaves early.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users see the progress/loading cue begin within 100ms of the pointer entering a player's name, well before the 1-second roster dialog threshold.
- **SC-002**: The progress cue visibly reflects elapsed hold time (e.g., a majority of the 1-second hold shows a visibly different fill/animation state than the start), so users can perceive that a dialog is imminent rather than seeing a static icon.
- **SC-003**: The cue disappears within 100ms of either the pointer leaving the name early, or the roster dialog opening — it never remains visible alongside an open dialog.
- **SC-004**: 100% of player names in the leaderboard show the progress cue when hovered, with no exceptions based on name length or row position.
- **SC-005**: The change introduces no observable difference in when the roster preview dialog itself opens or closes, compared to feature 003's existing timing.

## Assumptions

- "Player name" refers to the same player name cells already displayed in the leaderboard table and already wired to the feature 003 hover-to-dialog behavior.
- The visual cue is a small progress/loading-style animation (e.g., a filling circular loader near the cursor or anchored to the name) rather than a static style change; exact visual design (size, color, exact animation) is a design/implementation choice deferred to planning, expected to draw on the existing brand palette (002-brand-color-refresh).
- This feature applies to pointer/mouse interaction only, consistent with feature 003's pointer-only scope; no keyboard/touch equivalent is required in this iteration.
- No new data, dialog, or interaction model is introduced — this is a purely visual refinement layered onto the existing feature 003 hover interaction and its existing 1-second timer.
