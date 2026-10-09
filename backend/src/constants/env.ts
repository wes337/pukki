import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { z } from "zod";

config({ path: fileURLToPath(new URL("../../.env", import.meta.url)), quiet: true });

const environment = z.object({
  POSTGRES_URL: z.string().url(),
}).safeParse(process.env);

if (!environment.success) {
  throw new Error(`Invalid backend configuration: ${environment.error.issues.map((issue) => issue.path.join(".")).join(", ")}`);
}
export const env = environment.data;
