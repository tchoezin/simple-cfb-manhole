/**
 * Visible banner shown when the leaderboard is rendering cached, last-known
 * scores because the live ESPN fetch failed (FR-015). Styled as a
 * brand-consistent warning (FR-006).
 */
import "./StaleDataNotice.css";

export interface StaleDataNoticeProps {
  /** ISO timestamp of when the cached data was last successfully computed. */
  computedAt: string;
}

export function StaleDataNotice({ computedAt }: StaleDataNoticeProps) {
  const formatted = new Date(computedAt).toLocaleString();
  return (
    <p role="status" className="stale-data-notice">
      Showing last-known scores as of {formatted}. Live data is currently
      unavailable.
    </p>
  );
}
