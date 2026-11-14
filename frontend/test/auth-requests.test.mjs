import { test } from "node:test";
import assert from "node:assert/strict";
import { runApiRequest } from "../utils/auth-requests.mjs";

function setLocks(t, locks) {
  const original = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: { locks } });
  t.after(() => {
    if (original) Object.defineProperty(globalThis, "navigator", original);
    else delete globalThis.navigator;
  });
}

test("session responses finish before later auth writes while other reads stay parallel", async (t) => {
  setLocks(t, undefined);
  let finishSession;
  const sessionBody = new Promise((resolve) => { finishSession = resolve; });
  const events = [];
  const session = runApiRequest("/auth/session", async () => {
    events.push("session started");
    await sessionBody;
    events.push("session finished");
    return "old session";
  });
  const login = runApiRequest("/auth/login", async () => {
    events.push("login");
    return "new session";
  });
  assert.equal(await runApiRequest("/users", async () => "family"), "family");
  assert.deepEqual(events, ["session started"]);
  finishSession();
  assert.deepEqual(await Promise.all([session, login]), ["old session", "new session"]);
  assert.deepEqual(events, ["session started", "session finished", "login"]);
});

test("failed auth requests release the queue for the next attempt", async (t) => {
  setLocks(t, undefined);
  const failed = runApiRequest("/auth/login", async () => { throw new Error("Network failure"); });
  const retry = runApiRequest("/auth/session", async () => "session");
  await assert.rejects(failed, /Network failure/);
  assert.equal(await retry, "session");
});

test("auth requests share the browser lock across tabs when available", async (t) => {
  const names = [];
  setLocks(t, {
    request(name, action) {
      names.push(name);
      return Promise.resolve().then(action);
    },
  });
  assert.equal(await runApiRequest("/auth/logout", async () => "signed out"), "signed out");
  assert.equal(await runApiRequest("/auth/migrate-session", async () => "migrated"), "migrated");
  assert.deepEqual(names, ["pukki-auth", "pukki-auth"]);
});
