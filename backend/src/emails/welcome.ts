import { emailLayout, siteOrigin } from "./layout.js";

export function welcomeEmail() {
  return emailLayout({
    subject: "Welcome to Pukki!",
    preheader: "Share wishlists, choose gifts to give, and keep the surprises.",
    heading: "Welcome to Pukki!",
    message: "Share wishlists, choose gifts to give, and keep the surprises.",
    buttonLabel: "Let's go!",
    buttonUrl: siteOrigin,
    buttonIcon: "santa-claus",
  });
}
