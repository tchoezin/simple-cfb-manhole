# Quickstart: Leaderboard Loading Indicator

## Verify the change locally

1. Install deps and start the dev server:
   ```sh
   npm ci
   npm run dev
   ```
2. Open the app. On first load (before ESPN data resolves), you should see a small rotating spinner where the `"Loading leaderboard…"` text used to be — no visible text.
3. To reliably see the loading state (network is usually fast), throttle network requests in your browser devtools (e.g., Chrome DevTools → Network → Slow 3G) and reload.

## Verify accessibility

1. In macOS System Settings → Accessibility → Display, enable "Reduce motion", then reload the page during the loading phase. The spinner should render as a static ring (not rotating).
2. With a screen reader running (VoiceOver on macOS: Cmd+F5), reload the page during the throttled loading phase. Nothing should be announced for the loading indicator — it is intentionally decorative (`aria-hidden="true"`) with no accessible text, per the revised Clarification.

## Run tests

```sh
npm test
```

Expect the existing `tests/integration/leaderboard.test.tsx` (or a new test file covering the loading state) to assert:
- The spinner element is present during `status: "loading"`.
- The spinner carries `aria-hidden="true"` and exposes no accessible text (no `"Loading leaderboard…"` text node anywhere, visible or hidden).
- No plain visible `"Loading leaderboard…"` paragraph is rendered anymore.
- Once loading resolves, the spinner is removed and the correct next view (leaderboard / stale notice / unavailable message) renders, matching existing behavior.
