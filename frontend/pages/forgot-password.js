import Head from "next/head";
import { useRouter } from "next/router";
import { Button, Header } from "../components";
import Input from "../components/Input/Input";
import formStyles from "./login.module.scss";
import styles from "./recovery.module.scss";

export default function ForgotPassword() {
  const router = useRouter();
  const invitation = typeof router.query.code === "string" ? { code: router.query.code } : {};
  const login = { pathname: "/login", query: invitation };
  const sent = process.env.NODE_ENV === "development" && router.query.preview === "sent";

  return <section className={styles.recovery}>
    <Head><title>Reset password | Pukki</title><meta name="robots" content="noindex" /></Head>
    <Header title={sent ? "Check your email" : "Reset password"} back={login} />
    {sent ? <div className={`${formStyles.form} ${styles.confirmation}`}>
      <p role="status">If an account uses that email, you&apos;ll receive a reset link.</p>
      <Button icon="tag" block onClick={() => router.push(login)}>Sign in</Button>
      <button type="button" className={formStyles.forgotPassword}
        onClick={() => router.replace({ pathname: "/forgot-password", query: invitation })}>Use a different email</button>
    </div> : <form className={formStyles.form} onSubmit={(event) => event.preventDefault()}>
      <label htmlFor="recoveryEmail">Email
        <Input id="recoveryEmail" name="email" type="email" autoComplete="email" autoCapitalize="none"
          spellCheck={false} placeholder="Enter your email" required autoFocus />
      </label>
      {/* Enable once the Express reset endpoint and SendGrid are connected. */}
      <Button type="submit" icon="greeting-card" block disabled>Send reset link</Button>
    </form>}
  </section>;
}
