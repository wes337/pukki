# Production deployment

Production only: Vercel frontend, Fly backend, no staging or preview deployments.

## Configuration

Only secrets belong in environment variables. Non-secret settings are checked in:

- `deploy/vercel-project.json`: Vercel project `prj_VWbnAGAAobzBvNpodt8bMYStqvTx` and its owner `team_wLivusBDdP5IfqYAQ6vRiHLb`. The user ID does not own this project directly. Actions copies this file to the Vercel CLI's project metadata.
- `backend/fly.toml`: app `pukki`, region, machine size, health check, release command.
- `backend/src/constants/config.ts`: frontend origin, server port, cookie policy.
- `frontend/config.js`: local and production API URLs.

`NODE_ENV` remains the standard framework/runtime mode. No GitHub repository variables or frontend env files are needed.

## Secrets

| Location | Secrets |
| --- | --- |
| Root `.env` | `VERCEL_TOKEN`, `FLY_TOKEN`, `DIGITALOCEAN_TOKEN`, `CLOUDFLARE_API_TOKEN`, `SENDGRID_MANAGEMENT_API_KEY` for local deployment/admin work |
| `backend/.env` | Runtime `POSTGRES_URL`, `SENDGRID_API_KEY` |
| GitHub Actions | `VERCEL_TOKEN`, `FLY_TOKEN` |
| Fly | Runtime `POSTGRES_URL`, `SENDGRID_API_KEY` |

Actions maps `FLY_TOKEN` to the Fly CLI's required `FLY_API_TOKEN` variable. The DigitalOcean token is not used by the app. GitHub and Vercel do not need the production database credential. Env files are ignored by Git and excluded from Docker builds.

The SendGrid management key stays local; only the sending key is deployed to Fly. Import secrets through stdin rather than putting values in shell arguments. Updating Fly secrets restarts the existing application image.

## One-time hosting setup

1. Fly app `pukki` in `com98-llc` runs one 1 GB shared-CPU machine in `ewr`.
2. Fly's `POSTGRES_URL` secret uses the existing managed database credential. The image includes its CA certificate for verified TLS. Do not create or reset a database.
3. The existing `wesley-moses-projects/pukki` Vercel project uses Root Directory `frontend`, Node.js 22 in its project settings, and access to files outside that root for the workspace lockfile. `.vercelignore` excludes backend files and local env files from CLI uploads.
4. Actions needs the two GitHub secrets. `frontend/vercel.json` disables automatic Git deployments and previews; Actions owns push releases.

The first production deployment of the current monorepo completed on October 9, 2026. Fly's schema-scoped migration release and health check passed, and Vercel published the frontend. GitHub Actions deployment credentials are configured for the push workflow.

## Push to deploy

The workflow runs on `master` pushes affecting apps, dependencies, or deployment config. Documentation-only pushes do not deploy. Manual runs must use `master`.

Checks use disposable Postgres. After lint, type checks, tests and builds pass, Actions builds the production frontend, deploys Fly with schema migrations, then publishes Vercel. Releases run serially without canceling in-progress migrations. There is no staging promotion or approval gate.

Both apps deploy together. If Vercel fails after Fly succeeds, the previous frontend stays live. Keep API/database changes compatible with the previous frontend and rerun after fixing the failure.

## Domains and cookies

The frontend is `https://pukki.gifts` on Vercel and the API is `https://api.pukki.gifts/v1` on Fly. Production sessions use host-only, HttpOnly, Secure cookies with `SameSite=Lax`. The API allows the exact frontend origin with credentials; cookies do not need a parent-domain scope.

Cloudflare DNS records are DNS-only so Vercel and Fly terminate HTTPS directly:

| Name | Type | Value |
| --- | --- | --- |
| `pukki.gifts` | A | `216.150.1.1` |
| `pukki.gifts` | A | `216.150.16.1` |
| `api.pukki.gifts` | A | `66.241.125.137` |
| `api.pukki.gifts` | AAAA | `2a09:8280:1::1ad:e8b8:0` |

The domain is attached to Vercel project `pukki`, and Fly has an active Let's Encrypt certificate for `api.pukki.gifts`. The old `pukki.vercel.app` domain redirects to `pukki.gifts`. Cloudflare uses nameservers `brady.ns.cloudflare.com` and `teresa.ns.cloudflare.com`; the zone became active on October 9, 2026.

Cloudflare Email Routing is enabled and ready with the exact rule `support@pukki.gifts` → the verified destination `wesmoses@gmail.com`, plus MX, SPF, and DKIM records. The existing `info@wes.software` forwarding remains unchanged. `frontend/config.js` supplies the support address for Privacy and account-deletion pages. Provider configuration is verified; no test email has been sent.

Local development uses frontend port 3000, backend port 4000, and lax cookies.

## SendGrid

SendGrid domain authentication for `pukki.gifts` uses automated security, authentication ID `33403278`. All three DNS records passed SendGrid validation on October 9, 2026. It is not the account-wide default, so other projects' sending domains are unchanged. DNS records are DNS-only:

| Name | Type | Value |
| --- | --- | --- |
| `em.pukki.gifts` | CNAME | `u41498539.wl040.sendgrid.net` |
| `s1._domainkey.pukki.gifts` | CNAME | `s1.domainkey.u41498539.wl040.sendgrid.net` |
| `s2._domainkey.pukki.gifts` | CNAME | `s2.domainkey.u41498539.wl040.sendgrid.net` |

Use `Pukki <support@pukki.gifts>` as the sender when connecting reset emails. Sender identity is non-secret and belongs in code. The SendGrid return-path subdomain keeps its SPF separate from Cloudflare's root-domain email forwarding records; existing MX, SPF, DKIM, and forwarding rules stay intact.

The runtime sending key has `mail.send` permission. Password recovery uses SendGrid's mail-send API with click and open tracking disabled. `SENDGRID_API_KEY` is read only by Express. Reset links use the configured app origin, expire after 30 minutes, and are stored only as SHA-256 hashes. The public request response is generic for unknown accounts and delivery failures; delivery failures are logged without recipient or token data. Integration tests stub SendGrid and send no email.

Migration `006_password_resets.sql` adds `pukki.password_resets`. Completing a reset atomically changes the password, invalidates all reset links and existing sessions for that account, and creates a new session. Express sets the normal HttpOnly session cookie after committing. The frontend replaces the reset URL and continues to the family, first-name step, or pending invitation without asking the user to sign in again.

## Migrations and health

Fly runs `node dist/db/migrate.js` before backend rollout. Failure blocks deployment. All data and migration history stay in `pukki`; migrations use transactions and an advisory lock. Use additive changes because the previous backend can still run during migration. Never reset the shared database or modify another application's schema.

`/health` checks the HTTP process. The migration release verifies database connectivity. The pool allows two connections per process; rolling releases temporarily use multiple processes.

Manual command from the repository root: `fly deploy . --config backend/fly.toml --remote-only --ha=false`. Fly resolves the Dockerfile relative to `backend/fly.toml`; the build context remains the repository root. Prefer Actions so checks and both deployments run together.

References: [Fly Actions](https://fly.io/docs/launch/continuous-deployment-with-github-actions/), [Fly config](https://fly.io/docs/reference/configuration/), [Vercel Actions](https://vercel.com/kb/guide/how-can-i-use-github-actions-with-vercel), [Vercel Git control](https://vercel.com/docs/project-configuration/git-configuration).

## Email account rollout

Migration `005_email_accounts.sql` adds a unique, normalized email column in `pukki.users` and makes legacy usernames optional. Existing accounts, passwords, sessions, names and families are preserved. New accounts have no username and start with an empty name until onboarding completes. The API only accepts email sign-in; legacy accounts need a real email assigned explicitly before they can sign in again. Do not invent addresses or overwrite another account’s email. Existing display-only demo family members do not need login emails.

The password-reset and welcome emails live in `backend/src/emails/password-reset.ts` and `backend/src/emails/welcome.ts`. Both use `layout.ts` for consistent HTML and plain-text versions. Run `pnpm --filter pukki-backend preview:email`, then open `/email-previews/password-reset.html` or `/email-previews/welcome.html` on the local frontend. These ignored previews send no email; the reset preview uses a fake token. The preview directory is excluded from Vercel deployments. Welcome-email delivery is not connected yet, and email-client rendering still needs a real delivery test.
