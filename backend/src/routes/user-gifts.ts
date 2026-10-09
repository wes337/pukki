import { api, methodNotAllowed, uuid } from "#app/lib/api.js";
import { listGifts } from "#app/modules/gifts.js";
export default api(async (req, res, user) => {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  const uid = uuid(req.params.uid);

  res.json(await listGifts(user.id, ' WHERE g."user" = $2', [uid]));
}, true);
