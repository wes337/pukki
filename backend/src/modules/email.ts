import { env } from "#app/constants/env.js";
import type { emailLayout } from "#app/emails/layout.js";

export async function sendEmail(to: string, email: ReturnType<typeof emailLayout>) {
  if (!env.SENDGRID_API_KEY) throw new Error("Email sending is not configured");
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.SENDGRID_API_KEY}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(10000),
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: email.from, subject: email.subject,
      content: [{ type: "text/plain", value: email.text }, { type: "text/html", value: email.html }],
      tracking_settings: { click_tracking: { enable: false, enable_text: false }, open_tracking: { enable: false } },
    }),
  });
  if (!response.ok) throw new Error(`Email delivery failed (${response.status})`);
}
