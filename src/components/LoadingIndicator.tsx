/**
 * Purely visual spinner shown while the leaderboard's live scores are being
 * fetched, replacing the plain-text "Loading leaderboard…" message
 * (006-loading-indicator, FR-001, FR-002). It carries no accessible text —
 * aria-hidden so assistive technology skips it entirely (FR-004, revised
 * Clarification 2026-08-30: a deliberate scope reduction from the earlier
 * screen-reader-only-label plan; screen reader users receive no loading
 * announcement).
 */
import "./LoadingIndicator.css";

export function LoadingIndicator() {
  return <div className="loading-indicator" aria-hidden="true" />;
}
