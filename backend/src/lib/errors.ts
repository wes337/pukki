import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export const handleError: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({ error: error.issues[0]?.message || "Invalid request" });
  } else if (error instanceof HttpError) {
    if (error.status === 429 && !res.hasHeader("Retry-After")) res.setHeader("Retry-After", "900");
    res.status(error.status).json({ error: error.message });
  } else if (error instanceof SyntaxError && "body" in error) {
    res.status(400).json({ error: "Invalid JSON" });
  } else if (error instanceof Error && "type" in error && error.type === "entity.too.large") {
    res.status(413).json({ error: "Request is too large" });
  } else {
    console.error("API request failed", error instanceof Error ? error.name : "Unknown error");
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
};
