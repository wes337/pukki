import { api, HttpError, methodNotAllowed } from "#app/lib/api.js";
import { sql } from "#app/lib/sql.js";

export default api(async (req, res, user) => {
  if (req.method !== "PATCH") return methodNotAllowed(res, ["PATCH"]);
  const name = typeof req.body?.name === "string" ? req.body.name.trim().replace(/\s+/g, " ") : "";
  if (!name || name.length > 80 || /[\u0000-\u001f\u007f]/.test(name)) {
    throw new HttpError(400, "Enter your first name.");
  }
  await sql.query("UPDATE pukki.users SET name = $1 WHERE user_id = $2", [name, user.id]);
  res.json({ ...user, name });
}, false, true);
