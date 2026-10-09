import { mkdir, writeFile } from "node:fs/promises";
import { passwordResetEmail } from "./password-reset.js";
import { welcomeEmail } from "./welcome.js";
import { siteOrigin } from "./layout.js";

// Static development preview only. No secrets, database, or email service are used.
const output = new URL("../../../frontend/public/email-previews/", import.meta.url);
const emails = {
  "password-reset": passwordResetEmail("https://pukki.gifts/reset-password?token=preview-not-a-real-token"),
  welcome: welcomeEmail(),
};
await mkdir(output, { recursive: true });
for (const [name, email] of Object.entries(emails)) {
  // Preview current local artwork instead of the last deployed images.
  const html = email.html.replaceAll(`src="${siteOrigin}/images/`, 'src="/images/');
  await writeFile(new URL(`${name}.html`, output), html);
  console.log(`${email.subject}: http://localhost:3000/email-previews/${name}.html`);
}
