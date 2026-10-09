import type { Response } from "express";
import { HttpError } from "#app/lib/errors.js";
export { HttpError } from "#app/lib/errors.js";
export { authenticated as api } from "#app/middlewares/auth.js";

export function methodNotAllowed(res: Response, methods: string[]): never {
  res.setHeader("Allow", methods.join(", "));
  throw new HttpError(405, "Method not allowed");
}

export function uuid(value: unknown) {
  if (typeof value !== "string" || !/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(value)) {
    throw new HttpError(400, "Invalid ID");
  }
  return value;
}
