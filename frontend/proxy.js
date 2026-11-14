import { isIP } from "node:net";
import { NextResponse } from "next/server.js";
import { legacyApiUrl } from "./config.js";

// Keep Express on Fly while cookies and browser requests use the website's own origin.
export function proxy(request) {
  const secret = process.env.API_PROXY_SECRET;
  // Vercel overwrites this header with the actual visitor's IP before invoking Proxy.
  const clientIp = request.headers.get("x-vercel-forwarded-for")?.trim();
  if (process.env.VERCEL !== "1" || !secret || secret.length < 32 || !clientIp || !isIP(clientIp)) {
    return NextResponse.json({ error: "Please try again shortly." }, {
      status: 503, headers: { "Cache-Control": "private, no-store" },
    });
  }

  const headers = new Headers(request.headers);
  // Overwrite caller-supplied values. Express trusts the IP only with this server-only secret.
  headers.set("x-pukki-proxy-secret", secret);
  headers.set("x-pukki-client-ip", clientIp);
  const destination = new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, legacyApiUrl);
  return NextResponse.rewrite(destination, { request: { headers } });
}

export const config = {
  matcher: [{ source: "/v1/:path*", locale: false }],
};
