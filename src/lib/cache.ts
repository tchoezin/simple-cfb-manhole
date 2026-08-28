/**
 * Last-known-good scores cache (FR-015, research.md §6). Persists the
 * *computed* leaderboard result (not raw ESPN payloads) to localStorage so
 * a failed fetch on a later page load can still show something useful,
 * with a visible staleness notice, instead of a blank or error-only page.
 */
import type { LeaderboardResult } from "../types/league";

const STORAGE_KEY_PREFIX = "cfb-manhole:leaderboard:";

function storageKey(season: string): string {
  return `${STORAGE_KEY_PREFIX}${season}`;
}

/**
 * Persists a computed leaderboard result for the given season. Failures
 * (e.g., localStorage unavailable/full/blocked) are swallowed — caching is
 * a best-effort fallback, not a correctness requirement.
 */
export function saveScores(season: string, result: LeaderboardResult): void {
  try {
    window.localStorage.setItem(storageKey(season), JSON.stringify(result));
  } catch {
    // Best-effort only; ignore storage failures (e.g., private browsing).
  }
}

/**
 * Loads the last successfully saved leaderboard result for the given
 * season, or null if none exists or it can't be read/parsed.
 */
export function loadScores(season: string): LeaderboardResult | null {
  try {
    const raw = window.localStorage.getItem(storageKey(season));
    if (!raw) return null;
    return JSON.parse(raw) as LeaderboardResult;
  } catch {
    return null;
  }
}
