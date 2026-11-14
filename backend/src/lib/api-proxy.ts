import { timingSafeEqual } from "node:crypto";
import type { IncomingMessage } from "node:http";
import { env } from "#app/constants/env.js";

// Public API callers cannot select a trusted client IP or proxy cookie behavior themselves.
export function isApiProxyRequest(request: IncomingMessage, secret = env.API_PROXY_SECRET): boolean {
  const supplied = request.headers["x-pukki-proxy-secret"];
  if (!secret || typeof supplied !== "string") return false;
  const expected = Buffer.from(secret);
  const actual = Buffer.from(supplied);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
