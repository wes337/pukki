import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";

test("persistent sessions, legacy cookie migration and explicit logout", { skip: !process.env.TEST_POSTGRES_URL }, async (t) => {
  assert.ok(["localhost", "127.0.0.1"].includes(new URL(process.env.TEST_POSTGRES_URL).hostname), "Local test database only");
  process.env.POSTGRES_URL = process.env.TEST_POSTGRES_URL;
  process.env.NODE_ENV = "test";
  process.env.API_PROXY_SECRET = "local-test-proxy-secret-at-least-32-characters";
  const { app } = await import("#app/lib/express.js");
  const { sql } = await import("#app/lib/sql.js");
  const { createSession, startSession } = await import("#app/modules/auth.js");
  const userId = randomUUID();
  const otherId = randomUUID();
  for (const id of [userId, otherId]) {
    await sql.query("INSERT INTO pukki.users (user_id, email, name, password_hash) VALUES ($1, $2, 'Session test', 'unused')", [id, `${id}@example.com`]);
  }
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    await sql.query("DELETE FROM pukki.users WHERE user_id = ANY($1::uuid[])", [[userId, otherId]]);
    await sql.end();
  });
  const base = `http://127.0.0.1:${server.address().port}/v1/auth`;
  const digest = token => createHash("sha256").update(token).digest("hex");
  const cookie = token => `pukki_session=${token}`;
  const call = (action, { token, cookie: rawCookie, proxy = false, method = "GET", origin = "http://localhost:3000" } = {}) => fetch(action.startsWith("/") ? `${base.slice(0, -5)}${action}` : `${base}/${action}`, {
    method,
    headers: {
      Origin: origin, "Content-Type": "application/json",
      ...((rawCookie || token) ? { Cookie: rawCookie || cookie(token) } : {}),
      ...(proxy ? { "x-pukki-proxy-secret": process.env.API_PROXY_SECRET } : {}),
    },
    ...(method === "POST" ? { body: "{}" } : {}),
  });

  await t.test("migration preserves active sessions and leaves expired sessions invalid", async () => {
    const active = randomBytes(32).toString("hex");
    const expired = randomBytes(32).toString("hex");
    await sql.query("INSERT INTO pukki.sessions VALUES ($1, $3, now() + interval '1 day'), ($2, $3, now() - interval '1 day')", [digest(active), digest(expired), userId]);
    await sql.query(await readFile(new URL("../db/migrations/007_persistent_sessions.sql", import.meta.url), "utf8"));
    const { rows } = await sql.query("SELECT token_hash, expires_at::text AS expiry FROM pukki.sessions WHERE token_hash = ANY($1::text[])", [[digest(active), digest(expired)]]);
    assert.equal(rows.find(row => row.token_hash === digest(active)).expiry, "infinity");
    assert.notEqual(rows.find(row => row.token_hash === digest(expired)).expiry, "infinity");
    assert.equal(await (await call("session", { token: expired })).json(), null);
    assert.equal((await (await call("session", { token: active })).json()).user.id, userId);
  });

  const token = await createSession(userId);
  await t.test("new sessions do not expire and valid reads renew a persistent host-only cookie", async () => {
    const { rows } = await sql.query("SELECT expires_at::text AS expiry FROM pukki.sessions WHERE token_hash = $1", [digest(token)]);
    assert.equal(rows[0].expiry, "infinity");
    const response = await call("session", { token, proxy: true });
    assert.deepEqual(Object.keys((await response.json()).user).sort(), ["avatar_url", "family_id", "family_name", "id", "name"]);
    const header = response.headers.getSetCookie().find(value => value.startsWith("pukki_session="));
    assert.match(header, /Max-Age=34560000/);
    assert.match(header, /HttpOnly/);
    assert.match(header, /SameSite=Lax/);
    assert.doesNotMatch(header, /Domain=/);
    assert.ok(response.headers.getSetCookie().some(value => value.startsWith("pukki_session_migrated=1;")));
    const data = await call("/profile/avatar", { token, proxy: true });
    assert.equal(data.status, 200);
    assert.equal(data.headers.has("set-cookie"), false, "Ordinary data reads cannot overwrite a later login cookie");
    // An old process can still issue a finite session while the release rolls out.
    await sql.query("UPDATE pukki.sessions SET expires_at = now() + interval '1 day' WHERE token_hash = $1", [digest(token)]);
    await call("session", { token });
    assert.equal((await sql.query("SELECT expires_at::text AS expiry FROM pukki.sessions WHERE token_hash = $1", [digest(token)])).rows[0].expiry, "infinity");
  });

  await t.test("legacy migration uses an HttpOnly bridge and preserves the same session", async () => {
    const response = await call("migrate-session", { token, method: "POST" });
    assert.deepEqual(await response.json(), { ok: true });
    const bridge = response.headers.getSetCookie().find(value => value.startsWith("pukki_session_bridge="));
    assert.match(bridge, /Max-Age=60/);
    assert.match(bridge, /Path=\/v1/);
    assert.match(bridge, /HttpOnly/);
    assert.equal(response.headers.getSetCookie().some(value => value.startsWith("pukki_session=")), false, "Do not discard the old cookie before adoption succeeds");
    const bridgeValue = bridge.split(";")[0];
    const migrated = await call("session", { cookie: bridgeValue, proxy: true });
    assert.equal((await migrated.json()).user.id, userId);
    assert.ok(migrated.headers.getSetCookie().some(value => value.startsWith(`${cookie(token)};`)));
    assert.ok(migrated.headers.getSetCookie().some(value => /^pukki_session_bridge=;.*Max-Age=0/.test(value)));
    assert.equal(await (await call("session", { cookie: bridgeValue })).json(), null, "Untrusted direct requests cannot use bridge cookies");
    assert.equal((await call("migrate-session", { token, method: "POST", proxy: true })).status, 400);
    assert.equal((await call("migrate-session", { token, method: "POST", origin: "https://elsewhere.invalid" })).status, 403);
    assert.equal((await call("migrate-session", { token })).status, 405);
    assert.deepEqual(await (await call("migrate-session", { method: "POST" })).json(), { ok: false });
  });

  await t.test("a delayed legacy bridge cannot replace a newer host-only login", async () => {
    const newer = await createSession(otherId);
    const response = await call("session", { cookie: `${cookie(newer)}; pukki_session_bridge=${token}`, proxy: true });
    assert.equal((await response.json()).user.id, otherId);
    const signedOut = await call("session", { cookie: `pukki_session_bridge=${token}; pukki_session_migrated=1`, proxy: true });
    assert.equal(await signedOut.json(), null, "A late bridge cannot undo an explicit sign-out");
  });

  await t.test("logout revokes the session, including its bridge, while other devices stay signed in", async () => {
    const otherDevice = await createSession(userId);
    const response = await call("logout", { token, method: "POST", proxy: true });
    assert.equal(response.status, 200);
    assert.ok(response.headers.getSetCookie().filter(value => !value.startsWith("pukki_session_migrated=")).every(value => /Max-Age=0/.test(value)));
    assert.ok(response.headers.getSetCookie().some(value => value.startsWith("pukki_session_migrated=1;")));
    assert.equal(await (await call("session", { token })).json(), null);
    assert.equal(await (await call("session", { cookie: `pukki_session_bridge=${token}`, proxy: true })).json(), null);
    assert.deepEqual(await (await call("migrate-session", { token, method: "POST" })).json(), { ok: false });
    assert.equal((await (await call("session", { token: otherDevice })).json()).user.id, userId);
  });

  await t.test("a password verified before a reset cannot create a session afterward", async () => {
    const before = await sql.query("SELECT count(*) FROM pukki.sessions WHERE user_id = $1", [userId]);
    await sql.query("UPDATE pukki.users SET password_hash = 'changed-by-reset' WHERE user_id = $1", [userId]);
    let wroteCookie = false;
    await assert.rejects(startSession({ headers: {} }, { setHeader() { wroteCookie = true; } }, userId, "unused"), error => error.status === 401);
    assert.equal(wroteCookie, false);
    assert.equal((await sql.query("SELECT count(*) FROM pukki.sessions WHERE user_id = $1", [userId])).rows[0].count, before.rows[0].count);
  });
});
