import type { RequestHandler } from "express";
import { authRateLimits } from "#app/constants/auth-rate-limits.js";
import { authLimitKey, clientIpKey, consumeAuthLimit } from "#app/lib/auth-rate-limit.js";

export function createAuthRateLimiter(consume = consumeAuthLimit): RequestHandler<Record<string, string>, unknown, Record<string, unknown>> {
  return async (req, res, next) => {
    const action = req.params.action;
    if (req.method !== "POST" || !Object.hasOwn(authRateLimits, action)) return next();
    const policy = authRateLimits[action];
    try {
      // Spend the IP budget first so blocked callers cannot fill the table with new identities.
      let result = await consume(authLimitKey(policy.scope, "ip", clientIpKey(req)), policy.ipLimit, policy.windowSeconds);
      const raw = req.body?.[policy.field];
      const identity = typeof raw === "string"
        ? (policy.field === "token" ? raw.trim() : raw.trim().toLowerCase()) : "";
      if (result.allowed && identity) {
        result = await consume(authLimitKey(policy.scope, policy.field, identity), policy.identityLimit, policy.windowSeconds);
      }
      if (!result.allowed) {
        res.setHeader("Retry-After", result.retryAfter);
        res.status(429).json({ error: "Too many attempts. Try again later." });
        return;
      }
    } catch (error) {
      console.error("Auth rate limit unavailable", error instanceof Error ? error.name : "Unknown error");
      res.setHeader("Retry-After", "30");
      res.status(503).json({ error: "Please try again shortly." });
      return;
    }
    next();
  };
}

export const authRateLimiter = createAuthRateLimiter();
