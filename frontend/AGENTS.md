## UI conventions

Use native `<img>` elements with original image assets. Do not use `next/image`, its optimizer, or `next/legacy/image`. Preserve explicit width/height, alt text, and existing styling when adding images.

Prefer client-side Next.js UI and routing. Fetch private application data in the browser from the Express backend; keep backend logic in Express. Next.js may generate the public page shell and social metadata, but do not move private data fetching into server rendering, Server Actions, or Next API routes.

Use `useFamilyData` for family members and gifts, and `useGiftActions` for gift writes. The SWR cache is scoped to the signed-in account and family; never persist this private data in local storage. Show cached content immediately, fetch fresh data client-side on screen mount, and update the view in place. Deduplicate requests within two seconds. Also refresh on focus and reconnect. Do not set page loading state just to navigate. Use the candy-cane loader only while required data is genuinely unavailable.

Display people using first names only throughout the UI, including greetings, wishlist titles, empty states, gift recipients, claimants, and attributions. Use `getFirstName`; do not display surnames or special-case full names.

Use "giving" for gifts someone has chosen to give, with "to" before the recipient. Avoid "getting" because it can mean receiving. Keep internal claim terminology out of user-facing copy. The list is "Gifts I'm giving"; "My wishlist" is what the user wants to receive.

Shared page header titles stay centered relative to the panel, independently of the Back button and avatar. Use the shared Header component for this pattern.

Page-header avatars use the shared Header's -8px top and right offsets to mirror the Back button's tight corner spacing. Keep this consistent on wishlist, gift detail, and add/edit gift screens.

At viewport widths of 400px and below, show only the user's name instead of the welcome greeting, and use the shared arrow-only Back button with its accessible label and 44px tap target.

All solid green and red buttons use the shared Button component's crisp text and icon shadows automatically. Outlined and link buttons must not have text shadows or icon drop shadows.

Use the shared candy-cane `Loader` spinner for loading feedback. Never change button text during loading, saving, or submitting. Keep the original label and disable the button while the action is in progress.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
