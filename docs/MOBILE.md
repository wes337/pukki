# Mobile app

`mobile/` is an Expo + React Native app for iOS and Android. Its WebView opens `https://pukki.gifts`, so the website supplies the screens and calls the existing Express API. Web deployments appear in the app without rebuilding the native shell.

## Run it

From the repository root:

```sh
pnpm install
pnpm dev:mobile
```

Scan the terminal's QR code with Expo Go on a phone on the same network. Use an Expo Go version compatible with SDK 57. This opens the **production website and real accounts/data**, even in a development shell. No backend env file is needed by the mobile app.

`pnpm --filter pukki-mobile android` builds locally with an installed Android SDK. `pnpm --filter pukki-mobile ios` requires macOS and Xcode. Expo Go can preview the UI, but testing the custom URL scheme and HTTPS app links requires an installed native build.

The app uses the existing Santa icon, Amore Christmas font, theme colors and candy-cane loader. Native error recovery shows a Retry button. The WebView uses its persistent cookie store; credentials are not copied into native storage. Android Back and iOS back gestures navigate the web history. External product links open in the phone's browser; email links open the mail app. Only the exact HTTPS Pukki origin stays embedded.

Settings live in `mobile/src/config.json` and `mobile/app.config.ts`. No mobile secrets are required. React and React Native follow Expo's compatible versions independently of Next.js. The matching `react-dom` dev dependency satisfies Expo tooling's peer dependency without taking the frontend's different React version.

## Invitations

Installed builds accept `pukki://join?code=ABC234` and `pukki://fi/join?code=ABC234`. They open the same invitation flow as the website, including signup and the explicit Join action. Legacy eight-character codes also work. Cold launches and links received while the app is open are handled.

Native configuration declares HTTPS links for `/join` and `/fi/join` on `pukki.gifts`. **Domain verification is pending real signing details.** Until that is finished, shared HTTPS invitations keep working in the browser.

Before enabling verified HTTPS links:

- Get the Apple developer Team ID and confirm the bundle ID `gifts.pukki.app`. Publish `frontend/public/.well-known/apple-app-site-association` using that Team ID and only the invitation routes.
- Get the production Android signing certificate SHA-256 fingerprint, including the Play app-signing fingerprint when using Google Play. Publish `frontend/public/.well-known/assetlinks.json` for `gifts.pukki.app`.
- Deploy the association files with JSON content types and no redirects. Test installed builds on both platforms.

Do not put signing keys in those files. Team IDs and certificate fingerprints are public configuration. The signing credentials themselves belong in the build service's secret storage.

## Builds and checks

```sh
pnpm --filter pukki-mobile typecheck
pnpm --filter pukki-mobile test
pnpm --filter pukki-mobile run doctor
pnpm build:mobile
```

`build:mobile` exports the iOS and Android JavaScript bundles into `mobile/dist`. It does not produce an installable IPA or APK. The mobile GitHub workflow runs these checks on relevant changes. The existing Vercel/Fly workflow still deploys the website and backend only.

`mobile/eas.json` defines a production build profile. To create signed builds, sign in to Expo, link this directory to the intended EAS project, and run `eas build --platform all --profile production` from `mobile/`. Save the resulting public EAS project ID in app config. There is no staging profile. Store submission and signing accounts are not configured by this change.

Before a store release, test on real iOS and Android devices: sign in and relaunch, sign out, cold/warm invitation links, keyboard and safe areas, Back, copy code/link, external gift links, airplane-mode Retry, and returning from the background. JavaScript export checks cannot verify native cookie or device behavior.
