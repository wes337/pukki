import { Serwist } from "serwist";

const worker = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  // Keep sessions, family data and other API responses out of offline caches.
  runtimeCaching: [],
});

worker.addEventListeners();
