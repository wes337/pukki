import type { Request, RequestHandler, Response } from "express";
import { getSession } from "#app/modules/auth.js";
import { HttpError } from "#app/lib/errors.js";
import type { SessionUser } from "#app/types/models.js";

type ApiRequest = Request<Record<string, string>, unknown, Record<string, unknown>>;
type AuthenticatedHandler = (req: ApiRequest, res: Response, user: SessionUser) => Promise<unknown>;

// The callback receives a verified user, without optional properties or request casts.
export function authenticated(handler: AuthenticatedHandler, requireFamily = false): RequestHandler<Record<string, string>, unknown, Record<string, unknown>> {
  return async (req, res) => {
    const session = await getSession(req);
    if (!session) throw new HttpError(401, "Please sign in");
    if (requireFamily && !session.user.family_id) throw new HttpError(403, "Create or join a family first");
    await handler(req, res, session.user);
  };
}
