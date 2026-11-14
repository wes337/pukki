import assert from "node:assert/strict";
import { siteOrigin } from "../frontend/config.js";

const target = new URL(process.argv[2] || siteOrigin);
assert.equal(target.protocol, "https:");
assert.ok(target.hostname === new URL(siteOrigin).hostname || target.hostname.endsWith(".vercel.app"));

// Check the deployed Vercel-to-Fly contract, including its authenticated proxy identity.
for (const [path, options, status] of [
  ["/auth/session", {}, 200],
  ["/auth/migrate-session", {
    method: "POST",
    headers: { Origin: siteOrigin, "Content-Type": "application/json" },
    body: "{}",
  }, 400],
]) {
  const response = await fetch(new URL(`/v1${path}`, target), {
    ...options,
    headers: {
      ...options.headers,
      "x-pukki-proxy-secret": "untrusted-caller",
      "x-pukki-client-ip": "192.0.2.10",
    },
    signal: AbortSignal.timeout(15000),
  });
  assert.equal(response.status, status, `${path} returned HTTP ${response.status}`);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  for (const name of response.headers.keys()) {
    assert.ok(!name.startsWith("x-middleware-request-"), "Internal request headers were exposed");
    assert.notEqual(name, "x-pukki-proxy-secret");
  }
  const body = await response.json();
  if (status === 200) assert.equal(body, null);
  else assert.equal(body.error, "Session migration must use the legacy API host");
  console.log(`API ${target.hostname}${path}: HTTP ${status}, private response, verified proxy behavior`);
}
