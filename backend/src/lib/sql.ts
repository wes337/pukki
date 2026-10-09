import { Pool } from "pg";
import { readFileSync } from "node:fs";
import { env } from "#app/constants/env.js";

const connection = new URL(env.POSTGRES_URL);
const ssl = connection.hostname.endsWith(".db.ondigitalocean.com") ? {
  ca: readFileSync(new URL("../../certificates/postgres-ca.crt", import.meta.url), "utf8"),
  rejectUnauthorized: true,
} : undefined;
if (ssl) {
  for (const option of ["sslmode", "sslrootcert", "ssl", "uselibpqcompat"]) connection.searchParams.delete(option);
}

// One small pool per backend process; other projects share this database.
export const sql = new Pool({
  connectionString: connection.toString(),
  ...(ssl ? { ssl } : {}),
  max: 2,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});
