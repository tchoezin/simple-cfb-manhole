/**
 * Non-modal preview listing a player's owned teams by name, shown while
 * the pointer hovers a player's name (FR-002, FR-005). Positioned via the
 * `style` prop, computed by the parent using src/lib/dialogPosition.ts
 * (FR-009), flush against the anchor (zero gap) with no dead space the
 * pointer could exit through.
 *
 * `onMouseEnter`/`onMouseLeave` are forwarded from the parent
 * (`Leaderboard`) rather than handled internally: the dialog is
 * `position: fixed` and rendered away from the name's on-screen position,
 * so the browser does NOT treat moving onto it as "staying within" the
 * name's DOM subtree purely by nesting — the parent checks
 * `event.relatedTarget` against both elements to decide whether the
 * pointer is still within the combined name+dialog region (FR-010,
 * research.md §2 — see Leaderboard.tsx for the actual check).
 */
import { forwardRef } from "react";
import type { CSSProperties, MouseEventHandler } from "react";
import "./RosterPreviewDialog.css";

export interface RosterPreviewDialogProps {
  /** Resolved team display names for the hovered player's roster. */
  teamNames: string[];
  /** Computed, viewport-clamped position (undefined until measured). */
  style?: CSSProperties;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: MouseEventHandler<HTMLDivElement>;
}

export const RosterPreviewDialog = forwardRef<
  HTMLDivElement,
  RosterPreviewDialogProps
>(function RosterPreviewDialog(
  { teamNames, style, onMouseEnter, onMouseLeave },
  ref,
) {
  return (
    <div
      className="roster-preview-dialog"
      role="dialog"
      style={style}
      ref={ref}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {teamNames.length === 0 ? (
        <p className="roster-preview-dialog-empty">No teams listed.</p>
      ) : (
        <ul>
          {teamNames.map((name, index) => (
            <li key={`${index}-${name}`}>{name}</li>
          ))}
        </ul>
      )}
    </div>
  );
});
