import { api, methodNotAllowed, uuid, HttpError } from "#app/lib/api.js";
import { listGifts } from "#app/modules/gifts.js";
export default api(async (req, res, user) => {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  const uid = uuid(req.params.uid);
  if (uid !== user.id) throw new HttpError(403, "You can only view your own list of gifts you're giving");
  res.json(await listGifts(user.id, ' WHERE g.claimed_by = $2', [uid]));
}, true);
