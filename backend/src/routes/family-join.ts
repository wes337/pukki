import { api, methodNotAllowed } from "#app/lib/api.js";
import { joinFamily } from "#app/modules/families.js";

export default api(async (req, res, user) => {
  if (req.method !== "POST") return methodNotAllowed(res, ["POST"]);
  res.json(await joinFamily(user.id, req.body?.code));
});
