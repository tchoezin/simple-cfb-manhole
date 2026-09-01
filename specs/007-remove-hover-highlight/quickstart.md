# Quickstart: Remove Player Row Hover Highlight

## Change

Remove the `.leaderboard tbody tr:hover { background: var(--color-bronze-tint); }` rule from `src/components/Leaderboard.css` (currently around line 38).

## Manual Verification

1. Run `npm run dev` and open the leaderboard.
2. Move the mouse pointer over several player rows.
3. Confirm no row's background changes on hover — rows retain only their alternating-shading appearance.
4. Hover a player's name specifically and confirm the existing roster preview dialog and its progress indicator (features 003, 005) still work unchanged.

## Automated Verification

If a test asserts the presence of the hover-highlight class/style (e.g., in `Leaderboard.test.tsx`), update or remove that assertion to match the new behavior. Run `npm test` to confirm the full suite passes.
