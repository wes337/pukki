import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  {
    rules: {
      "@next/next/no-img-element": "off",
      "no-restricted-imports": ["error", {
        paths: ["next/image", "next/legacy/image"].map((name) => ({
          name, message: "Use native <img> elements with the original image assets.",
        })),
      }],
    },
  },
  globalIgnores([".next/**", "public/sw.js", "public/workbox-*.js", "public/swe-worker-*.js"]),
]);
