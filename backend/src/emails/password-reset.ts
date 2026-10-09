import { emailLayout, siteOrigin } from "./layout.js";
import { appOrigin } from "../constants/config.js";

// Shared by the local preview and the SendGrid reset-email sender.
export function passwordResetEmail(resetUrl: string) {
  const url = new URL(resetUrl);
  if (![siteOrigin, appOrigin].includes(url.origin) || url.pathname !== "/reset-password" || url.username || url.password || !url.searchParams.get("token")) {
    throw new Error("Expected a Pukki password-reset URL with a token.");
  }
  return emailLayout({
    subject: "Reset your Pukki password",
    preheader: "Choose a new password for your Pukki account.",
    heading: "Reset your password",
    buttonLabel: "Reset password",
    buttonUrl: url.href,
    buttonIcon: "tag",
    note: "If you didn’t request this, you can ignore this email.",
  });
}
