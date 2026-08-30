/**
 * Ranked table of every player and their score (FR-001, FR-002, FR-010).
 * Always one combined list — never grouped, sorted, or filtered by
 * division; `divisionId` feeds the rivalry-bonus calculation in
 * src/lib/scoring.ts and, since 004-division-column, is also displayed
 * (read-only) in a Division column — neither use ever groups, filters, or
 * re-ranks this table.
 *
 * Also owns the roster-hover-preview interaction (003-hover-player-roster,
 * FR-001–FR-010): hovering a player's name for 1s opens a dialog listing
 * that player's teams by name, and it stays open while the pointer is
 * over the name OR the dialog (FR-010). The dialog is `position: fixed`
 * and rendered away from the name's on-screen box, so plain DOM-child
 * mouseleave/mouseenter nesting is NOT enough — the browser fires
 * mouseleave the instant the pointer exits the name's rendered box,
 * before it ever reaches the dialog a few pixels away. Instead, both the
 * name wrapper and the dialog check `event.relatedTarget` on
 * `mouseleave`: if the pointer is entering the *other* element of the
 * pair, the close is skipped (see handleLeaveName/handleLeaveDialog
 * below). The dialog is positioned flush against the anchor (zero gap,
 * src/lib/dialogPosition.ts) so that transition is a direct one.
 *
 * During that same 1s hold, a small progress/loading cue follows the
 * cursor (005-player-hover-indicator, FR-001–FR-004): it renders at
 * `cursorPos` (updated on `mouseMove` over the name) while
 * `hoveringPlayerId` is set for that player and the dialog isn't open
 * yet, and disappears the instant the dialog opens or the pointer leaves
 * early — see handleEnterName/handleMoveName/close below. It is
 * `position: fixed` with `pointer-events: none` so it tracks the cursor
 * anywhere on screen without being clipped by the table's `overflow-x:
 * auto` scroll container and without itself intercepting hover events.
 */
import { useLayoutEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import type { Division, LeaderboardEntry } from "../types/league";
import { resolveTeamNames } from "../lib/teams";
import { resolveDivisionName } from "../lib/divisions";
import { clampToViewport } from "../lib/dialogPosition";
import { RosterPreviewDialog } from "./RosterPreviewDialog";
import "./Leaderboard.css";

const HOVER_DELAY_MS = 1000;

export interface LeaderboardProps {
  entries: LeaderboardEntry[];
  /** teamId -> display name lookup (src/lib/teams.ts). Defaults to empty
   * (dialog falls back to raw ids) so existing callers/tests that don't
   * pass it keep working. */
  teamNamesById?: Map<string, string>;
  /** divisionId -> Division lookup (src/lib/divisions.ts). Defaults to
   * empty (Division column falls back to the raw id) so existing
   * callers/tests that don't pass it keep working. */
  divisionsById?: Map<string, Division>;
}

export function Leaderboard({
  entries,
  teamNamesById,
  divisionsById,
}: LeaderboardProps) {
  const [dialogOpenForPlayerId, setDialogOpenForPlayerId] = useState<
    string | null
  >(null);
  const [dialogStyle, setDialogStyle] = useState<
    { top: number; left: number } | undefined
  >(undefined);
  // Which player's name currently has a hover hold in progress (set on
  // mouseenter, cleared by close()). The progress cue itself only renders
  // while this matches the current row AND the dialog isn't open yet for
  // it (005-player-hover-indicator, FR-004) — see the render below.
  const [hoveringPlayerId, setHoveringPlayerId] = useState<string | null>(
    null,
  );
  // Latest cursor position while a hover hold is in progress, used to
  // position the progress cue next to the pointer rather than the name.
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(
    null,
  );

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRefs = useRef(new Map<string, HTMLSpanElement>());
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const namesById = teamNamesById ?? new Map<string, string>();
  const divisionsLookup = divisionsById ?? new Map<string, Division>();

  function handleEnterName(playerId: string, event: ReactMouseEvent) {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
    // FR-007 (003) / FR-006 (005): always a fresh 1s timer, and a fresh
    // progress cue, on (re-)entry.
    setHoveringPlayerId(playerId);
    setCursorPos({ x: event.clientX, y: event.clientY });
    timerRef.current = setTimeout(() => {
      setDialogOpenForPlayerId(playerId);
      timerRef.current = null;
    }, HOVER_DELAY_MS);
  }

  // Keeps the progress cue tracking the pointer while it stays over the
  // name during the hold.
  function handleMoveName(event: ReactMouseEvent) {
    setCursorPos({ x: event.clientX, y: event.clientY });
  }

  function close() {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setDialogOpenForPlayerId(null);
    setDialogStyle(undefined);
    setHoveringPlayerId(null);
    setCursorPos(null);
  }

  /** True if `node` is the currently-open dialog, or inside it. */
  function isInDialog(node: unknown): boolean {
    return Boolean(node instanceof Node && dialogRef.current?.contains(node));
  }

  /** True if `node` is the given player's name wrapper, or inside it. */
  function isInNameWrapper(playerId: string, node: unknown): boolean {
    const wrapperEl = wrapperRefs.current.get(playerId);
    return Boolean(node instanceof Node && wrapperEl?.contains(node));
  }

  // Leaving the name: don't close if the pointer is moving onto the open
  // dialog (FR-010) — only close if it's truly leaving both.
  function handleLeaveName(playerId: string, event: ReactMouseEvent) {
    if (dialogOpenForPlayerId === playerId && isInDialog(event.relatedTarget)) {
      return;
    }
    close();
  }

  // Leaving the dialog: don't close if the pointer is moving back onto
  // the name it belongs to.
  function handleLeaveDialog(playerId: string, event: ReactMouseEvent) {
    if (isInNameWrapper(playerId, event.relatedTarget)) {
      return;
    }
    close();
  }

  // Measure + clamp position once the dialog has rendered for the
  // newly-opened player (FR-009).
  useLayoutEffect(() => {
    if (dialogOpenForPlayerId === null) return;
    const wrapperEl = wrapperRefs.current.get(dialogOpenForPlayerId);
    const dialogEl = dialogRef.current;
    if (!wrapperEl || !dialogEl) return;

    const anchorRect = wrapperEl.getBoundingClientRect();
    const dialogSize = {
      width: dialogEl.offsetWidth,
      height: dialogEl.offsetHeight,
    };
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    setDialogStyle(clampToViewport(anchorRect, dialogSize, viewport));
  }, [dialogOpenForPlayerId]);

  return (
    <div className="leaderboard-scroll">
      <table className="leaderboard">
        <thead>
          <tr>
            <th scope="col">Rank</th>
            <th scope="col">Player</th>
            <th scope="col">Division</th>
            <th scope="col">Score</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const playerId = entry.player.id;
            const isOpen = dialogOpenForPlayerId === playerId;
            return (
              <tr key={playerId}>
                <td>{entry.rank}</td>
                <td>
                  <span
                    className="player-name-hover"
                    ref={(el) => {
                      if (el) wrapperRefs.current.set(playerId, el);
                      else wrapperRefs.current.delete(playerId);
                    }}
                    onMouseEnter={(event) => handleEnterName(playerId, event)}
                    onMouseMove={handleMoveName}
                    onMouseLeave={(event) => handleLeaveName(playerId, event)}
                  >
                    {entry.player.name}
                    {hoveringPlayerId === playerId && !isOpen && cursorPos && (
                      <span
                        className="hover-progress-indicator"
                        aria-hidden="true"
                        style={{
                          left: cursorPos.x + 12,
                          top: cursorPos.y + 12,
                        }}
                      />
                    )}
                    {isOpen && (
                      <RosterPreviewDialog
                        ref={dialogRef}
                        teamNames={resolveTeamNames(
                          entry.player.ownedTeamIds,
                          namesById,
                        )}
                        style={
                          dialogStyle
                            ? { top: dialogStyle.top, left: dialogStyle.left }
                            : { visibility: "hidden" }
                        }
                        onMouseLeave={(event) => handleLeaveDialog(playerId, event)}
                      />
                    )}
                  </span>
                </td>
                <td>{resolveDivisionName(entry.player.divisionId, divisionsLookup)}</td>
                <td>{entry.total}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
