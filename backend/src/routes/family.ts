import type { Family } from "#app/types/models.js";
import { appOrigin } from "#app/constants/config.js";
import QRCode from "qrcode";
import { api, methodNotAllowed } from "#app/lib/api.js";
import { sql } from "#app/lib/sql.js";
import { createFamily } from "#app/modules/families.js";

export default api(async (req, res, user) => {
  if (req.method === "POST") return res.status(201).json(await createFamily(user.id, req.body?.name));
  if (req.method !== "GET") return methodNotAllowed(res, ["GET", "POST"]);
  if (!user.family_id) return res.json(null);
  const { rows: [family] } = await sql.query<Family>("SELECT id, name, code FROM pukki.families WHERE id = $1", [user.family_id]);
  const joinUrl = new URL(`/join?code=${family.code}`, appOrigin).toString();
  const qr = await QRCode.toDataURL(joinUrl, { width: 256, margin: 4, errorCorrectionLevel: "M" });
  res.json({ ...family, joinUrl, qr });
});
