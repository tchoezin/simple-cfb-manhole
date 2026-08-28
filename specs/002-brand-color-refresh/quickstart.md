# Quickstart: Verifying the Larger Header Logo

## Run the app

```sh
npm install
npm run dev
```

Open the printed local URL. Confirm:

1. The logo is noticeably larger than before — it should read as the header's dominant visual
   element, not a small icon.
2. The logo stays horizontally centered and the header's bottom border/spacing still looks
   balanced (not cramped against the larger mark).
3. Resize the browser down to phone width (~320–375px) — confirm no page-level horizontal
   scrolling and the logo doesn't overflow or get clipped.
4. Resize up to desktop width — confirm the header still looks proportionate inside the
   centered/contained page layout.

## Run tests

```sh
npm run test
npm run lint
```

Confirm both pass with no regressions (no test asserts specific logo pixel dimensions, so none
should need updating).
