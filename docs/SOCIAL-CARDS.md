# Social preview cards

- `frontend/public/images/social/pukki-wide.png`: 1200 × 630, the primary Open Graph and Twitter/X card.
- `frontend/public/images/social/pukki-square.png`: 1200 × 1200, a secondary Open Graph image for clients that prefer square artwork.

Both reuse the existing Santa logo, Pacifico lettering, theme palette, and snowy-hill shape. The favicon is unchanged. The source artwork is `frontend/public/images/icons/santa-claus.png`; the hill path comes from `SnowyHills.js`. Pacifico is bundled for reproducible image generation under `frontend/scripts/assets/` with its SIL Open Font License, sourced from https://github.com/google/fonts/tree/main/ofl/pacifico.

Regenerate the PNGs from the repo root:

```sh
pnpm --filter pukki-frontend exec node scripts/generate-social-cards.mjs
```

The shared metadata in `frontend/pages/_app.js` is rendered into the initial HTML, including signed-out and invitation routes. It contains the app name and generic English copy, never personal names or gift details. Existing translation files are unchanged.

Invitation pages omit `og:url`: their static HTML cannot include the invitation query string, so a canonical URL would risk discarding the code. Sharing clients can use the actual URL that was shared.

`siteOrigin` in `frontend/config.js` supplies absolute image URLs using the production address, `https://pukki.gifts`. Sharing apps must be able to fetch the deployed page and image without login or deployment protection. Local changes do not update public previews until deployed, and sharing apps may cache previous cards.

Metadata follows the [Open Graph protocol](https://ogp.me/), including image dimensions and alt text. Each service chooses its own layout and which image it uses; providing a square alternative does not force a square preview.
