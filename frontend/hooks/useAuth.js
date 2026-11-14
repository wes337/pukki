import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { request } from "../actions/request";
import { legacyApiUrl } from "../config";
import { runApiRequest } from "../utils/auth-requests.mjs";
import { useRouter } from "next/router";
const AuthContext = createContext({ session: null, loading: true, error: "" });
export function AuthProvider({ children }) {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const sessionRead = useRef(0);
  const triedLegacySession = useRef(false);
  const replaceSession = useCallback((value) => {
    // A completed auth action takes precedence over an older session request.
    sessionRead.current += 1;
    setSession(value);
    setError("");
    setLoading(false);
  }, []);
  const refresh = useCallback(async () => {
    const read = ++sessionRead.current;
    try {
      const value = await request("/auth/session");
      if (read === sessionRead.current) {
        setSession(value);
        setError("");
      }
      return value;
    } finally {
      if (read === sessionRead.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    const read = ++sessionRead.current;
    const legacyRequest = new AbortController();
    const current = () => read === sessionRead.current;
    const migrated = () => document.cookie.split(";").some((cookie) => cookie.trim() === "pukki_session_migrated=1");
    async function load() {
      let value = await request("/auth/session");
      // Transfer an existing API-domain session once when the new cookie is absent.
      if (!value && current() && process.env.NODE_ENV === "production" && !triedLegacySession.current && !migrated()) {
        triedLegacySession.current = true;
        try {
          const transferred = await runApiRequest("/auth/migrate-session", async () => {
            if (!current() || migrated()) return false;
            const timeout = setTimeout(() => legacyRequest.abort(), 5000);
            try {
              const response = await fetch(`${legacyApiUrl}/auth/migrate-session`, {
                method: "POST", credentials: "include",
                headers: { "Content-Type": "application/json" }, body: "{}",
                signal: legacyRequest.signal,
              });
              return response.ok && (await response.json()).ok;
            } finally {
              clearTimeout(timeout);
            }
          });
          if (transferred && current() && !migrated()) value = await request("/auth/session");
        } catch {
          // A failed legacy lookup must still leave sign-in available.
        }
      }
      if (current()) {
        setSession(value);
        setError("");
      }
    }
    load()
      .catch((error) => { if (current()) setError(error.message); })
      .finally(() => { if (current()) setLoading(false); });
    return () => {
      sessionRead.current += 1;
      legacyRequest.abort();
    };
  }, [attempt]);
  useEffect(() => {
    // Renew returning visits and pick up sign-out or password reset from another tab/device.
    const onFocus = () => { void refresh().catch(() => {}); };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);
  const retry = () => {
    setLoading(true);
    setError("");
    setAttempt((value) => value + 1);
  };
  const updateUser = (user) => setSession((current) => current ? { ...current, user } : current);
  // Local invitation previews can show the signed-out shell without ending the real session.
  const signedOutPreview = process.env.NODE_ENV === "development" && router.pathname === "/join"
    && ["signin", "signup"].includes(router.query.preview);
  return <AuthContext.Provider value={{ session: signedOutPreview ? null : session, loading, error, retry, refresh, replaceSession, updateUser }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
export const useSession = () => useAuth().session;
export const useUser = () => useSession()?.user;
