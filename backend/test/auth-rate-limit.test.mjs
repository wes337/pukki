import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";

// Unit tests never connect to the configured application database.
process.env.POSTGRES_URL = "postgres://unused:unused@127.0.0.1:1/unused";
const { createAuthRateLimiter } = await import("#app/middlewares/auth-rate-limit.js");
const { clientIpKey, authLimitKey } = await import("#app/lib/auth-rate-limit.js");

test("client IP keys ignore untrusted headers and group IPv6 addresses", () => {
  const request = {
    headers: { "fly-client-ip": "203.0.113.7", "x-forwarded-for": "192.0.2.9", "cf-connecting-ip": "192.0.2.9" },
    socket: { remoteAddress: "127.0.0.1" },
  };
  assert.equal(clientIpKey(request, false), "127.0.0.1");
  assert.equal(clientIpKey(request, true), "203.0.113.7");
  request.headers["fly-client-ip"] = "203.0.113.7, 192.0.2.9";
  assert.equal(clientIpKey(request, true), "127.0.0.1");
  const ip = (address) => clientIpKey({ headers: {}, socket: { remoteAddress: address } }, false);
  assert.equal(ip("::ffff:192.0.2.7"), ip("192.0.2.7"));
  assert.equal(ip("2001:db8:1234:5600::1"), ip("2001:db8:1234:56ff::2"));
  assert.notEqual(ip("2001:db8:1234:5600::1"), ip("2001:db8:1234:5700::1"));
});

test("auth middleware budgets, normalization, blocking and store failure", async (t) => {
  let calls = [];
  let blockedKind;
  let unavailable = false;
  const app = express();
  app.use(express.json());
  app.all("/auth/:action", createAuthRateLimiter(async (key, limit, windowSeconds) => {
    calls.push({ key, limit, windowSeconds });
    if (unavailable) throw new Error("test store failure");
    return { allowed: !blockedKind || !key.includes(`:${blockedKind}:`), retryAfter: 42 };
  }), (_req, res) => res.json({ ok: true }));
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const call = (action, body = {}, method = "POST") => fetch(`http://127.0.0.1:${server.address().port}/auth/${action}`, {
    method, headers: { "Content-Type": "application/json" }, ...(method === "POST" ? { body: JSON.stringify(body) } : {}),
  });
  for (const [action, field, identity, ipLimit, identityLimit, windowSeconds, scope] of [
    ["login", "email", " WES@example.com ", 15, 10, 900, "login"],
    ["signup", "email", " WES@example.com ", 5, 3, 3600, "signup"],
    ["forgot-password", "email", " WES@example.com ", 10, 3, 900, "request-password-reset"],
    ["request-password-reset", "email", " WES@example.com ", 10, 3, 900, "request-password-reset"],
    ["reset-password", "token", " AbCd ", 10, 5, 900, "reset-password"],
  ]) {
    calls = [];
    assert.equal((await call(action, { [field]: identity })).status, 200);
    assert.equal(calls.length, 2);
    assert.equal(calls[0].limit, ipLimit);
    assert.deepEqual(calls[1], {
      key: authLimitKey(scope, field, field === "token" ? identity.trim() : identity.trim().toLowerCase()),
      limit: identityLimit, windowSeconds,
    });
  }
  calls = [];
  assert.equal((await call("login", { email: {} })).status, 200);
  assert.equal(calls.length, 1, "Malformed credentials still spend the IP budget");
  for (const kind of ["ip", "email"]) {
    calls = [];
    blockedKind = kind;
    const response = await call("login", { email: "wes@example.com" });
    assert.equal(response.status, 429);
    assert.equal(response.headers.get("retry-after"), "42");
    assert.equal((await response.json()).error, "Too many attempts. Try again later.");
    assert.equal(calls.length, kind === "ip" ? 1 : 2);
  }
  unavailable = true;
  assert.equal((await call("signup")).status, 503, "Store failure must not allow signup through");
  calls = [];
  for (const [action, method] of [["session", "GET"], ["logout", "POST"], ["unknown", "POST"], ["constructor", "POST"], ["login", "GET"]]) {
    assert.equal((await call(action, {}, method)).status, 200);
  }
  assert.equal(calls.length, 0, "Session reads and logout remain available when auth is blocked");
});
