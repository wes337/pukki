import { strict as assert } from "node:assert";
import { test } from "node:test";
import { invitationUrl, isExternalUrl, isSiteUrl } from "../src/navigation";

test("invites retain their code and locale across native and HTTPS links", () => {
  for (const url of ["pukki://join?code=abc234", "pukki:///join?code=abc234", "https://pukki.gifts/join?code=abc234"]) {
    assert.equal(invitationUrl(url), "https://pukki.gifts/join?code=ABC234");
  }
  assert.equal(invitationUrl("pukki://fi/join?code=abc23456"), "https://pukki.gifts/fi/join?code=ABC23456");
  assert.equal(invitationUrl("https://pukki.gifts/fi/join?code=abc234&preview=signup&redirect=https://example.com"), "https://pukki.gifts/fi/join?code=ABC234");
});

test("invalid invites and untrusted links cannot become WebView sources", () => {
  for (const url of [
    "https://pukki.gifts.evil.example/join?code=ABC234",
    "https://evil.example/join?code=ABC234",
    "https://user:password@pukki.gifts/join?code=ABC234",
    "http://pukki.gifts/join?code=ABC234",
    "pukki://users?code=ABC234",
    "pukki://join?code=ABC",
    "pukki://join?code=ABC2345",
    "pukki://join?code=ABC23%21",
    "pukki://join",
    "javascript:alert(1)",
  ]) assert.equal(invitationUrl(url), null, url);
});

test("only exact production origin is embedded; supported external links leave the app", () => {
  assert.equal(isSiteUrl("https://pukki.gifts/users/123"), true);
  for (const url of ["https://shop.example/gift", "http://shop.example/gift", "mailto:support@pukki.gifts"]) {
    assert.equal(isExternalUrl(url), true);
    assert.equal(isSiteUrl(url), false);
  }
  for (const url of ["javascript:alert(1)", "file:///etc/passwd", "data:text/html,hi", "intent://evil", "https://user@pukki.gifts/"]) {
    assert.equal(isExternalUrl(url), false);
    assert.equal(isSiteUrl(url), false);
  }
  assert.equal(isExternalUrl("https://pukki.gifts/"), false);
});
