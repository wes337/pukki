export const siteOrigin = "https://pukki.gifts";
export const siteDescription = "Share wishlists with your family, find gifts they'll love, and keep every surprise a secret.";
export const contactEmail = "support@pukki.gifts";

export const legacyApiUrl = "https://api.pukki.gifts/v1";

export const apiUrl = process.env.NODE_ENV === "production"
  ? "/v1"
  : "http://localhost:4000/v1";
