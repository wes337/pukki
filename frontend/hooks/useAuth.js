import { createContext, useContext, useEffect, useState } from "react";
import { request } from "../actions/request";
import { useRouter } from "next/router";
const AuthContext = createContext({ session: null, loading: true, error: "" });
export function AuthProvider({ children }) {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    request("/auth/session")
      .then((value) => { if (active) setSession(value); })
      .catch((error) => { if (active) setError(error.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);
  const retry = () => {
    setLoading(true);
    setError("");
    setAttempt((value) => value + 1);
  };
  const updateUser = (user) => setSession((current) => current ? { ...current, user } : current);
  // Local invitation previews can show the signed-out shell without ending the real session.
  const signedOutPreview = process.env.NODE_ENV === "development" && router.pathname === "/join"
    && ["signin", "signup"].includes(router.query.preview);
  return <AuthContext.Provider value={{ session: signedOutPreview ? null : session, loading, error, retry, updateUser }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
export const useSession = () => useAuth().session;
export const useUser = () => useSession()?.user;
