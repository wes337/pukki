import type { RequestHandler } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { HttpError, methodNotAllowed } from "#app/lib/api.js";
import { sql } from "#app/lib/sql.js";
import { getSession, startSession, endSession } from "#app/modules/auth.js";
import { hashPassword, verifyPassword } from "#app/modules/passwords.js";
import { sendEmail } from "#app/modules/email.js";
import { welcomeEmail } from "#app/emails/welcome.js";
import { requestPasswordReset, resetPassword } from "./password-reset.js";

// A missing account still performs the same expensive password check.
const dummyHash = `scrypt$00000000000000000000000000000000$${"0".repeat(128)}`;

const handler: RequestHandler<Record<string, string>, unknown, Record<string, unknown>> = async (req, res, next) => {
  const { action } = req.params;
  if (action === "request-password-reset" || action === "forgot-password") return requestPasswordReset(req, res, next);
  if (action === "reset-password") return resetPassword(req, res, next);
  if (action === "session") {
    if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
    return res.json(await getSession(req));
  }
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  if (action === "logout") {
    await endSession(req, res);
    return res.json({ ok: true });
  }
  if (!["login", "signup"].includes(action)) throw new HttpError(404, "Not found");
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = req.body?.password;
  if (!z.email().max(254).safeParse(email).success) {
    throw new HttpError(400, "Enter a valid email address.");
  }
  if (typeof password !== "string" || password.length < 6) {
    throw new HttpError(400, "Password must be at least 6 characters.");
  }
  if (password.length > 128) throw new HttpError(400, "Password is too long.");
  let user: { user_id: string; password_hash?: string } | undefined;
  if (action === "signup") {
    const passwordHash = await hashPassword(password);
    const { rows } = await sql.query<{ user_id: string }>(`INSERT INTO pukki.users (user_id, email, password_hash, name)
      VALUES ($1, $2, $3, '') ON CONFLICT (email) DO NOTHING RETURNING user_id`,
      [randomUUID(), email, passwordHash]);
    if (!rows[0]) throw new HttpError(409, "An account already uses that email.");
    user = rows[0];
  } else {
    const { rows } = await sql.query<{ user_id: string; password_hash: string }>("SELECT user_id, password_hash FROM pukki.users WHERE email = $1", [email]);
    user = rows[0];
    const valid = await verifyPassword(password, user?.password_hash || dummyHash);
    if (!user || !valid) throw new HttpError(401, "Incorrect email or password.");
  }
  await startSession(req, res, user.user_id);
  if (action === "signup") {
    try {
      await sendEmail(email, welcomeEmail());
    } catch {
      // The account and session remain valid if the email provider is unavailable.
      console.error("Welcome email delivery failed");
    }
  }
  return res.status(action === "signup" ? 201 : 200).json({ ok: true });
};
export default handler;
