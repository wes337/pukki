import { app } from "#app/lib/express.js";
import { serverPort } from "#app/constants/config.js";
import { sql } from "#app/lib/sql.js";

const server = app.listen(serverPort, "0.0.0.0", () => {
  console.log(`Pukki API listening on port ${serverPort}`);
});
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    server.close(() => { void sql.end(); });
    setTimeout(() => process.exit(1), 10_000).unref();
  });
}
