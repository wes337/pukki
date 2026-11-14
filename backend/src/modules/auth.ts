import { createHash, randomBytes } from "node:crypto";
import { parseCookie, stringifySetCookie } from "cookie";
import type { Request, Response } from "express";
import type { PoolClient } from "pg";
import { sql } from "#app/lib/sql.js";
import { production, cookieSameSite } from "#app/constants/config.js";
import type { SessionUser } from "#app/types/models.js";
import { isApiProxyRequest } from "#app/lib/api-proxy.js";
import { HttpError } from "#app/lib/errors.js";

const cookieName = "pukki_session";
const bridgeCookieName = "pukki_session_bridge";
const migrationCookieName = "pukki_session_migrated";
const cookieMaxAge = 60 * 60 * 24 * 400;
const digest = (token: string) => createHash("sha256").update(token).digest("hex");

function sessionToken(req: Request) {
  const cookies = parseCookie(req.headers.cookie || "");
  // A valid host-only cookie always wins over an older migration response.
  const token = cookies[cookieName] || (isApiProxyRequest(req) && cookies[migrationCookieName] !== "1" ? cookies[bridgeCookieName] : undefined);
  return token && /^[a-f0-9]{64}$/.test(token) ? token : null;
}

function sessionCookie(token: string, maxAge: number) {
  return stringifySetCookie({
    name: cookieName, value: token,
    httpOnly: true, secure: production,
    sameSite: cookieSameSite, path: "/", maxAge,
  });
}

function bridgeCookie(token: string, maxAge: number) {
  return stringifySetCookie({
    name: bridgeCookieName, value: token,
    ...(production ? { domain: "pukki.gifts" } : {}),
    httpOnly: true, secure: production,
    sameSite: cookieSameSite, path: "/v1", maxAge,
  });
}

function migrationCookie() {
  // This contains no credential. It prevents a legacy account from returning after sign-out.
  return stringifySetCookie({
    name: migrationCookieName, value: "1", secure: production,
    sameSite: cookieSameSite, path: "/", maxAge: cookieMaxAge,
  });
}

export async function getSession(req: Request, res?: Response) {
  const token = sessionToken(req);
  if (!token) return null;
  const tokenHash = digest(token);
  const { rows } = await sql.query<SessionUser & { expiring: boolean }>(`SELECT u.user_id AS id, u.name, u.avatar_url,
    u.family_id, f.name AS family_name, s.expires_at <> 'infinity'::timestamptz AS expiring
    FROM pukki.sessions s JOIN pukki.users u ON u.user_id = s.user_id
    LEFT JOIN pukki.families f ON f.id = u.family_id
    WHERE s.token_hash = $1 AND s.expires_at > now()`, [tokenHash]);
  if (!rows[0]) return null;
  const { expiring, ...user } = rows[0];
  // Also preserve sessions created by the previous backend during a rolling deployment.
  if (expiring) await sql.query("UPDATE pukki.sessions SET expires_at = 'infinity' WHERE token_hash = $1 AND expires_at > now()", [tokenHash]);
  if (res) setSessionCookie(res, token, isApiProxyRequest(req));
  return { user };
}

export async function startSession(req: Request, res: Response, userId: string, verifiedPasswordHash?: string) {
  const client = await sql.connect();
  let token: string;
  try {
    await client.query("BEGIN");
    // Password reset takes the same lock. An old-password login cannot outlive its revocation.
    const { rows } = await client.query<{ password_hash: string }>("SELECT password_hash FROM pukki.users WHERE user_id = $1 FOR UPDATE", [userId]);
    if (!rows[0] || (verifiedPasswordHash && rows[0].password_hash !== verifiedPasswordHash)) {
      throw new HttpError(401, "Incorrect email or password.");
    }
    const existing = sessionToken(req);
    if (existing) await client.query("DELETE FROM pukki.sessions WHERE token_hash = $1", [digest(existing)]);
    await client.query("DELETE FROM pukki.sessions WHERE expires_at <= now()");
    token = await createSession(userId, client);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
  setSessionCookie(res, token, isApiProxyRequest(req));
}

// A reset can create its session inside the same transaction as the password change.
export async function createSession(userId: string, client: Pick<PoolClient, "query"> = sql) {
  const token = randomBytes(32).toString("hex");
  await client.query(`INSERT INTO pukki.sessions (token_hash, user_id, expires_at)
    VALUES ($1, $2, 'infinity')`, [digest(token), userId]);
  return token;
}

export function setSessionCookie(res: Response, token: string, migrated = false) {
  res.setHeader("Set-Cookie", [sessionCookie(token, cookieMaxAge), bridgeCookie("", 0), ...(migrated ? [migrationCookie()] : [])]);
}

// Move an existing API-host session to the site without exposing its token to JavaScript.
export async function migrateSession(req: Request, res: Response) {
  const session = await getSession(req);
  const token = sessionToken(req);
  if (!session || !token) return false;
  // Retain the old cookie so a failed or interrupted adoption can be retried.
  res.setHeader("Set-Cookie", bridgeCookie(token, 60));
  return true;
}

export async function endSession(req: Request, res: Response) {
  const token = sessionToken(req);
  if (token) await sql.query("DELETE FROM pukki.sessions WHERE token_hash = $1", [digest(token)]);
  res.setHeader("Set-Cookie", [sessionCookie("", 0), bridgeCookie("", 0), ...(isApiProxyRequest(req) ? [migrationCookie()] : [])]);
}
