import { randomInt, randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import type { Family } from "#app/types/models.js";
import { sql } from "#app/lib/sql.js";
import { HttpError } from "#app/lib/errors.js";
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function normalizeCode(value: unknown) {
  return typeof value === "string" ? value.replace(/[\s-]/g, "").toUpperCase() : "";
}

// An invitation reveals only its family name, never members or wishlists.
export async function previewInvitation(input: unknown) {
  const code = normalizeCode(input);
  if (!/^(?:[A-HJ-NP-Z2-9]{6}|[A-HJ-NP-Z2-9]{8})$/.test(code)) {
    throw new HttpError(400, "Invalid invitation.");
  }
  const { rows } = await sql.query<Pick<Family, "id" | "name">>("SELECT id, name FROM pukki.families WHERE code = $1", [code]);
  if (!rows[0]) throw new HttpError(404, "Invitation not found.");
  return rows[0];
}

function generateCode() {
  return Array.from({ length: 6 }, () => alphabet[randomInt(alphabet.length)]).join("");
}

// Lock the account while assigning its family so concurrent create/join requests cannot move it.
async function assignFamily(userId: string, selectFamily: (client: PoolClient) => Promise<Family>) {
  const client = await sql.connect();
  try {
    await client.query("BEGIN");
    const { rows: [user] } = await client.query<{ family_id: string | null }>("SELECT family_id FROM pukki.users WHERE user_id = $1 FOR UPDATE", [userId]);
    if (user.family_id) throw new HttpError(409, "You already belong to a family");
    const family = await selectFamily(client);
    await client.query("UPDATE pukki.users SET family_id = $1 WHERE user_id = $2", [family.id, userId]);
    await client.query("COMMIT");
    return family;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function createFamily(userId: string, name: unknown) {
  if (typeof name !== "string" || !name.trim() || name.trim().length > 80) {
    throw new HttpError(400, "Use a family name of 1–80 characters");
  }
  return assignFamily(userId, async (client) => {
    for (let attempt = 0; attempt < 5; attempt++) {
      const { rows } = await client.query<Family>(`INSERT INTO pukki.families (id, name, code, created_by)
        VALUES ($1, $2, $3, $4) ON CONFLICT (code) DO NOTHING RETURNING id, name, code`,
        [randomUUID(), name.trim(), generateCode(), userId]);
      if (rows[0]) return rows[0];
    }
    throw new HttpError(503, "Could not create a family. Please try again.");
  });
}

export async function joinFamily(userId: string, input: unknown) {
  await sql.query("DELETE FROM pukki.family_join_attempts WHERE expires_at <= now()");
  const { rows: [attempt] } = await sql.query<{ attempts: number }>(`INSERT INTO pukki.family_join_attempts (user_id, attempts, expires_at)
    VALUES ($1, 1, now() + interval '15 minutes') ON CONFLICT (user_id)
    DO UPDATE SET attempts = pukki.family_join_attempts.attempts + 1 RETURNING attempts`, [userId]);
  if (attempt.attempts > 10) throw new HttpError(429, "Too many attempts. Try again in 15 minutes.");
  const code = normalizeCode(input);
  // Keep existing invitations valid while all new families receive six-character codes.
  if (!/^(?:[A-HJ-NP-Z2-9]{6}|[A-HJ-NP-Z2-9]{8})$/.test(code)) throw new HttpError(400, "Enter the 6-character family code");
  const family = await assignFamily(userId, async (client) => {
    const { rows } = await client.query<Family>("SELECT id, name, code FROM pukki.families WHERE code = $1", [code]);
    if (!rows[0]) throw new HttpError(404, "Family code not found. Check the code and try again.");
    return rows[0];
  });
  await sql.query("DELETE FROM pukki.family_join_attempts WHERE user_id = $1", [userId]);
  return family;
}
