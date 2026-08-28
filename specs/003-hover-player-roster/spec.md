# Feature Specification: Player Roster Hover Preview

**Feature Branch**: `003-hover-player-roster`
**Created**: 2026-08-28
**Status**: Draft
**Input**: User description: "When the mouse is hovering over the player name for 2 seconds, open up a dialog that shows the teams on that player's roster. When the mouse moves off of that player name, close that dialog"

## Clarifications

### Session 2026-08-28

- Q: When the pointer moves from the player name onto the open dialog itself, should the dialog remain open or close immediately? → A: Dialog stays open as long as the pointer is over the player's name or the dialog itself; closes only when the pointer leaves both.
- Q: Is a keyboard/focus-triggered equivalent required for this iteration (for users who can't hover with a mouse)? → A: No — hover/pointer-only, no keyboard equivalent in this iteration.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Preview a player's roster without leaving the leaderboard (Priority: P1)

A visitor is scanning the leaderboard and wants to know which teams a specific player owns, without navigating away from the standings or clicking anything.

**Why this priority**: This is the entire feature — it is the only user-facing behavior requested, and it delivers the full value on its own.

**Independent Test**: Load the leaderboard, position the mouse pointer over any player's name, keep it still for 1 second, and confirm a dialog appears listing that player's owned teams. Move the pointer away and confirm the dialog closes.

**Acceptance Scenarios**:

1. **Given** the leaderboard is displayed, **When** the user hovers the pointer over a player's name and holds it there for 1 second, **Then** a dialog opens showing the full list of teams on that player's roster.
2. **Given** the roster dialog is open for a player, **When** the user moves the pointer off of that player's name and not onto the dialog itself, **Then** the dialog closes immediately.
5. **Given** the roster dialog is open for a player, **When** the user moves the pointer from the player's name directly onto the open dialog, **Then** the dialog remains open; it only closes once the pointer leaves both the name and the dialog.
3. **Given** the user hovers over a player's name but moves the pointer away before 1 second has elapsed, **When** the pointer leaves, **Then** no dialog opens.
4. **Given** the roster dialog is open for one player, **When** the user moves the pointer directly onto a different player's name, **Then** the first dialog closes and, after a fresh 1-second hover on the new name, a dialog opens for the new player.

---

### Edge Cases

- What happens if the user hovers over a player whose roster list is empty or incomplete in the source data? The dialog should still open and clearly indicate no teams are listed, rather than appearing blank or erroring.
- What happens if the pointer hovers over the name, then moves within the name's own bounds (not fully off it) before 1 second elapses? The hover timer should continue uninterrupted since the pointer never left the name.
- What happens if the dialog itself would render off-screen (e.g., hovering a name near the edge of the viewport)? The dialog must reposition to stay fully visible.
- What happens on touch devices where there is no persistent hover state? Hover-triggered dialogs are out of scope for touch input; no equivalent trigger is required for this feature.
- What happens if the user hovers, the dialog opens, and then the underlying leaderboard data changes (e.g., a live refresh) while the dialog is still open? The dialog should reflect the roster at the time it opened; it does not need to live-update mid-hover.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST detect when the pointer has been continuously positioned over a player's name for 1 second.
- **FR-002**: System MUST open a dialog immediately upon the 1-second hover threshold being reached, displaying the list of teams on that player's roster.
- **FR-003**: System MUST NOT open the dialog if the pointer leaves the player's name before the 1-second threshold is reached.
- **FR-004**: System MUST close the open roster dialog as soon as the pointer moves off of both the player's name it was opened for and the dialog itself (moving the pointer onto the dialog does not close it).
- **FR-005**: System MUST identify each listed team by its name (not merely an internal identifier) so the dialog is meaningful to the user.
- **FR-006**: System MUST support hovering over any player row in the leaderboard, not a limited subset.
- **FR-007**: System MUST restart the 1-second timer from zero each time the pointer re-enters a player's name after having left it.
- **FR-008**: System MUST allow only one roster dialog to be open at a time; hovering a new player's name after 1 second closes any previously open dialog and shows the new player's roster.
- **FR-009**: System MUST keep the dialog fully within the visible viewport, adjusting its position if the default placement would clip it off-screen.
- **FR-010**: System MUST NOT treat mouse movement within the bounds of the same player's name, or movement from the name onto the open dialog, as "leaving" — the hover timer and open dialog persist as long as the pointer remains over the name or the dialog.

### Key Entities

- **Player**: A leaderboard participant identified by name, associated with a fixed roster of teams for the season.
- **Team**: A college football team that may appear on one or more players' rosters; represented in the dialog by its name.
- **Roster Preview Dialog**: A transient, non-modal UI element tied to pointer hover state over a single player's name, listing that player's teams; exists only while the triggering hover condition holds.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view any player's full roster within 1 second of hovering over that player's name, with zero additional clicks required.
- **SC-002**: The roster dialog closes within 100ms of the pointer leaving both the player's name and the dialog itself, so it never lingers after the user has moved on.
- **SC-003**: Briefly passing the pointer over a player's name (under 1 second) never opens a dialog, avoiding unwanted interruptions while scanning the leaderboard.
- **SC-004**: 100% of roster dialogs remain fully visible within the browser window regardless of which player's name (including those near screen edges) triggered them.

## Assumptions

- "Player name" refers to the player name cells already displayed in the leaderboard table.
- "Teams on that player's roster" refers to the fixed set of teams owned by that player for the season, as already tracked by the leaderboard data.
- Team names must be resolved from their internal identifiers for display; using raw identifiers would not satisfy user value.
- This feature applies to pointer/mouse interaction only; no equivalent interaction is required for touch-only or keyboard-only devices in this iteration.
- The dialog is a lightweight, non-modal preview (does not require explicit dismissal, pause page scroll, or block interaction with the rest of the page) rather than a full modal dialog requiring a close button.
