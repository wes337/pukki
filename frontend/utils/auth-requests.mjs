let pendingAuth = Promise.resolve();

// Keep session-cookie responses ordered across tabs, or within this tab on older browsers.
export function runApiRequest(url, action) {
  if (!url.startsWith("/auth/")) return action();
  const locks = globalThis.navigator?.locks;
  if (locks?.request) return locks.request("pukki-auth", action);
  const result = pendingAuth.then(action);
  pendingAuth = result.catch(() => {});
  return result;
}
