import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { PNG } from "pngjs";
import decodeQR from "jsqr";

// Integration tests run only against an explicitly supplied local test server/database.
test("accounts, authorization, atomic claims and schema isolation", {
  skip: !process.env.TEST_POSTGRES_URL,
}, async (t) => {
  const origin = "http://localhost:3000";
  for (const url of [origin, process.env.TEST_POSTGRES_URL]) {
    assert.ok(["localhost", "127.0.0.1"].includes(new URL(url).hostname), "Local test services only");
  }
  // Override before loading app modules, so this suite can never use backend/.env's database.
  process.env.POSTGRES_URL = process.env.TEST_POSTGRES_URL;
  process.env.NODE_ENV = "test";
  process.env.SENDGRID_API_KEY = "test-only-not-a-real-key";
  const originalFetch = globalThis.fetch;
  const welcomeMessages = [];
  let welcomeStatus = 202;
  t.mock.method(globalThis, "fetch", (url, options) => {
    if (url === "https://api.sendgrid.com/v3/mail/send") {
      welcomeMessages.push(JSON.parse(options.body));
      return Promise.resolve(new Response(null, { status: welcomeStatus }));
    }
    return originalFetch(url, options);
  });
  const { app } = await import("#app/lib/express.js");
  const { sql } = await import("#app/lib/sql.js");
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const apiUrl = `http://127.0.0.1:${server.address().port}/v1`;
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await sql.end();
  });
  const db = new Pool({ connectionString: process.env.TEST_POSTGRES_URL });
  await db.query("DELETE FROM pukki.auth_rate_limits");
  const suffix = randomUUID().replaceAll("-", "").slice(0, 10);
  const password = "six123";
  async function call(path, { cookie, body, method = "GET", requestOrigin = origin } = {}) {
    return fetch(`${apiUrl}${path}`, {
      method, headers: { "Content-Type": "application/json", Origin: requestOrigin, ...(cookie ? { Cookie: cookie } : {}) },
      ...(method !== "GET" ? { body: JSON.stringify(body ?? {}) } : {}),
    });
  }
  async function signup(label) {
    const email = `${label}_${suffix}@example.com`;
    const result = await call("/auth/signup", { method: "POST", body: { email: ` ${email.toUpperCase()} `, password } });
    assert.equal(result.status, 201, await result.text());
    const header = result.headers.get("set-cookie");
    assert.match(header, /HttpOnly/);
    assert.match(header, /SameSite=Lax/);
    const cookie = header.split(";")[0];
    const session = await (await call("/auth/session", { cookie })).json();
    assert.equal(session.user.email, email);
    assert.equal(session.user.name, "");
    if (label === "owner") {
      assert.equal((await call("/family", { method: "POST", cookie, body: { name: "Before name" } })).status, 403);
      assert.equal((await call("/family/join", { method: "POST", cookie, body: { code: "ABC234" } })).status, 403);
      for (const invalid of ["   ", "x".repeat(81)]) {
        assert.equal((await call("/profile/name", { method: "PATCH", cookie, body: { name: invalid } })).status, 400);
      }
    }
    const named = await call("/profile/name", { method: "PATCH", cookie, body: { name: ` ${label} ` } });
    assert.equal(named.status, 200);
    assert.equal((await named.json()).name, label);
    assert.equal((await (await call("/auth/session", { cookie })).json()).user.name, label);
    return { cookie, id: session.user.id, email };
  }
  const owner = await signup("owner");
  const buyer = await signup("buyer");
  const other = await signup("other");
  const outsider = await signup("outsider");
  const unassigned = await signup("unassigned");
  const accounts = [owner, buyer, other, outsider, unassigned];
  assert.equal(welcomeMessages.length, accounts.length);
  for (const [index, message] of welcomeMessages.entries()) {
    assert.equal(message.subject, "Welcome to Pukki!");
    assert.equal(message.personalizations[0].to[0].email, accounts[index].email);
    assert.equal(message.from.email, "support@pukki.gifts");
    assert.deepEqual(message.content.map(part => part.type), ["text/plain", "text/html"]);
    assert.equal(message.tracking_settings.click_tracking.enable, false);
  }
  // Fixture signup deliberately exhausts the shared IP budget.
  assert.equal((await call("/auth/signup", { method: "POST", body: { email: `extra_${suffix}@example.com`, password } })).status, 429);
  await db.query("DELETE FROM pukki.auth_rate_limits WHERE key LIKE 'signup:%'");
  t.after(async () => {
    const ids = accounts.map((account) => account.id);
    await db.query('DELETE FROM pukki.gifts WHERE "user" = ANY($1::uuid[])', [ids]);
    await db.query("UPDATE pukki.users SET family_id = NULL WHERE user_id = ANY($1::uuid[])", [ids]);
    await db.query("DELETE FROM pukki.families WHERE created_by = ANY($1::uuid[])", [ids]);
    await db.query("DELETE FROM pukki.users WHERE user_id = ANY($1::uuid[])", [ids]);
    await db.end();
  });
  await t.test("anonymous and cross-origin requests are rejected", async () => {
    assert.equal((await call("/gifts")).status, 401);
    assert.equal((await call("/profile/name", { method: "PATCH", body: { name: "Someone" } })).status, 401);
    assert.equal((await call("/auth/login", { method: "POST", requestOrigin: "https://elsewhere.invalid", body: { email: owner.email, password } })).status, 403);
  });
  await t.test("Express supports credentialed preflights and rejects malformed writes", async () => {
    const preflight = await fetch(`${apiUrl}/gifts`, { method: "OPTIONS", headers: {
      Origin: origin, "Access-Control-Request-Method": "PATCH", "Access-Control-Request-Headers": "content-type",
    } });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get("access-control-allow-origin"), origin);
    assert.equal(preflight.headers.get("access-control-allow-credentials"), "true");
    assert.equal((await fetch(`${apiUrl}/auth/session`, { headers: { Origin: "https://elsewhere.invalid" } })).status, 403);
    for (const [body, contentType, status] of [["{", "application/json", 400], ["{}", "text/plain", 403], [JSON.stringify({ value: "x".repeat(17000) }), "application/json", 413]]) {
      const response = await fetch(`${apiUrl}/auth/login`, { method: "POST", headers: { Origin: origin, "Content-Type": contentType }, body });
      assert.equal(response.status, status);
      assert.equal(typeof (await response.json()).error, "string");
    }
    const missing = await call("/missing");
    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).error, "Not found");
  });
  await t.test("signup is case-insensitive; bad passwords fail; valid login succeeds", async () => {
    const messagesBefore = welcomeMessages.length;
    for (const [invalidPassword, message] of [["12345", "Password must be at least 6 characters."], ["x".repeat(129), "Password is too long."]]) {
      const response = await call("/auth/signup", { method: "POST", body: { email: `length_${suffix}@example.com`, password: invalidPassword } });
      assert.equal(response.status, 400);
      assert.equal((await response.json()).error, message);
    }
    assert.equal((await call("/auth/signup", { method: "POST", body: { email: owner.email.toUpperCase(), password } })).status, 409);
    assert.equal((await call("/auth/login", { method: "POST", body: { email: owner.email, password: "incorrect password" } })).status, 401);
    assert.equal((await call("/auth/login", { method: "POST", body: { email: owner.email.toUpperCase(), password } })).status, 200);
    const { authLimitKey } = await import("#app/lib/auth-rate-limit.js");
    const { rows } = await db.query("SELECT attempts FROM pukki.auth_rate_limits WHERE key = $1", [authLimitKey("login", "email", owner.email)]);
    assert.equal(rows[0].attempts, 2, "Successful login does not clear the shared budget");
    assert.equal(welcomeMessages.length, messagesBefore, "Invalid signup, duplicate signup and login never resend the welcome email");
  });
  await t.test("welcome email failure does not block signup or the new session", async () => {
    await db.query("DELETE FROM pukki.auth_rate_limits WHERE key LIKE 'signup:%'");
    welcomeStatus = 503;
    const messagesBefore = welcomeMessages.length;
    try {
      accounts.push(await signup("mailfailure"));
      assert.equal(welcomeMessages.length, messagesBefore + 1);
    } finally {
      welcomeStatus = 202;
    }
  });
  let family;
  await t.test("unassigned accounts cannot browse; creator joins their new family", async () => {
    assert.equal((await call("/users", { cookie: owner.cookie })).status, 403);
    assert.equal((await call("/gifts", { cookie: owner.cookie })).status, 403);
    const created = await call("/family", { cookie: owner.cookie, method: "POST", body: { name: "Christmas crew" } });
    assert.equal(created.status, 201, await created.clone().text());
    family = await created.json();
    assert.match(family.code, /^[A-HJ-NP-Z2-9]{6}$/);
    const session = await (await call("/auth/session", { cookie: owner.cookie })).json();
    assert.equal(session.user.family_id, family.id);
    assert.equal((await call("/family", { cookie: owner.cookie, method: "POST", body: { name: "Second family" } })).status, 409);
  });
  await t.test("invitation preview works before signup and never joins or reveals members", async () => {
    const path = `/family/invitation?code=${family.code.toLowerCase()}`;
    const anonymous = await call(path);
    assert.equal(anonymous.status, 200);
    assert.deepEqual(await anonymous.json(), { id: family.id, name: family.name });
    const response = await call(path, { cookie: buyer.cookie });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { id: family.id, name: family.name });
    const session = await (await call("/auth/session", { cookie: buyer.cookie })).json();
    assert.equal(session.user.family_id, null, "Preview must not accept the invitation");
    assert.equal((await call("/users", { cookie: buyer.cookie })).status, 403);
    assert.equal((await call("/family/invitation", { cookie: buyer.cookie })).status, 400);
    assert.equal((await call("/family/invitation?code=AAAAAAAA", { cookie: buyer.cookie })).status, 404);
    assert.equal((await call(path, { cookie: buyer.cookie, method: "POST" })).status, 405);
  });
  await t.test("anonymous invitation guesses are limited by IP", async () => {
    // The preceding preview used one of this IP's twenty attempts.
    for (let i = 0; i < 19; i++) {
      assert.equal((await call("/family/invitation?code=AAAAAAAA")).status, 404);
    }
    const blocked = await call(`/family/invitation?code=${family.code}`);
    assert.equal(blocked.status, 429);
    assert.ok(Number(blocked.headers.get("retry-after")) > 0);
    assert.equal((await call("/users")).status, 401);
  });
  await t.test("codes accept lowercase and separators; members receive the same QR invite", async () => {
    const formatted = `${family.code.slice(0, 3)}-${family.code.slice(3)}`.toLowerCase();
    for (const person of [buyer, other]) {
      const joined = await call("/family/join", { cookie: person.cookie, method: "POST", body: { code: formatted } });
      assert.equal(joined.status, 200, await joined.clone().text());
      assert.equal((await joined.json()).id, family.id);
    }
    const invitation = await (await call("/family", { cookie: buyer.cookie })).json();
    assert.equal(invitation.joinUrl, `${origin}/join?code=${family.code}`);
    assert.match(invitation.qr, /^data:image\/png;base64,/);
    const png = PNG.sync.read(Buffer.from(invitation.qr.split(",")[1], "base64"));
    const decoded = decodeQR(new Uint8ClampedArray(png.data), png.width, png.height);
    assert.equal(decoded?.data, invitation.joinUrl, "QR image decodes to the exact invitation URL");

  });
  await t.test("one account cannot join or create two families under concurrent requests", async () => {
    const results = await Promise.all([
      call("/family", { cookie: outsider.cookie, method: "POST", body: { name: "Another family" } }),
      call("/family", { cookie: outsider.cookie, method: "POST", body: { name: "Duplicate family" } }),
    ]);
    assert.deepEqual(results.map((r) => r.status).sort(), [201, 409]);
    assert.equal((await call("/family/join", { cookie: outsider.cookie, method: "POST", body: { code: family.code } })).status, 409);
    const { rows } = await db.query("SELECT count(*) FROM pukki.families WHERE created_by = $1", [outsider.id]);
    assert.equal(rows[0].count, "1");
    const preview = await call(`/family/invitation?code=${family.code}`, { cookie: outsider.cookie });
    assert.deepEqual(await preview.json(), { id: family.id, name: family.name });
    const session = await (await call("/auth/session", { cookie: outsider.cookie })).json();
    assert.notEqual(session.user.family_id, family.id, "Preview cannot move an existing member");
  });
  await t.test("invitation lookups have a shared guess limit", async () => {
    for (let i = 0; i < 20; i++) {
      assert.equal((await call("/family/invitation?code=AAAAAAAA", { cookie: unassigned.cookie })).status, 404);
    }
    const response = await call(`/family/invitation?code=${family.code}`, { cookie: unassigned.cookie });
    assert.equal(response.status, 429);
    assert.ok(Number(response.headers.get("retry-after")) > 0);
  });
  const giftBody = { user: owner.id, name: "A book", description: "Paperback", url: "" };
  const created = await call("/gifts", { cookie: owner.cookie, method: "POST", body: giftBody });
  assert.equal(created.status, 201, await created.clone().text());
  const gift = await created.json();
  await t.test("other families cannot read users, gifts, shopping lists or change claims", async () => {
    const users = await (await call("/users", { cookie: outsider.cookie })).json();
    assert.deepEqual(users.map((user) => user.user_id), [outsider.id]);
    assert.deepEqual(await (await call("/gifts", { cookie: outsider.cookie })).json(), []);
    assert.equal((await call(`/users/${owner.id}`, { cookie: outsider.cookie })).status, 404);
    assert.deepEqual(await (await call(`/users/${owner.id}/gifts`, { cookie: outsider.cookie })).json(), []);
    assert.equal((await call(`/gifts/${gift.id}`, { cookie: outsider.cookie })).status, 404);
    assert.equal((await call(`/users/${owner.id}/claimed`, { cookie: outsider.cookie })).status, 403);
    for (const claim of [true, false]) {
      assert.equal((await call(`/gifts/${gift.id}`, { cookie: outsider.cookie, method: "PATCH", body: { claim } })).status, 409);
    }
    assert.equal((await call("/gifts", { cookie: outsider.cookie, method: "POST", body: { ...giftBody, id: gift.id, user: outsider.id } })).status, 403);
    assert.equal((await call(`/gifts/${gift.id}`, { cookie: outsider.cookie, method: "DELETE" })).status, 403);
  });
  await t.test("invalid family codes do not assign membership and guesses are limited", async () => {
    const validLooking = "AAAAAAAA";
    assert.equal((await call("/family/join", { cookie: unassigned.cookie, method: "POST", body: { code: "bad" } })).status, 400);
    for (let i = 0; i < 9; i++) {
      assert.equal((await call("/family/join", { cookie: unassigned.cookie, method: "POST", body: { code: validLooking } })).status, 404);
    }
    assert.equal((await call("/family/join", { cookie: unassigned.cookie, method: "POST", body: { code: family.code } })).status, 429);
    const session = await (await call("/auth/session", { cookie: unassigned.cookie })).json();
    assert.equal(session.user.family_id, null);
  });
  await t.test("another account cannot edit, delete or transfer a gift", async () => {
    assert.equal((await call("/gifts", { cookie: buyer.cookie, method: "POST", body: { ...giftBody, id: gift.id, user: buyer.id } })).status, 403);
    assert.equal((await call(`/gifts/${gift.id}`, { cookie: buyer.cookie, method: "DELETE" })).status, 403);
    assert.equal((await call(`/users/${owner.id}`, { cookie: buyer.cookie, method: "POST", body: { name: "Changed" } })).status, 405);
  });
  await t.test("exactly one concurrent claimant wins and recipients cannot see the claimant", async () => {
    const results = await Promise.all([buyer, other].map((person) => call(`/gifts/${gift.id}`, { cookie: person.cookie, method: "PATCH", body: { claim: true, claimed_by: owner.id } })));
    assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
    const winner = results[0].status === 200 ? buyer : other;
    const loser = winner === buyer ? other : buyer;
    const ownGift = await (await call(`/gifts/${gift.id}`, { cookie: owner.cookie })).json();
    assert.equal(ownGift.claimed_by, null);
    const claimedGift = await (await call(`/gifts/${gift.id}`, { cookie: winner.cookie })).json();
    assert.equal(claimedGift.claimed_by.user_id, winner.id);
    assert.equal((await call(`/gifts/${gift.id}`, { cookie: loser.cookie, method: "PATCH", body: { claim: false } })).status, 409);
    assert.equal((await call(`/users/${winner.id}/claimed`, { cookie: loser.cookie })).status, 403);
    assert.equal((await call(`/gifts/${gift.id}`, { cookie: winner.cookie, method: "PATCH", body: { claim: false } })).status, 200);
    assert.equal((await call(`/gifts/${gift.id}`, { cookie: owner.cookie, method: "PATCH", body: { claim: true } })).status, 409);
  });
  await t.test("login attempts are limited", async () => {
    for (let i = 0; i < 10; i++) {
      assert.equal((await call("/auth/login", { method: "POST", body: { email: other.email, password: "incorrect password" } })).status, 401);
    }
    assert.equal((await call("/auth/login", { method: "POST", body: { email: other.email, password } })).status, 429);
  });
  await t.test("IP budgets limit rotating emails before validation", async () => {
    await db.query("DELETE FROM pukki.auth_rate_limits WHERE key LIKE 'login:%'");
    for (let i = 0; i < 15; i++) {
      assert.equal((await call("/auth/login", { method: "POST", body: { email: `rotating_${i}@example.com` } })).status, 400);
    }
    const response = await call("/auth/login", { method: "POST", body: { email: owner.email, password } });
    assert.equal(response.status, 429);
    assert.ok(Number(response.headers.get("retry-after")) > 0);
  });
  await t.test("recovery request aliases share the same rate limit", async () => {
    for (let i = 0; i < 3; i++) {
      assert.equal((await call("/auth/request-password-reset", { method: "POST", body: { email: " Test@example.com " } })).status, 200);
    }
    assert.equal((await call("/auth/forgot-password", { method: "POST", body: { email: "test@example.com" } })).status, 429);
  });
  await t.test("shared counters enforce concurrent limits and expire without extending a blocked window", async () => {
    const { consumeAuthLimit, authLimitKey } = await import("#app/lib/auth-rate-limit.js");
    const key = authLimitKey("test", "email", suffix);
    const results = await Promise.all(Array.from({ length: 20 }, () => consumeAuthLimit(key, 5, 900)));
    assert.equal(results.filter((result) => result.allowed).length, 5);
    await db.query("UPDATE pukki.auth_rate_limits SET expires_at = now() + interval '40 seconds' WHERE key = $1", [key]);
    const blocked = await consumeAuthLimit(key, 5, 900);
    assert.equal(blocked.allowed, false);
    assert.ok(blocked.retryAfter <= 40 && blocked.retryAfter > 0);
    await db.query("UPDATE pukki.auth_rate_limits SET expires_at = now() - interval '1 second' WHERE key = $1", [key]);
    assert.equal((await consumeAuthLimit(key, 5, 900)).allowed, true);
    await db.query("DELETE FROM pukki.auth_rate_limits WHERE key = $1", [key]);
  });
  await t.test("logout revokes the session", async () => {
    assert.equal((await call("/auth/logout", { cookie: owner.cookie, method: "POST" })).status, 200);
    assert.equal(await (await call("/auth/session", { cookie: owner.cookie })).json(), null);
    assert.equal((await call("/gifts", { cookie: owner.cookie })).status, 401);
  });
  await t.test("application tables are all inside pukki", async () => {
    const { rows } = await db.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema') ORDER BY table_name");
    assert.deepEqual(rows.map((row) => [row.table_schema, row.table_name]), [
      ["pukki", "auth_rate_limits"],
      ["pukki", "families"], ["pukki", "family_join_attempts"],
      ["pukki", "gifts"], ["pukki", "login_attempts"], ["pukki", "migrations"], ["pukki", "password_resets"], ["pukki", "sessions"], ["pukki", "users"],
    ]);
  });
});
