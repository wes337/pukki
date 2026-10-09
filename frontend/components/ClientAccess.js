import useTranslate from "../hooks/useTranslate";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../hooks/useAuth";
import { Button, Loader } from "./index";
import { accountDestination, publicAccountPages } from "../utils/account-navigation.mjs";

// This guard controls navigation. Express verifies authorization on every data request.
export default function ClientAccess({ children }) {
  const translate = useTranslate();
  const router = useRouter();
  const { session, loading, error, retry } = useAuth();
  const publicPage = publicAccountPages.includes(router.pathname);
  const preview = process.env.NODE_ENV === "development" && (
    (router.pathname === "/name" && router.query.preview === "1") ||
    (router.pathname === "/users/[uid]/[gid]" && router.query.preview === "1") ||
    (router.pathname === "/join" && ["accept", "signin", "signup", "joined", "other-family", "invalid"].includes(router.query.preview))
  );
  const destination = !loading && !error
    ? accountDestination(router.pathname, session?.user, router.query.code, preview) : null;
  useEffect(() => {
    if (destination) void router.replace(destination);
  }, [destination, router]);
  if (publicPage) return children;
  if (loading || !router.isReady || destination) return <Loader />;
  if (error) return <div><p role="alert">{translate(error)}</p><Button onClick={retry}>{router.locale === "fi" ? "Yritä uudelleen" : "Try again"}</Button></div>;
  return children;
}
