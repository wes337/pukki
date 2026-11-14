// NODE_ENV is the framework/runtime mode, not application configuration.
export const production = process.env.NODE_ENV === "production";
export const serverPort = 4000;
export const appOrigin = production ? "https://pukki.gifts" : "http://localhost:3000";
// The frontend proxies production API requests; the session cookie stays host-only.
export const cookieSameSite = "lax";
