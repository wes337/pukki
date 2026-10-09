# Avatar assets

Keep both generated sheets and the additional winter-stubble avatar. All 21 new avatars are available as transparent 256px PNGs in `frontend/public/images/avatars/`; the original placeholder avatars remain available too.

The first sheet is `docs/assets/avatars-sheet.png`. The second is `docs/assets/avatars-blonde-sheet.png`. Prompts are saved in `avatar-sheet-prompt.txt`, `avatar-blonde-sheet-prompt.txt`, and `avatar-winter-stubble-prompt.txt` alongside this document. All were made with built-in imagegen.

Regenerate the individual crops from the saved sheets with:

```sh
pnpm --filter pukki-frontend exec node scripts/split-avatar-sheet.mjs
pnpm --filter pukki-frontend exec node scripts/split-avatar-sheet.mjs --blonde
```

The splitter preserves transparency and applies consistent padding. Neither sheet replaces the other.
