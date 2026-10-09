import type { RequestHandler } from "express";
import { randomUUID } from "node:crypto";
import { HttpError, methodNotAllowed } from "#app/lib/api.js";
import { sql } from "#app/lib/sql.js";
import { getSession, startSession, endSession } from "#app/modules/auth.js";
import { hashPassword, verifyPassword } from "#app/modules/passwords.js";

// A missing account still performs the same expensive password check.
const dummyHash = `scrypt$00000000000000000000000000000000$${"0".repeat(128)}`;

const handler: RequestHandler<Record<string, string>, unknown, Record<string, unknown>> = async (req, res) => {
  const { action } = req.params;
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
  const username = typeof req.body?.username === "string" ? req.body.username.trim().toLowerCase() : "";
  const password = req.body?.password;
  if (!/^[a-z0-9_]{3,32}$/.test(username) || typeof password !== "string" || password.length < 12 || password.length > 128) {
    throw new HttpError(400, "Use a username of 3–32 letters, numbers or underscores and a password of 12–128 characters.");
  }
  let user: { user_id: string; password_hash?: string } | undefined;
  if (action === "signup") {
    const passwordHash = await hashPassword(password);
    const { rows } = await sql.query<{ user_id: string }>(`INSERT INTO pukki.users (user_id, username, password_hash, name)
      VALUES ($1, $2, $3, $2) ON CONFLICT (username) DO NOTHING RETURNING user_id`,
      [randomUUID(), username, passwordHash]);
    if (!rows[0]) throw new HttpError(409, "That username is already taken.");
    user = rows[0];
  } else {
    const { rows } = await sql.query<{ user_id: string; password_hash: string }>("SELECT user_id, password_hash FROM pukki.users WHERE username = $1", [username]);
    user = rows[0];
    const valid = await verifyPassword(password, user?.password_hash || dummyHash);
    if (!user || !valid) throw new HttpError(401, "Incorrect username or password.");
  }
  await startSession(req, res, user.user_id);
  return res.status(action === "signup" ? 201 : 200).json({ ok: true });
};
export default handler;
