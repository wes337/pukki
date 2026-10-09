import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { sql } from "#app/lib/sql.js";

async function migrate() {
  const client = await sql.connect();
  try {
    await client.query("BEGIN");
    await client.query("SET LOCAL lock_timeout = '5s'");
    await client.query("SET LOCAL statement_timeout = '30s'");
    await client.query("SELECT pg_advisory_xact_lock(742851901)");
    await client.query("CREATE SCHEMA IF NOT EXISTS pukki");
    await client.query(`CREATE TABLE IF NOT EXISTS pukki.migrations (
      name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now()
    )`);
    const directory = fileURLToPath(new URL("../../db/migrations", import.meta.url));
    for (const name of (await fs.readdir(directory)).filter((name) => name.endsWith(".sql")).sort()) {
      const existing = await client.query("SELECT 1 FROM pukki.migrations WHERE name = $1", [name]);
      if (existing.rowCount) continue;
      await client.query(await fs.readFile(path.join(directory, name), "utf8"));
      await client.query("INSERT INTO pukki.migrations (name) VALUES ($1)", [name]);
      console.log(`Applied ${name}`);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await sql.end();
  }
}

migrate().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
