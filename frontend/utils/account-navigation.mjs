export const publicAccountPages = ["/about", "/privacy", "/delete", "/forgot-password", "/reset-password", "/404", "/_error"];

// Keep invitation codes across authentication and the first-name step, never arbitrary redirects.
export function accountDestination(pathname, user, code, preview = false) {
  if (publicAccountPages.includes(pathname) || preview) return null;
  const invitation = typeof code === "string" && code ? `?code=${encodeURIComponent(code.slice(0, 32))}` : "";
  const needsFamily = pathname.startsWith("/users") || pathname === "/gifts";
  const needsAccount = needsFamily || ["/family", "/name"].includes(pathname);
  if (!user) return needsAccount ? `/login${invitation}` : null;
  if (!user.name?.trim()) return pathname === "/name" ? null : `/name${invitation}`;
  if (["/name", "/login"].includes(pathname)) return invitation ? `/join${invitation}` : user.family_id ? "/users" : "/family";
  return needsFamily && !user.family_id ? "/family" : null;
}
