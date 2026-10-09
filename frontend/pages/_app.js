import useTranslate from "../hooks/useTranslate";
import { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

import { AuthProvider } from "../hooks/useAuth";
import ClientAccess from "../components/ClientAccess";
import PageTitle from "../components/PageTitle";
import DataProvider from "../components/DataProvider";
import { ToastProvider } from "../components/Toast/Toast";
import { siteOrigin, siteDescription } from "../config";
import {
  SignOut,
  Card,
  Footer,
  Snow,
  SnowyHills,
  ChristmasTree,
} from "../components";
import "../styles/index.scss";

const pageTitles = {
  "/": "Family wishlists",
  "/login": "Sign in",
  "/name": "What's your name?",
  "/join": "Family invitation",
  "/family": "Your family",
  "/users": "Family wishlists",
  "/users/[uid]": "Wishlist",
  "/users/[uid]/gift": "Add a gift",
  "/users/[uid]/[gid]": "Gift details",
  "/users/[uid]/[gid]/edit": "Edit gift",
  "/gifts": "Gifts I'm giving",
  "/forgot-password": "Reset password",
  "/reset-password": "New password",
  "/about": "About",
  "/privacy": "Privacy Policy",
  "/delete": "Delete Data",
  "/_error": "Something went wrong",
};

export default function MyApp({ Component, pageProps }) {
  const translate = useTranslate();
  const router = useRouter();
  useEffect(() => {
    const iOS =
      !!navigator.platform && /i(Phone|Pad|Pod)/.test(navigator.platform);
    if (iOS) {
      document
        .querySelector('link[rel="manifest"]')
        .setAttribute("rel", "no-on-ios");
    }
  }, []);

  return (
    <ToastProvider>
      <PageTitle>{pageTitles[router.pathname]}</PageTitle>
      <Head>
        <meta name="description" content={translate(siteDescription)} key="description" />
        <meta property="og:site_name" content="Pukki" key="og-site-name" />
        <meta property="og:type" content="website" key="og-type" />
        <meta property="og:title" content="Pukki" key="og-title" />
        <meta property="og:description" content={translate(siteDescription)} key="og-description" />
        {/* Static invitation HTML has no query string; let clients retain the shared URL and its code. */}
        {router.pathname !== "/join" && <meta property="og:url" content={`${siteOrigin}${router.asPath.split(/[?#]/)[0]}`} key="og-url" />}
        <meta property="og:image" content={`${siteOrigin}/images/social/pukki-wide.png`} key="og-image-wide" />
        <meta property="og:image:type" content="image/png" key="og-image-wide-type" />
        <meta property="og:image:width" content="1200" key="og-image-wide-width" />
        <meta property="og:image:height" content="630" key="og-image-wide-height" />
        <meta property="og:image:alt" content="Pukki's Santa logo and red lettering above snowy hills." key="og-image-wide-alt" />
        <meta property="og:image" content={`${siteOrigin}/images/social/pukki-square.png`} key="og-image-square" />
        <meta property="og:image:type" content="image/png" key="og-image-square-type" />
        <meta property="og:image:width" content="1200" key="og-image-square-width" />
        <meta property="og:image:height" content="1200" key="og-image-square-height" />
        <meta property="og:image:alt" content="Pukki's Santa logo above red lettering and snowy hills." key="og-image-square-alt" />
        <meta name="twitter:card" content="summary_large_image" key="twitter-card" />
        <meta name="twitter:title" content="Pukki" key="twitter-title" />
        <meta name="twitter:description" content={translate(siteDescription)} key="twitter-description" />
        <meta name="twitter:image" content={`${siteOrigin}/images/social/pukki-wide.png`} key="twitter-image" />
        <meta name="twitter:image:alt" content="Pukki's Santa logo and red lettering above snowy hills." key="twitter-image-alt" />
      </Head>
      <div className="main">
        <main>
          <AuthProvider>
            <DataProvider>
            <SignOut />
            <Card>
              <ClientAccess><Component key={router.asPath} {...pageProps} /></ClientAccess>
            </Card>
            <Footer />
            </DataProvider>
          </AuthProvider>
        </main>
      </div>
      <div className="art">
        <Snow />
        <ChristmasTree />
        <SnowyHills />
      </div>
    </ToastProvider>
  );
}
