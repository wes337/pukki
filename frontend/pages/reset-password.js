import Head from "next/head";
import { useRouter } from "next/router";
import { Button, Header } from "../components";
import Input from "../components/Input/Input";
import formStyles from "./login.module.scss";
import styles from "./recovery.module.scss";

export default function ResetPassword() {
  const router = useRouter();
  const invitation = typeof router.query.code === "string" ? { code: router.query.code } : {};
  const login = { pathname: "/login", query: invitation };
  const preview = process.env.NODE_ENV === "development" ? router.query.preview : null;
  const complete = preview === "complete";
  const expired = preview === "expired";

  return <section className={styles.recovery}>
    <Head><title>New password | Pukki</title><meta name="robots" content="noindex" /></Head>
    <Header title={complete ? "Password updated" : expired ? "Link expired" : "New password"} back={login} />
    {complete || expired ? <div className={`${formStyles.form} ${styles.confirmation}`}>
      {expired && <p role="alert">Request a new link to reset your password.</p>}
      <Button icon={complete ? "tag" : "greeting-card"} block
        onClick={() => router.push(complete ? login : { pathname: "/forgot-password", query: invitation })}>
        {complete ? "Sign in" : "Request new link"}
      </Button>
    </div> : <form className={formStyles.form} onSubmit={(event) => event.preventDefault()}>
      <label htmlFor="newPassword">New password
        <Input id="newPassword" name="password" type="password" autoComplete="new-password"
          placeholder="Enter a new password" minLength={12} maxLength={128} required autoFocus />
      </label>
      <label htmlFor="confirmNewPassword">Confirm password
        <Input id="confirmNewPassword" name="confirmPassword" type="password" autoComplete="new-password"
          placeholder="Enter your password again" maxLength={128} required />
      </label>
      {/* Enable once the Express endpoint validates and consumes reset tokens. */}
      <Button type="submit" icon="tag" block disabled>Reset password</Button>
    </form>}
  </section>;
}
