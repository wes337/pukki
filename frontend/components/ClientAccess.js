import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../hooks/useAuth";
import { Button, Loader } from "./index";

// This guard controls navigation. Express verifies authorization on every data request.
export default function ClientAccess({ children }) {
  const router = useRouter();
  const { session, loading, error, retry } = useAuth();
  const publicPage = ["/about", "/privacy", "/delete", "/forgot-password", "/reset-password", "/404", "/_error"].includes(router.pathname);
  const needsFamily = router.pathname.startsWith("/users") || router.pathname === "/gifts";
  const needsAccount = needsFamily || router.pathname === "/family";
  const destination = !loading && !error && needsAccount
    ? !session ? "/login" : needsFamily && !session.user.family_id ? "/family" : null
    : null;
  useEffect(() => {
    if (destination) void router.replace(destination);
  }, [destination, router]);
  if (publicPage) return children;
  if (loading || !router.isReady || destination) return <Loader />;
  if (error) return <div><p role="alert">{error}</p><Button onClick={retry}>{router.locale === "fi" ? "Yritä uudelleen" : "Try again"}</Button></div>;
  return children;
}
