# Pukki

## Platform

Web app, including mobile browsers and an installable PWA. The frontend is hosted on Vercel and the backend on Fly. Production only, with GitHub Actions deploying pushes to `master`.

An Expo React Native app in `mobile/` wraps the production website for iOS and Android. It reuses the web screens and handles native navigation, invitation links, loading and retry. Native signing and verified HTTPS app links require platform account setup; see [mobile setup](docs/MOBILE.md).

The minimum supported viewport width is 375 CSS pixels. Use that width for mobile layout checks.

## Purpose

Families share Christmas wishlists and coordinate who buys each gift. Gift recipients do not see who has claimed their gifts.

## Accounts and families

Accounts use an email address and password without email confirmation. Signup asks for email, password and password confirmation. Passwords must be at least six characters. New accounts then complete the “What's your name?” screen before creating or joining a family. Returning accounts with a saved name skip this step. Each account belongs to at most one family. A user can create a family or join immediately using a short family code or a QR invitation. Families must not be able to access one another's users, wishlists or claims.

Password reset signs the user in automatically. After changing the password, continue to their family or pending invitation, completing first-name onboarding if needed. Reset links are single-use and expire after 30 minutes. A successful reset revokes old sessions and other reset links.

New family codes have six case-insensitive characters, excluding I, O, 0, and 1. Code entry uses one native text input displayed as six boxes, with autofocus, native editing and full-code paste. Entering or pasting a complete valid code automatically submits it. A rejected invalid or unknown code clears the boxes and focuses the first box, keeping the error visible. Network and service errors preserve the code for retry. The active box uses the shared candy-cane focus style. Existing eight-character invitations remain valid.

Invitation links and QR codes show the family name and invitation artwork before authentication, with Create account selected by default and a Sign in option. The code is preserved through authentication and the first-name step, then an explicit Join action accepts the invitation. They never open pre-filled code entry or join automatically. Rate-limited invitation previews reveal only the family name and ID to anyone holding the code, never members or wishlists. Existing members can open their family but cannot switch families through an invitation.

## Implementation constraints

Use a pnpm monorepo with a Next.js frontend client and a separate TypeScript Express backend. The frontend calls the backend for all account and application data. Keep English/Finnish support. All app data and migrations stay in the `pukki` schema of the shared Postgres database. Other projects use this database in production.

Screen names, routes, and states are listed in [the sitemap](docs/SITEMAP.md).

## Visual preferences

- Do not apply text shadows or icon drop shadows to outlined buttons. The crisp shadow treatment is for filled colored buttons.

- Use the global `ToastProvider` and `useToast()` from `frontend/components/Toast/Toast.js` for brief action feedback. Call `showToast(message)` or `showToast(message, { tone: "error" })`. Toasts slide up from the bottom, stay for four seconds, then slide away; a new toast replaces the current one. Respect reduced-motion settings and keep form validation errors inline.

- Family names use large, centered Amore Christmas decorative headings at regular weight, never bold. Functional page, form, and dialog titles use Quicksand. Headings and logo lettering have no stroke or text shadow; filled buttons keep their existing shadow treatment.

- Show the shared candy-cane `Loader` spinner for loading, saving, and submitting states. Keep button text unchanged throughout; never replace labels with "Submitting...", "Saving...", or other loading text. Disable the button while its action is in progress.

- All text inputs and textareas use the shared `Input` component and its candy-cane focus ring: red/off-white stripes, gray inner and outer edges, a 2px gap, and a system-color outline in forced-colors mode. Use it for new forms too.

- Prefer Pukki's custom icons. Use `react-icons` for basic utility icons where the custom set has a gap.

Copy workflow: finalize the English copy with Wes before creating or updating translations. Existing translations may remain, but new copy changes must wait for explicit approval before translation.

Keep site copy and instructions to a minimum. Make actions intuitive through clear labels, layout, and controls. Do not add explanatory introductions, helper paragraphs, or hints that repeat what the interface already communicates. Add guidance only when it is necessary to complete an action or resolve an error.

- "Sign in" headings and labels must use regular weight, never bold. Apply the same styling to the Finnish translation and the shared Create account form.
- Avoid solid black in the UI. Use shared theme colors for text, borders, focus rings, and controls; the dark neutral is `$colorDarkGray` through the `$colorText` token.
- All solid green and red buttons automatically use a crisp 2px downward text and icon shadow, with zero horizontal offset, blur, or spread. Use a darker, muted version of the button's own color, never black. The shadow mixes 45% of the button color with 55% `$colorDarkGray`: `text-shadow: 0 2px 0 var(--content-shadow)` for labels and `filter: drop-shadow(0 2px 0 var(--content-shadow))` for icons. This is built into `frontend/components/Button/Button.module.scss`; outlined and link buttons remain shadow-free.

## Open decisions

Leaving a family, removing members and transferring ownership are outside the current create-and-join flow.
