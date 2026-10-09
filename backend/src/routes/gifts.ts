import { randomUUID } from "node:crypto";
import { api, HttpError, methodNotAllowed, uuid } from "#app/lib/api.js";
import { sql } from "#app/lib/sql.js";
import { listGifts } from "#app/modules/gifts.js";
export default api(async (req, res, user) => {
  if (req.method === "GET") return res.json(await listGifts(user.id));
  if (req.method !== "POST") return methodNotAllowed(res, ["GET", "POST"]);
  const gift = req.body;
  if (gift?.user !== user.id) throw new HttpError(403, "You can only edit your own wishlist");
  if (typeof gift.name !== "string" || !gift.name.trim() || gift.name.length > 200 ||
      typeof gift.description !== "string" || gift.description.length > 5000 ||
      typeof gift.url !== "string" || gift.url.length > 2000) throw new HttpError(400, "Invalid gift details");
  const id = gift.id ? uuid(gift.id) : randomUUID();
  if (gift.id) {
    const result = await sql.query(`UPDATE pukki.gifts SET name = $1, description = $2, url = $3
      WHERE id = $4 AND "user" = $5`, [gift.name.trim(), gift.description, gift.url, id, user.id]);
    if (!result.rowCount) throw new HttpError(403, "You can only edit your own gifts");
  } else {
    await sql.query(`INSERT INTO pukki.gifts (id, "user", name, description, url)
      VALUES ($1, $2, $3, $4, $5)`, [id, user.id, gift.name.trim(), gift.description, gift.url]);
  }
  res.status(gift.id ? 200 : 201).json((await listGifts(user.id, " WHERE g.id = $2", [id]))[0]);
}, true);
