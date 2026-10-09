import type { UserProfile } from "#app/types/models.js";
import { api, methodNotAllowed } from "#app/lib/api.js";
import { sql } from "#app/lib/sql.js";
export default api(async (req, res, user) => {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  const { rows } = await sql.query<UserProfile>("SELECT user_id, name, avatar_url FROM pukki.users WHERE family_id = $1 ORDER BY name", [user.family_id]);
  res.json(rows);
}, true);
