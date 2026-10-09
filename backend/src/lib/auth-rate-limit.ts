import { createHash } from "node:crypto";
import { isIP } from "node:net";
import type { IncomingMessage } from "node:http";
import { ipKeyGenerator } from "express-rate-limit";
import { sql } from "#app/lib/sql.js";

export function authLimitKey(scope: string, kind: string, value: string): string {
  return `${scope}:${kind}:${createHash("sha256").update(value).digest("hex")}`;
}

export function clientIpKey(request: IncomingMessage, onFly = process.env.FLY_APP_NAME === "pukki"): string {
  // api.pukki.gifts is DNS-only. Fly supplies the client IP; local callers cannot spoof it.
  // https://docs.fly.io/networking/request-headers
  const forwarded = request.headers["fly-client-ip"];
  const ip = onFly && typeof forwarded === "string" && isIP(forwarded.trim())
    ? forwarded.trim()
    : request.socket.remoteAddress || "unknown";
  return ipKeyGenerator(ip);
}

let nextCleanup = 0;

// Atomic upserts share fixed windows across processes and survive deployments.
export async function consumeAuthLimit(key: string, limit: number, windowSeconds: number) {
  if (Date.now() >= nextCleanup) {
    nextCleanup = Date.now() + 60_000;
    await sql.query(`DELETE FROM pukki.auth_rate_limits WHERE key IN (
      SELECT key FROM pukki.auth_rate_limits WHERE expires_at <= now() ORDER BY expires_at LIMIT 1000
    ) AND expires_at <= now()`);
  }
  const { rows } = await sql.query<{ attempts: number; retry_after: number }>(`
    INSERT INTO pukki.auth_rate_limits AS counters (key, attempts, expires_at)
    VALUES ($1, 1, now() + $3 * interval '1 second')
    ON CONFLICT (key) DO UPDATE SET
      attempts = CASE WHEN counters.expires_at <= now() THEN 1 ELSE LEAST(counters.attempts + 1, $2 + 1) END,
      expires_at = CASE WHEN counters.expires_at <= now() THEN EXCLUDED.expires_at ELSE counters.expires_at END
    RETURNING attempts, GREATEST(1, CEIL(EXTRACT(EPOCH FROM expires_at - now())))::integer AS retry_after
  `, [key, limit, windowSeconds]);
  return { allowed: rows[0].attempts <= limit, retryAfter: rows[0].retry_after };
}
