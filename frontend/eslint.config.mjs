import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  globalIgnores([".next/**", "public/sw.js", "public/workbox-*.js", "public/swe-worker-*.js"]),
]);
