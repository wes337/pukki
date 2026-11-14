import { test } from "node:test";
import assert from "node:assert/strict";
import "next/dist/server/node-environment-baseline.js";
import { NextRequest } from "next/server.js";
import nextTesting from "next/experimental/testing/server.js";
import { proxy, config } from "../proxy.js";

const secret = "test-only-proxy-secret-not-for-production";
const nextConfig = { i18n: { locales: ["en", "fi"], defaultLocale: "en" } };

function configureProxy(t, values) {
  const previous = Object.fromEntries(Object.keys(values).map((key) => [key, process.env[key]]));
  Object.assign(process.env, values);
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
}

test("API proxy preserves requests and replaces spoofed proxy identity", (t) => {
  configureProxy(t, { VERCEL: "1", API_PROXY_SECRET: secret });
  const response = proxy(new NextRequest("https://pukki.gifts/v1/auth/session?example=1", {
    headers: {
      "x-vercel-forwarded-for": "203.0.113.5",
      "x-forwarded-for": "192.0.2.10",
      "x-pukki-proxy-secret": "attacker-supplied",
      "x-pukki-client-ip": "192.0.2.20",
      cookie: "pukki_session=test-token", origin: "https://pukki.gifts",
    },
  }));
  assert.equal(response.headers.get("x-middleware-rewrite"), "https://api.pukki.gifts/v1/auth/session?example=1");
  assert.equal(response.headers.get("x-middleware-request-x-pukki-proxy-secret"), secret);
  assert.equal(response.headers.get("x-middleware-request-x-pukki-client-ip"), "203.0.113.5");
  assert.equal(response.headers.get("x-middleware-request-cookie"), "pukki_session=test-token");
  assert.equal(response.headers.get("x-middleware-request-origin"), "https://pukki.gifts");
  assert.equal(response.headers.get("x-pukki-proxy-secret"), null, "The secret is a request override, not a response header");
});

test("API proxy matches Vercel's localized routing and forwards unlocalized API paths", (t) => {
  configureProxy(t, { VERCEL: "1", API_PROXY_SECRET: secret });
  for (const locale of nextConfig.i18n.locales) {
    const url = `https://pukki.gifts/${locale}/v1/auth/session?example=1`;
    assert.equal(nextTesting.unstable_doesMiddlewareMatch({ config, nextConfig, url }), true);
    const response = proxy(new NextRequest(url, {
      nextConfig, headers: { "x-vercel-forwarded-for": "203.0.113.5" },
    }));
    assert.equal(response.headers.get("x-middleware-rewrite"), "https://api.pukki.gifts/v1/auth/session?example=1");
  }
  assert.equal(nextTesting.unstable_doesMiddlewareMatch({ config, nextConfig, url: "https://pukki.gifts/en/login" }), false);
});

test("API proxy fails closed without server identity or a trustworthy visitor IP", async (t) => {
  configureProxy(t, { VERCEL: "1", API_PROXY_SECRET: secret });
  for (const ip of [undefined, "not-an-ip", "203.0.113.5, 192.0.2.10"]) {
    const response = proxy(new NextRequest("https://pukki.gifts/v1/auth/login", {
      headers: ip ? { "x-vercel-forwarded-for": ip } : {},
    }));
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.equal(response.headers.get("x-middleware-rewrite"), null);
  }
  for (const settings of [{ VERCEL: "0", API_PROXY_SECRET: secret }, { VERCEL: "1", API_PROXY_SECRET: "" }]) {
    Object.assign(process.env, settings);
    const response = proxy(new NextRequest("https://pukki.gifts/v1/auth/login", {
      headers: { "x-vercel-forwarded-for": "203.0.113.5" },
    }));
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: "Please try again shortly." });
  }
});
