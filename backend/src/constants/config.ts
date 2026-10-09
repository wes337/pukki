// NODE_ENV is the framework/runtime mode, not application configuration.
export const production = process.env.NODE_ENV === "production";
export const serverPort = 4000;
export const appOrigin = production ? "https://pukki.gifts" : "http://localhost:3000";
// The frontend and API share pukki.gifts; keep sessions host-only on the API.
export const cookieSameSite = "lax";
