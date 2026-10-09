import { sql } from "#app/lib/sql.js";
import type { Gift } from "#app/types/models.js";
// Keep the existing response shape while hiding claimants from the gift recipient.
const select = `SELECT g.id, g.name, g."user", g.description, g.url,
  CASE WHEN g."user" = $1 OR c.user_id IS NULL OR c.family_id IS DISTINCT FROM owner.family_id THEN NULL
    ELSE json_build_object('user_id', c.user_id, 'name', c.name, 'avatar_url', c.avatar_url) END AS claimed_by,
  json_build_object('user_id', owner.user_id, 'name', owner.name, 'avatar_url', owner.avatar_url) AS users
  FROM pukki.gifts g LEFT JOIN pukki.users c ON c.user_id = g.claimed_by
  JOIN pukki.users owner ON owner.user_id = g."user"
  JOIN pukki.users viewer ON viewer.user_id = $1 AND viewer.family_id = owner.family_id`;
export async function listGifts(viewerId: string, filter = "", values: string[] = []) {
  const { rows } = await sql.query<Gift>(select + filter + " ORDER BY g.name, g.id", [viewerId, ...values]);
  return rows;
}
