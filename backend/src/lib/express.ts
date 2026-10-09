import express from "express";
import cors from "cors";
import helmet from "helmet";
import { appOrigin } from "#app/constants/config.js";
import { HttpError, handleError } from "#app/lib/errors.js";
import { routes } from "#app/routes/index.js";

export const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.headers.origin && req.headers.origin !== appOrigin) throw new HttpError(403, "Request not allowed");
  next();
});
app.use(cors({ origin: appOrigin, credentials: true, methods: ["GET", "POST", "PATCH", "DELETE"], allowedHeaders: ["Content-Type"] }));
app.get("/health", (_req, res) => { res.json({ ok: true }); });
app.use("/v1", (req, _res, next) => {
  // Cookies authenticate requests; exact origins and JSON-only writes prevent cross-site form submissions.
  if (!["GET", "HEAD"].includes(req.method) &&
      (req.headers.origin !== appOrigin || !req.is("application/json"))) {
    throw new HttpError(403, "Request not allowed");
  }
  next();
}, express.json({ limit: "16kb" }), (req, _res, next) => {
  if (!req.body) req.body = {};
  next();
}, routes);
app.use((_req, _res) => { throw new HttpError(404, "Not found"); });
app.use(handleError);
