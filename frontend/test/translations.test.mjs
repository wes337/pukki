import { test } from "node:test";
import assert from "node:assert/strict";
import finnish from "../i18n/fi.mjs";
import { translateMessage } from "../i18n/translate.mjs";
import { formGenitiveCase, formAllativeCase } from "../utils/string.js";

test("translations retain English fallback, variables and intentionally omitted words", () => {
  const messages = {
    title: { en: "Your family", fi: "Perheesi" },
    invitation: { en: ({ name }) => `Join ${name}`, fi: ({ name }) => `Liity perheeseen ${name}` },
    to: { en: "to", fi: null },
  };
  assert.equal(translateMessage(messages, "fi", "title"), "Perheesi");
  assert.equal(translateMessage(messages, "en", "title"), "Your family");
  assert.equal(translateMessage(messages, "sv", "title"), "Your family");
  assert.equal(translateMessage(messages, "fi", "invitation", { name: "Virtaset" }), "Liity perheeseen Virtaset");
  assert.equal(translateMessage(messages, "fi", "to"), "");
  assert.equal(translateMessage(messages, "fi", "Unknown message"), "Unknown message");
  assert.equal(translateMessage(messages, "fi", "constructor"), "constructor");
});

test("auth errors use the same Finnish catalog as screen copy", () => {
  const messages = Object.fromEntries(Object.entries(finnish).map(([en, fi]) => [en, { en, fi }]));
  assert.equal(translateMessage(messages, "fi", "Password must be at least 6 characters."), "Salasanassa on oltava vähintään 6 merkkiä.");
  assert.equal(translateMessage(messages, "fi", "Passwords don't match."), "Salasanat eivät täsmää.");
  assert.equal(translateMessage(messages, "en", "Passwords don't match."), "Passwords don't match.");
});

test("consonant-ending first names get Finnish wishlist and recipient endings", () => {
  for (const [name, genitive, allative] of [
    ["Taylor", "Taylorin", "Taylorille"], ["Alex", "Alexin", "Alexille"],
    ["Sanna", "Sannan", "Sannalle"], ["Markus", "Markuksen", "Markukselle"],
  ]) {
    assert.equal(formGenitiveCase(name, "fi"), genitive);
    assert.equal(formAllativeCase(name, "fi"), allative);
  }
  assert.equal(formGenitiveCase("Taylor", "en"), "Taylor's");
});
