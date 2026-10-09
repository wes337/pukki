import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "service-worker/index.js",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

export default withSerwist({
  // Bundle SWR consistently for Pages Router server rendering and the browser.
  transpilePackages: ["swr"],
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "Referrer-Policy", value: "no-referrer" }] }];
  },
  i18n: {
    locales: ["en", "fi"],
    defaultLocale: "en",
  },
});
