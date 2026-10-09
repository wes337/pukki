import type { UserProfile } from "#app/types/models.js";
import { api, HttpError, methodNotAllowed, uuid } from "#app/lib/api.js";
import { sql } from "#app/lib/sql.js";
export default api(async (req, res, user) => {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  const { rows } = await sql.query<UserProfile>("SELECT user_id, name, avatar_url FROM pukki.users WHERE user_id = $1 AND family_id = $2", [uuid(req.params.uid), user.family_id]);
  if (!rows[0]) throw new HttpError(404, "User not found");
  res.json(rows[0]);
}, true);
