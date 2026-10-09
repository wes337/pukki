# Pukki

A Christmas gift wishlist for small groups of family and friends. Made to help organize who's buying what for who.

[See it live here](https://pukki.gifts/).

![Screenshot](/screenshot.png)

## More info

A pnpm monorepo with a Next.js frontend in `frontend/` and a TypeScript Express API in `backend/`, backed by Postgres. All data requests go from the browser to Express under `/v1`. The frontend has no API handlers or database credentials. Accounts use a username and password, with immediate signup and no email confirmation. This version starts fresh; it does not import the old Supabase accounts or wishlists.

## Local setup

1. Use Node.js 22.13 or newer and pnpm 10.33.2. Run `pnpm install` from the repository root.
2. Copy `backend/.env.example` to `backend/.env`, then set `POSTGRES_URL`. Non-secret settings live in `backend/src/constants/config.ts`.
3. The frontend needs no env file. API URLs live in `frontend/config.js`.
4. Run `pnpm db:migrate` explicitly when setting up a database, then `pnpm dev` to start both apps.

Use `pnpm dev:frontend` or `pnpm dev:backend` to run either separately. Express uses port 4000 by default; Next uses port 3000. The previous root environment file has moved to `backend/.env`.

See [the sitemap](docs/SITEMAP.md) for stable screen names, routes, variants, and navigation flows.

The backend requires only the `POSTGRES_URL` secret. Redis and token/cookie secrets are not needed. Sessions are opaque random tokens stored as hashes in Postgres, with HTTP-only cookies and a 14-day expiry. Signing out revokes the session. Passwords use salted scrypt hashes. Usernames are case-insensitive, and passwords must contain 12–128 characters. There is no password-recovery flow yet.

## Shared database

All application tables, indexes and migration history live in the **`pukki` schema**. SQL queries explicitly qualify table names. Migrations run in a transaction, do not change the database search path, and do not create or modify tables in `public` or other applications' schemas. The migration command is explicit; starting or building the app never migrates a database.

The connection pool allows two connections per app process. DigitalOcean connections verify TLS using the public cluster CA in `backend/certificates/postgres-ca.crt`. Include that file when deploying, and replace it if the cluster CA changes. The DigitalOcean API token was used to retrieve the CA and is not needed by the running app.

For database-enforced isolation, provision a dedicated login role with access only to `pukki` and use it in `POSTGRES_URL`. A schema separates names; a shared privileged credential can still access other schemas. The migration role needs permission to create the schema or ownership of a pre-created `pukki` schema. Existing conflicting tables cause the migration to fail and roll back; it never drops tables or resets data.

Each account can belong to one family. After signup, create a family or join immediately with its six-character code. The family invitation page shows the same invitation as a QR code and a copyable link. QR invitations preserve the code through signup/login. The `appOrigin` constant must match the public frontend origin so other phones can open invitations.

Only members of the same family can browse one another's profiles, wishlists and gifts. Owners can edit or delete their gifts; only the claimant can release a claim. Claims are hidden from gift recipients. Signup is open, and anyone with a family code can join that family. Code guessing is limited to ten attempts per account per fifteen minutes. Accounts cannot switch families through the API; leaving, removing members and transferring ownership are not implemented yet.

The family migration adds nullable membership for existing accounts without deleting users or gifts. Existing accounts are prompted to create or join a family. No default shared family is created.

## Checks

`pnpm test` checks password hashing and auth rate-limit middleware. To run the HTTP/database integration suite, migrate a disposable local database, then set `TEST_POSTGRES_URL` and run `pnpm test`. The suite refuses remote databases and starts its own temporary Express listener on loopback. It overrides the database connection before loading server modules, and never uses the production connection for tests. `pnpm lint` type-checks the backend and lints the frontend; `pnpm build` builds both apps.

### Auth rate limits

Auth POST requests use Battlechat's separate IP and identity budgets, stored in `pukki.auth_rate_limits` so restarts and multiple backend processes share the same allowance. Limits apply locally too, before credential validation or password hashing. Successful requests do not reset them.

| Action | Per IP | Per identity | Window |
| --- | --- | --- | --- |
| Sign in | 15 | 10 per username | 15 minutes |
| Sign up | 5 | 3 per username | 1 hour |
| Request password reset | 10 | 3 per email | 15 minutes |
| Reset password | 10 | 5 per token | 15 minutes |

Usernames and emails are trimmed and lowercased; tokens stay case-sensitive. Counter keys contain hashes rather than raw identifiers. Blocked requests return `429` with the remaining window in `Retry-After`. A counter-store failure returns `503`; session reads and logout remain available. Expired counters are pruned in bounded batches during auth traffic. The old `login_attempts` table is retained for compatibility with the previous backend during rollout.

The recovery middleware already covers `/v1/auth/request-password-reset`, its `/v1/auth/forgot-password` alias, and `/v1/auth/reset-password`. Their email/token handlers are still pending, so allowed requests currently return `404`.

The backend uses Fly's `Fly-Client-IP` header only when running as the `pukki` Fly app, and groups IPv6 clients by /56. Local requests use the socket address and ignore forwarded headers. Keep `api.pukki.gifts` DNS-only in Cloudflare; enabling its proxy requires updating trusted client-IP resolution first.

## Deployment

Production uses Vercel for the frontend and Fly for the Express backend. There is no staging environment. Pushes to `master` run checks against a disposable Postgres database, then deploy both apps through GitHub Actions. Fly runs migrations before backend rollout; they remain confined to the `pukki` schema.

See [deployment setup](docs/DEPLOYMENT.md) for the hosting settings, GitHub secrets and checked-in configuration, production domains, and failure behavior. The existing Vercel project must use `frontend` as its Root Directory and Node.js 22. Its automatic Git builds are disabled by `frontend/vercel.json`, so the workflow controls deployments and no previews are created.

The frontend uses Next.js 16, React 19, and Serwist for PWA assets. Development and builds use Webpack for the service-worker integration. API responses are not cached. ESLint 9 and frontend TypeScript 6 remain on the newest versions supported by the current Next lint plugins; backend TypeScript uses version 7. Node types match the deployed Node 22 runtime.

The full dependency audit currently reports one unpatched development-only `braces` advisory through Next's ESLint plugin. It is not part of the production runtime. Recheck it when updating `eslint-config-next`.

This app is also a PWA, and can be saved for use as a standalone application.

## What's with the name?

Joulupukki = Santa Claus in Finnish. It translates directly to _"Christmas Goat"_. Pukki just means goat.

## To do

- ~~Remove SSR, it doesn't feel like a very nice experience with this type of app~~
- Allow multiple people to claim a gift for a person (i.e. they split it)
- ~~Translate to Finnish~~
