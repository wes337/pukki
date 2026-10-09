import type { ExpoConfig } from "expo/config";
import { appScheme, colors } from "./src/config.json";

const config: ExpoConfig = {
  name: "Pukki",
  slug: "pukki",
  version: "1.0.0",
  platforms: ["ios", "android"],
  scheme: appScheme,
  orientation: "portrait",
  userInterfaceStyle: "light",
  icon: "../frontend/public/images/logo512.png",
  backgroundColor: colors.background,
  ios: {
    bundleIdentifier: "gifts.pukki.app",
    supportsTablet: false,
    associatedDomains: ["applinks:pukki.gifts"],
    infoPlist: { ITSAppUsesNonExemptEncryption: false },
  },
  android: {
    package: "gifts.pukki.app",
    softwareKeyboardLayoutMode: "resize",
    intentFilters: [{
      action: "VIEW",
      autoVerify: true,
      category: ["BROWSABLE", "DEFAULT"],
      data: ["/join", "/fi/join"].map((path) => ({ scheme: "https", host: "pukki.gifts", path })),
    }],
  },
  plugins: [
    "expo-font",
    ["expo-splash-screen", {
      backgroundColor: colors.background,
      image: "../frontend/public/images/icons/santa-claus.png",
      imageWidth: 120,
    }],
  ],
};

export default config;
