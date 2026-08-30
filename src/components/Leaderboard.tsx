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

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRefs = useRef(new Map<string, HTMLSpanElement>());
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const namesById = teamNamesById ?? new Map<string, string>();
  const divisionsLookup = divisionsById ?? new Map<string, Division>();

  function handleEnterName(playerId: string) {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
    // FR-007: always a fresh 1s timer on (re-)entry.
    timerRef.current = setTimeout(() => {
      setDialogOpenForPlayerId(playerId);
      timerRef.current = null;
    }, HOVER_DELAY_MS);
  }

  function close() {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setDialogOpenForPlayerId(null);
    setDialogStyle(undefined);
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
                    onMouseEnter={() => handleEnterName(playerId)}
                    onMouseLeave={(event) => handleLeaveName(playerId, event)}
                  >
                    {entry.player.name}
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
