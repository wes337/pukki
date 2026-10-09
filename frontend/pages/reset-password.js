import useTranslate from "../hooks/useTranslate";
import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import { Button, Header, Loader } from "../components";
import { request } from "../actions/request";
import { accountDestination } from "../utils/account-navigation.mjs";
import Input from "../components/Input/Input";
import formStyles from "./login.module.scss";
import styles from "./recovery.module.scss";

export default function ResetPassword() {
  const translate = useTranslate();
  const router = useRouter();
  const invitation = typeof router.query.code === "string" ? { code: router.query.code } : {};
  const login = { pathname: "/login", query: invitation };
  const preview = process.env.NODE_ENV === "development" ? router.query.preview : null;
  const complete = preview === "complete";
  const expired = preview === "expired";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    if (data.get("password") !== data.get("confirmPassword")) {
      setError("Passwords don't match.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await request("/auth/reset-password", { method: "POST", body: { token: router.query.token, password: data.get("password") } });
      // The reset response sets a fresh HttpOnly session cookie. Replace this token-bearing URL.
      const session = await request("/auth/session");
      if (!session?.user) throw new Error("Please sign in to continue.");
      const destination = accountDestination("/login", session.user, invitation.code);
      window.location.replace(`${router.locale === "fi" ? "/fi" : ""}${destination}`);
    } catch (error) {
      setError(error.message);
      setBusy(false);
    }
  }

  if (busy) return <Loader />;

  return <section className={styles.recovery}>
    <Head><meta name="robots" content="noindex" /><meta name="referrer" content="no-referrer" /></Head>
    <Header title={complete ? "Password updated" : expired ? "Link expired" : "New password"} back={login} />
    {complete || expired ? <div className={`${formStyles.form} ${styles.confirmation}`}>
      {expired && <p role="alert">{translate("Request a new link to reset your password.")}</p>}
      <Button icon={complete ? "tag" : "greeting-card"} block
        onClick={() => router.push(complete ? { pathname: "/users", query: invitation } : { pathname: "/forgot-password", query: invitation })}>
        {translate(complete ? "Continue" : "Request new link")}
      </Button>
    </div> : <form className={`${formStyles.form} ${styles.requestForm}`} onSubmit={submit}>
      <label htmlFor="newPassword">{translate("New password")}
        <Input id="newPassword" name="password" type="password" autoComplete="new-password"
          placeholder={translate("Enter a new password")} minLength={6} maxLength={128} required autoFocus />
      </label>
      <label htmlFor="confirmNewPassword">{translate("Confirm password")}
        <Input id="confirmNewPassword" name="confirmPassword" type="password" autoComplete="new-password"
          placeholder={translate("Enter your password again")} maxLength={128} required />
      </label>
      {error && <p role="alert" className={formStyles.error}>{translate(error)}</p>}
      <Button type="submit" icon="tag" block disabled={busy || typeof router.query.token !== "string"}>{translate("Reset password")}</Button>
    </form>}
  </section>;
}
