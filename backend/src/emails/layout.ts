export const siteOrigin = "https://pukki.gifts";
const sender = { email: "support@pukki.gifts", name: "Pukki" };

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}

type EmailContent = {
  subject: string;
  preheader: string;
  heading: string;
  message?: string;
  buttonLabel: string;
  buttonUrl: string;
  buttonIcon: "tag" | "santa-claus";
  note?: string;
};

// One table-based layout keeps transactional emails consistent across email clients.
export function emailLayout({ subject, preheader, heading, message, buttonLabel, buttonUrl, buttonIcon, note }: EmailContent) {
  const href = escapeHtml(buttonUrl);
  const text = [heading, message, buttonUrl, note, "Pukki\nsupport@pukki.gifts"].filter(Boolean).join("\n\n");
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Pukki | ${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f0f3;color:#433f43;font-family:'Trebuchet MS',Arial,sans-serif;-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f3f0f3">
    <tr><td align="center" style="padding:32px 12px;">
      <!--[if mso]><table role="presentation" width="440" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:440px;">
        <tr><td bgcolor="#ffffff" style="border:1px solid #e2dee2;border-radius:6px;overflow:hidden;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td align="center">
              <a href="${siteOrigin}" style="text-decoration:none;"><img src="${siteOrigin}/images/social/pukki-wide.png?v=amore-christmas" width="438" alt="Pukki" style="display:block;width:100%;max-width:438px;height:auto;border:0;border-radius:5px 5px 0 0;"></a>
            </td></tr>
            <tr><td align="center" style="padding:8px 24px 28px;">
              <h1 style="margin:0 0 22px;color:#ee6161;font-size:28px;line-height:1.15;font-weight:400;">${escapeHtml(heading)}</h1>
              ${message ? `<p style="margin:0 0 22px;color:#554e56;font-size:16px;line-height:1.5;">${escapeHtml(message)}</p>` : ""}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td align="center" bgcolor="#46cc8d" style="border:1px solid #329867;border-radius:5px;mso-padding-alt:12px 20px;">
                  <a href="${href}" style="display:block;padding:12px 20px;border-radius:5px;color:#ffffff;text-decoration:none;font-size:18px;font-weight:700;line-height:24px;text-shadow:0 2px 0 #39865f;">
                    <img src="${siteOrigin}/images/icons/${buttonIcon}.png" width="24" height="24" alt="" style="display:inline-block;vertical-align:middle;border:0;margin-right:6px;">${escapeHtml(buttonLabel)}
                  </a>
                </td></tr>
              </table>
              ${note ? `<p style="margin:20px 0 0;color:#554e56;font-size:14px;line-height:1.5;">${escapeHtml(note)}</p>` : ""}
            </td></tr>
          </table>
        </td></tr>
        <tr><td align="center" style="padding:18px 12px 0;color:#554e56;">
          <a href="mailto:support@pukki.gifts" style="color:#554e56;font-size:13px;text-decoration:none;">support@pukki.gifts</a>
          <p style="margin:6px 0 0;font-size:11px;line-height:1.5;letter-spacing:.4px;">&copy; ${new Date().getUTCFullYear()} WESWARE</p>
        </td></tr>
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
    </td></tr>
  </table>
</body>
</html>`;
  return { from: sender, subject, text, html };
}
