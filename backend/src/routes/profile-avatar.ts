import { api, HttpError, methodNotAllowed } from "#app/lib/api.js";
import { sql } from "#app/lib/sql.js";

// This catalog also limits updates to avatar assets shipped with the app.
const avatars = [
  // Santa hats, elf hats, winter hats and earmuffs, then animals and gingerbread.
  "santa-curls", "santa-beard", "blonde-santa", "blonde-pixie", "blonde-pigtails",
  "auburn-elf", "blonde-elf",
  "winter-glasses", "winter-stubble", "blonde-beard", "blonde-boy",
  "blonde-grandpa", "blonde-grandma", "blonde-braids",
  "winter-earmuffs", "blonde-bob",
  "cat", "puppy", "polar-bear", "penguin", "gingerbread",
].map((id) => ({ url: `/images/avatars/${id}.png`, name: id.replaceAll("-", " ") }));

export default api(async (req, res, user) => {
  if (req.method === "GET") return res.json(avatars);
  if (req.method !== "PATCH") return methodNotAllowed(res, ["GET", "PATCH"]);
  const avatar = avatars.find(({ url }) => url === req.body?.avatar_url);
  if (!avatar) throw new HttpError(400, "Choose an avatar from the list.");
  await sql.query("UPDATE pukki.users SET avatar_url = $1 WHERE user_id = $2", [avatar.url, user.id]);
  return res.json({ ...user, avatar_url: avatar.url });
});
