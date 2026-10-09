import { test } from "node:test";
import assert from "node:assert/strict";
import { accountDestination } from "../utils/account-navigation.mjs";

test("new accounts must give a name before family setup or invitation acceptance", () => {
  const unnamed = { name: "", family_id: null };
  for (const path of ["/", "/login", "/family", "/users", "/gifts", "/join"]) {
    assert.equal(accountDestination(path, unnamed, "ABC234"), "/name?code=ABC234");
  }
  assert.equal(accountDestination("/name", unnamed), null);
  assert.equal(accountDestination("/family", null), "/login");
  assert.equal(accountDestination("/name", null, "ABC234"), "/login?code=ABC234");
});

test("saving a name continues to family setup or the preserved invitation", () => {
  const named = { name: "Alex", family_id: null };
  assert.equal(accountDestination("/name", named), "/family");
  assert.equal(accountDestination("/name", named, "ABC234"), "/join?code=ABC234");
  assert.equal(accountDestination("/join", named, "ABC234"), null);
  assert.equal(accountDestination("/login", { ...named, family_id: "existing" }), "/users");
  assert.equal(accountDestination("/name", named, "https://other.example"), "/join?code=https%3A%2F%2Fother.example");
});

test("public recovery pages and development previews stay accessible", () => {
  assert.equal(accountDestination("/forgot-password", { name: "" }), null);
  assert.equal(accountDestination("/privacy", null), null);
  assert.equal(accountDestination("/name", null, null, true), null);
});
