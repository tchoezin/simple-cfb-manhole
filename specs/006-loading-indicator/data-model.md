# Phase 1 Data Model: Leaderboard Loading Indicator

This feature introduces no new data entities, persisted state, or changes to existing data shapes. It changes only what is rendered for the app's existing `loading` status.

## Existing state reused (unchanged)

`LoadState` (defined in `src/App.tsx`) — already a discriminated union:

```ts
type LoadState =
  | { status: "loading" }
  | { status: "live"; result: LeaderboardResult }
  | { status: "stale"; result: LeaderboardResult }
  | { status: "unavailable" };
```

This feature does not add, remove, or modify any member of this union. It changes only the JSX rendered when `state.status === "loading"`.

## New component props

**`LoadingIndicator`** — no props. It is a static, self-contained presentational component with no external inputs (no progress percentage, no dynamic label — per spec Assumptions, the label text is fixed).

## Validation rules

None — no user input, no persisted data, no data validation involved.
