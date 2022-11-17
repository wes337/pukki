const withPWA = require("next-pwa");

module.exports = withPWA({
  pwa: {
    dest: "public",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "platform-lookaside.fbsbx.com",
      },
      {
        protocol: "https",
        hostname: "www.w3schools.com",
      },
    ],
  },
  i18n: {
    locales: ["en", "fi"],
    defaultLocale: "en",
  },
});
