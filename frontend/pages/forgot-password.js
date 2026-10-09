import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import { Button, Header, Loader } from "../components";
import { request } from "../actions/request";
import Input from "../components/Input/Input";
import formStyles from "./login.module.scss";
import styles from "./recovery.module.scss";

export default function ForgotPassword() {
  const router = useRouter();
  const invitation = typeof router.query.code === "string" ? { code: router.query.code } : {};
  const login = { pathname: "/login", query: invitation };
  const [sent, setSent] = useState(process.env.NODE_ENV === "development" && router.query.preview === "sent");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      await request("/auth/request-password-reset", { method: "POST", body: { email: data.get("email"), ...invitation } });
      setSent(true);
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }

  if (busy) return <Loader />;

  return <section className={styles.recovery}>
    <Head><meta name="robots" content="noindex" /></Head>
    <Header title={sent ? "Check your email" : "Reset password"} back={login} />
    {sent ? <div className={`${formStyles.form} ${styles.confirmation}`}>
      <p role="status">If an account uses that email, you&apos;ll receive a reset link.</p>
      <Button icon="tag" block onClick={() => router.push(login)}>Sign in</Button>
      <button type="button" className={formStyles.forgotPassword}
        onClick={() => { setSent(false); router.replace({ pathname: "/forgot-password", query: invitation }); }}>Use a different email</button>
    </div> : <form className={`${formStyles.form} ${styles.requestForm}`} onSubmit={submit}>
      <label htmlFor="recoveryEmail">Email
        <Input id="recoveryEmail" name="email" type="email" autoComplete="email" autoCapitalize="none"
          spellCheck={false} placeholder="Enter your email" required autoFocus />
      </label>
      {error && <p role="alert" className={formStyles.error}>{error}</p>}
      <Button type="submit" icon="greeting-card" block disabled={busy}>Send reset link</Button>
    </form>}
  </section>;
}
