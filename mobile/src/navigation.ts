import { appScheme, siteOrigin } from "./config.json";

function parseUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    return url.username || url.password ? null : url;
  } catch {
    return null;
  }
}

export function isSiteUrl(value: string): boolean {
  return parseUrl(value)?.origin === siteOrigin;
}

export function isExternalUrl(value: string): boolean {
  const url = parseUrl(value);
  return !!url && ["https:", "http:", "mailto:"].includes(url.protocol) && !isSiteUrl(value);
}

// Deep links only enter invitation screens. Ordinary in-app navigation can use any site route.
export function invitationUrl(value: string): string | null {
  const url = parseUrl(value);
  if (!url) return null;
  let path = url.pathname;
  if (url.protocol === `${appScheme}:`) {
    if (url.port) return null;
    path = `/${url.host}${url.pathname}`.replace(/\/{2,}/g, "/");
  } else if (url.origin !== siteOrigin) {
    return null;
  }
  if (path !== "/join" && path !== "/fi/join") return null;
  const code = url.searchParams.get("code");
  if (!code || !/^[a-z0-9]{6}(?:[a-z0-9]{2})?$/i.test(code)) return null;
  const target = new URL(path, siteOrigin);
  target.searchParams.set("code", code.toUpperCase());
  return target.href;
}
