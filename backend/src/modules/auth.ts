import { createHash, randomBytes } from "node:crypto";
import { parseCookie, stringifySetCookie } from "cookie";
import type { Request, Response } from "express";
import { sql } from "#app/lib/sql.js";
import { production, cookieSameSite } from "#app/constants/config.js";
import type { SessionUser } from "#app/types/models.js";

const cookieName = "pukki_session";
const digest = (token: string) => createHash("sha256").update(token).digest("hex");

function sessionToken(req: Request) {
  const token = parseCookie(req.headers.cookie || "")[cookieName];
  return token && /^[a-f0-9]{64}$/.test(token) ? token : null;
}

function setCookie(res: Response, token: string, maxAge: number) {
  res.setHeader("Set-Cookie", stringifySetCookie({
    name: cookieName, value: token,
    httpOnly: true, secure: production,
    sameSite: cookieSameSite, path: "/", maxAge,
  }));
}

export async function getSession(req: Request) {
  const token = sessionToken(req);
  if (!token) return null;
  const { rows } = await sql.query<SessionUser>(`SELECT u.user_id AS id, u.username, u.name, u.avatar_url,
    u.family_id, f.name AS family_name
    FROM pukki.sessions s JOIN pukki.users u ON u.user_id = s.user_id
    LEFT JOIN pukki.families f ON f.id = u.family_id
    WHERE s.token_hash = $1 AND s.expires_at > now()`, [digest(token)]);
  return rows[0] ? { user: rows[0] } : null;
}

export async function startSession(req: Request, res: Response, userId: string) {
  await endSession(req, res);
  await sql.query("DELETE FROM pukki.sessions WHERE expires_at <= now()");
  const token = randomBytes(32).toString("hex");
  await sql.query(`INSERT INTO pukki.sessions (token_hash, user_id, expires_at)
    VALUES ($1, $2, now() + interval '14 days')`, [digest(token), userId]);
  setCookie(res, token, 60 * 60 * 24 * 14);
}

export async function endSession(req: Request, res: Response) {
  const token = sessionToken(req);
  if (token) await sql.query("DELETE FROM pukki.sessions WHERE token_hash = $1", [digest(token)]);
  setCookie(res, "", 0);
}
