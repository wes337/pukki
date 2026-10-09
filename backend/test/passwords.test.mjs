import { test } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "#app/modules/passwords.js";

test("password hashes are salted and reject incorrect passwords", async () => {
  const password = "a long test password";
  const first = await hashPassword(password);
  const second = await hashPassword(password);
  assert.notEqual(first, second);
  assert.equal(await verifyPassword(password, first), true);
  assert.equal(await verifyPassword("wrong password", first), false);
  assert.equal(await verifyPassword(password, "invalid"), false);
});
