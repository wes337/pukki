import { createHash, randomBytes } from "node:crypto";
import type { RequestHandler } from "express";
import { z } from "zod";
import { sql } from "#app/lib/sql.js";
import { HttpError, methodNotAllowed } from "#app/lib/api.js";
import { env } from "#app/constants/env.js";
import { appOrigin } from "#app/constants/config.js";
import { createSession, setSessionCookie } from "#app/modules/auth.js";
import { hashPassword } from "#app/modules/passwords.js";
import { sendEmail } from "#app/modules/email.js";
import { passwordResetEmail } from "#app/emails/password-reset.js";

const digest = (token: string) => createHash("sha256").update(token).digest("hex");
const invalidLink = () => new HttpError(400, "This reset link is invalid or expired.");

export const requestPasswordReset: RequestHandler = async (req, res) => {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  if (!z.email().max(254).safeParse(email).success) throw new HttpError(400, "Enter a valid email address.");
  if (!env.SENDGRID_API_KEY) throw new HttpError(503, "Please try again later.");
  const { rows } = await sql.query<{ user_id: string }>("SELECT user_id FROM pukki.users WHERE email = $1", [email]);
  if (rows[0]) {
    const token = randomBytes(32).toString("hex");
    await sql.query("DELETE FROM pukki.password_resets WHERE expires_at <= now()");
    await sql.query(`INSERT INTO pukki.password_resets (token_hash, user_id, expires_at)
      VALUES ($1, $2, now() + interval '30 minutes')`, [digest(token), rows[0].user_id]);
    const url = new URL("/reset-password", appOrigin);
    url.searchParams.set("token", token);
    if (typeof req.body.code === "string" && /^[a-z0-9]{6,8}$/i.test(req.body.code)) url.searchParams.set("code", req.body.code);
    try {
      await sendEmail(email, passwordResetEmail(url.href));
    } catch {
      await sql.query("DELETE FROM pukki.password_resets WHERE token_hash = $1", [digest(token)]);
      // Keep the public response identical for unknown addresses and delivery failures.
      console.error("Password reset email delivery failed");
    }
  }
  res.json({ ok: true });
};

export const resetPassword: RequestHandler = async (req, res) => {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  const { token, password } = req.body;
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) throw invalidLink();
  if (typeof password !== "string" || password.length < 6) throw new HttpError(400, "Password must be at least 6 characters.");
  if (password.length > 128) throw new HttpError(400, "Password is too long.");
  const passwordHash = await hashPassword(password);
  const client = await sql.connect();
  let sessionToken: string;
  try {
    await client.query("BEGIN");
    // Serialize resets for the same account, including requests using different links.
    const { rows } = await client.query<{ user_id: string }>(`SELECT u.user_id FROM pukki.users u
      JOIN pukki.password_resets r ON r.user_id = u.user_id
      WHERE r.token_hash = $1 AND r.expires_at > now() FOR UPDATE OF u`, [digest(token)]);
    if (!rows[0]) throw invalidLink();
    const used = await client.query("DELETE FROM pukki.password_resets WHERE token_hash = $1 AND expires_at > clock_timestamp() RETURNING user_id", [digest(token)]);
    if (!used.rowCount) throw invalidLink();
    const userId = rows[0].user_id;
    await client.query("UPDATE pukki.users SET password_hash = $1 WHERE user_id = $2", [passwordHash, userId]);
    await client.query("DELETE FROM pukki.password_resets WHERE user_id = $1", [userId]);
    await client.query("DELETE FROM pukki.sessions WHERE user_id = $1", [userId]);
    sessionToken = await createSession(userId, client);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
  setSessionCookie(res, sessionToken);
  res.json({ ok: true });
};
