import { test } from "node:test";
import assert from "node:assert/strict";
import { applyGiftChange } from "../utils/family-cache.mjs";

test("create, claim, release, edit and delete stay consistent across wishlist and shopping views", () => {
  const initial = { users: [{ user_id: "owner" }], gifts: [{ id: "other", name: "Book", user: "owner", claimed_by: null }] };
  const gift = { id: "new", name: "Scarf", user: "owner", claimed_by: null };
  let data = applyGiftChange(initial, gift);
  data = applyGiftChange(data, { ...gift, claimed_by: { user_id: "buyer" } });
  assert.equal(data.gifts.filter(g => g.claimed_by?.user_id === "buyer").length, 1);
  assert.equal(data.gifts.filter(g => g.user === "owner").length, 2);
  data = applyGiftChange(data, gift);
  assert.equal(data.gifts.filter(g => g.claimed_by).length, 0);
  data = applyGiftChange(data, { ...gift, name: "Apple", description: "Updated" });
  assert.deepEqual(data.gifts.map(g => g.name), ["Apple", "Book"]);
  data = applyGiftChange(data, null, gift.id);
  assert.deepEqual(data.gifts, initial.gifts);
  assert.equal(initial.gifts.length, 1);
  assert.equal(data.users, initial.users);
});

test("server redaction replaces old claim information without retaining stale fields", () => {
  const current = { users: [], gifts: [{ id: "gift", name: "Book", claimed_by: { user_id: "private" }, stale: true }] };
  const redacted = { id: "gift", name: "Book", claimed_by: null };
  assert.deepEqual(applyGiftChange(current, redacted).gifts, [redacted]);
  assert.equal(current.gifts[0].claimed_by.user_id, "private");
});

test("a mutation before the first load does not invent an incomplete family snapshot", () => {
  assert.equal(applyGiftChange(undefined, { id: "new", name: "Scarf" }), undefined);
});
