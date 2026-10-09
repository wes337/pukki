type AuthLimit = {
  scope: string;
  windowSeconds: number;
  ipLimit: number;
  identityLimit: number;
  field: "email" | "token";
};

const passwordReset: AuthLimit = {
  scope: "request-password-reset", windowSeconds: 900, ipLimit: 10, identityLimit: 3, field: "email",
};

// Battlechat's separate IP and identity budgets, keyed by normalized email.
export const authRateLimits: Readonly<Record<string, AuthLimit>> = {
  login: { scope: "login", windowSeconds: 900, ipLimit: 15, identityLimit: 10, field: "email" },
  signup: { scope: "signup", windowSeconds: 3600, ipLimit: 5, identityLimit: 3, field: "email" },
  "request-password-reset": passwordReset,
  "forgot-password": passwordReset,
  "reset-password": { scope: "reset-password", windowSeconds: 900, ipLimit: 10, identityLimit: 5, field: "token" },
};
