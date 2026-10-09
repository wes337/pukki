import type { RequestHandler } from "express";
import { HttpError, methodNotAllowed } from "#app/lib/api.js";
import { authLimitKey, clientIpKey, consumeAuthLimit } from "#app/lib/auth-rate-limit.js";
import { getSession } from "#app/modules/auth.js";
import { previewInvitation } from "#app/modules/families.js";

const handler: RequestHandler = async (req, res) => {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);
  // The invitation code grants a name-only preview before signup. Limit anonymous guesses by IP.
  const session = await getSession(req);
  const key = session ? authLimitKey("family-invitation", "user", session.user.id)
    : authLimitKey("family-invitation", "ip", clientIpKey(req));
  const budget = await consumeAuthLimit(key, 20, 900);
  if (!budget.allowed) {
    res.setHeader("Retry-After", budget.retryAfter);
    throw new HttpError(429, "Too many attempts. Try again later.");
  }
  res.json(await previewInvitation(req.query.code));
};
export default handler;
