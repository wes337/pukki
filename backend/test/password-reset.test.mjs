import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash, randomBytes, randomUUID } from "node:crypto";

test("password reset signs in immediately and consumes links atomically", { skip: !process.env.TEST_POSTGRES_URL }, async (t) => {
  assert.ok(["localhost", "127.0.0.1"].includes(new URL(process.env.TEST_POSTGRES_URL).hostname));
  process.env.POSTGRES_URL = process.env.TEST_POSTGRES_URL;
  process.env.NODE_ENV = "test";
  process.env.SENDGRID_API_KEY = "test-only-not-a-real-key";
  const { app } = await import("#app/lib/express.js");
  const { sql } = await import("#app/lib/sql.js");
  const { hashPassword, verifyPassword } = await import("#app/modules/passwords.js");
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  const originalFetch = globalThis.fetch;
  const emails = [];
  // No test message ever reaches SendGrid.
  t.mock.method(globalThis, "fetch", (url, options) => {
    if (url === "https://api.sendgrid.com/v3/mail/send") {
      emails.push(JSON.parse(options.body));
      return Promise.resolve(new Response(null, { status: 202 }));
    }
    return originalFetch(url, options);
  });
  const userId = randomUUID();
  const email = `reset-${userId}@example.com`;
  await sql.query("INSERT INTO pukki.users (user_id, email, name, password_hash) VALUES ($1, $2, 'Reset', $3)", [userId, email, await hashPassword("old123")]);
  await sql.query("DELETE FROM pukki.auth_rate_limits");
  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    await sql.query("DELETE FROM pukki.users WHERE user_id = $1", [userId]);
    await sql.end();
  });
  const base = `http://127.0.0.1:${server.address().port}/v1/auth`;
  const call = (action, body, cookie) => fetch(`${base}/${action}`, {
    method: body ? "POST" : "GET",
    headers: { Origin: "http://localhost:3000", "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const login = await call("login", { email, password: "old123" });
  assert.equal(login.status, 200);
  const oldCookie = login.headers.get("set-cookie").split(";")[0];
  const sent = await call("request-password-reset", { email: email.toUpperCase(), code: "ABC234" });
  assert.equal(sent.status, 200);
  assert.deepEqual(await sent.json(), { ok: true });
  const unknown = await call("request-password-reset", { email: "missing@example.com" });
  assert.equal(unknown.status, 200);
  assert.deepEqual(await unknown.json(), { ok: true });
  assert.equal(emails.length, 1);
  const resetUrl = new URL(emails[0].content[0].value.match(/https?:\/\/\S+/)[0]);
  assert.equal(resetUrl.origin, "http://localhost:3000");
  assert.equal(resetUrl.searchParams.get("code"), "ABC234");
  const token = resetUrl.searchParams.get("token");
  assert.match(token, /^[a-f0-9]{64}$/);
  const digest = token => createHash("sha256").update(token).digest("hex");
  const stored = await sql.query("SELECT token_hash FROM pukki.password_resets WHERE user_id = $1", [userId]);
  assert.equal(stored.rows[0].token_hash, digest(token));
  const sibling = randomBytes(32).toString("hex");
  await sql.query("INSERT INTO pukki.password_resets VALUES ($1, $2, now() + interval '30 minutes')", [digest(sibling), userId]);
  assert.equal((await call("reset-password", { token, password: "12345" })).status, 400);
  const results = await Promise.all([1, 2].map(() => call("reset-password", { token, password: "new123" })));
  assert.deepEqual(results.map(r => r.status).sort(), [200, 400]);
  const success = results.find(r => r.status === 200);
  const cookieHeader = success.headers.get("set-cookie");
  assert.match(cookieHeader, /HttpOnly/);
  assert.match(cookieHeader, /SameSite=Lax/);
  const newCookie = cookieHeader.split(";")[0];
  assert.notEqual(newCookie, oldCookie);
  assert.equal((await (await call("session", undefined, newCookie)).json()).user.id, userId);
  assert.equal(await (await call("session", undefined, oldCookie)).json(), null);
  assert.equal((await call("reset-password", { token, password: "bad123" })).status, 400);
  assert.equal((await call("reset-password", { token: sibling, password: "bad123" })).status, 400);
  assert.equal((await call("login", { email, password: "old123" })).status, 401);
  assert.equal((await call("login", { email, password: "new123" })).status, 200);
  const expired = randomBytes(32).toString("hex");
  await sql.query("INSERT INTO pukki.password_resets VALUES ($1, $2, now() - interval '1 second')", [digest(expired), userId]);
  assert.equal((await call("reset-password", { token: expired, password: "bad123" })).status, 400);
  const current = await sql.query("SELECT password_hash FROM pukki.users WHERE user_id = $1", [userId]);
  assert.equal(await verifyPassword("new123", current.rows[0].password_hash), true);
});
