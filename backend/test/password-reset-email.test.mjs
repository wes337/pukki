import { test } from "node:test";
import assert from "node:assert/strict";
import { passwordResetEmail } from "#app/emails/password-reset.js";

test("reset email shares its destination across HTML and plain text and escapes attributes", () => {
  const url = "https://pukki.gifts/reset-password?token=example&code=ABC234";
  const email = passwordResetEmail(url);
  assert.match(email.html, /href="https:\/\/pukki.gifts\/reset-password\?token=example&amp;code=ABC234"/);
  assert.ok(email.text.includes(url));
  assert.equal(email.from.email, "support@pukki.gifts");
  assert.equal(email.subject, "Reset your Pukki password");
});

test("reset email rejects destinations outside the reset flow", () => {
  for (const url of [
    "https://other.example/reset-password?token=example",
    "https://pukki.gifts.evil.example/reset-password?token=example",
    "https://user:password@pukki.gifts/reset-password?token=example",
    "http://pukki.gifts/reset-password?token=example",
    "https://pukki.gifts/login?token=example",
    "https://pukki.gifts/reset-password",
  ]) assert.throws(() => passwordResetEmail(url));
});
