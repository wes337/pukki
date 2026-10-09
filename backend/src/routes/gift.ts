import { api, HttpError, methodNotAllowed, uuid } from "#app/lib/api.js";
import { sql } from "#app/lib/sql.js";
import { listGifts } from "#app/modules/gifts.js";
export default api(async (req, res, user) => {
  const id = uuid(req.params.gid);
  if (req.method === "GET") {
    const [gift] = await listGifts(user.id, " WHERE g.id = $2", [id]);
    if (!gift) throw new HttpError(404, "Gift not found");
    return res.json(gift);
  }
  if (req.method === "DELETE") {
    const result = await sql.query('DELETE FROM pukki.gifts WHERE id = $1 AND "user" = $2', [id, user.id]);
    if (!result.rowCount) throw new HttpError(403, "You can only delete your own gifts");
    return res.status(204).end();
  }
  if (req.method !== "PATCH") return methodNotAllowed(res, ["GET", "DELETE", "PATCH"]);
  if (typeof req.body?.claim !== "boolean") throw new HttpError(400, "Invalid gift selection");
  // The predicate makes competing claims atomic; the client cannot choose a claimant.
  const result = req.body.claim
    ? await sql.query(`UPDATE pukki.gifts SET claimed_by = $2 WHERE id = $1
        AND "user" <> $2 AND (claimed_by IS NULL OR claimed_by = $2 OR NOT EXISTS (
          SELECT 1 FROM pukki.users claimant WHERE claimant.user_id = claimed_by AND claimant.family_id = $3))
        AND EXISTS (SELECT 1 FROM pukki.users owner WHERE owner.user_id = pukki.gifts."user" AND owner.family_id = $3)`, [id, user.id, user.family_id])
    : await sql.query(`UPDATE pukki.gifts SET claimed_by = NULL WHERE id = $1 AND claimed_by = $2
        AND EXISTS (SELECT 1 FROM pukki.users owner WHERE owner.user_id = pukki.gifts."user" AND owner.family_id = $3)`, [id, user.id, user.family_id]);
  if (!result.rowCount) throw new HttpError(409, "Couldn't update this gift. Refresh and try again.");
  res.json((await listGifts(user.id, " WHERE g.id = $2", [id]))[0]);
}, true);
