import useTranslate from "../hooks/useTranslate";
import Input from "../components/Input/Input";
import PageTitle from "../components/PageTitle";
import { useRef, useState } from "react";
import { useRouter } from "next/router";
import { request } from "../actions/request";
import { Button, Loader } from "../components";
import InvitationHeading from "../components/Family/InvitationHeading";
import { useInvitation } from "../hooks/useInvitation";
import familyStyles from "../components/Family/Family.module.scss";
import styles from "./login.module.scss";
export default function Login({ initialSignup = false, preview = false }) {
  const translate = useTranslate();
  const router = useRouter();
  const { locale, query } = router;
  const inviteCode = typeof query.code === "string" ? query.code.slice(0, 32) : "";
  const hasInvitation = Boolean(inviteCode || preview || router.pathname === "/join");
  const { data: invitation, error: invitationError, mutate: retryInvitation } = useInvitation(inviteCode, preview);
  const [signup, setSignup] = useState(initialSignup);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const confirmPasswordRef = useRef(null);
  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    if (signup && data.get("password") !== data.get("confirmPassword")) {
      setError("");
      setPasswordMismatch(true);
      confirmPasswordRef.current?.focus();
      return;
    }
    setPasswordMismatch(false);
    setBusy(true);
    setError("");
    try {
      if (preview) {
        await router.push("/join?preview=accept");
        return;
      }
      await request(`/auth/${signup ? "signup" : "login"}`, {
        method: "POST", body: { email: data.get("email"), password: data.get("password") },
      });
      const code = typeof query.code === "string" ? query.code.slice(0, 32) : "";
      const destination = code ? `/join?code=${encodeURIComponent(code)}` : "/users";
      // Reload to replace the cached session after an account or membership change.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`${locale === "fi" ? "/fi" : ""}${destination}`);
    } catch (error) { setError(error.message); setBusy(false); }
  };
  if (hasInvitation && inviteCode && !invitation && !invitationError) return <Loader />;
  if (hasInvitation && ((!inviteCode && !preview) || invitationError)) return <div className={styles.form}>
    <p role="alert" className={familyStyles.error}>{translate(!inviteCode || [400, 404].includes(invitationError?.status)
      ? "This invitation is invalid or no longer available."
      : invitationError.status === 429 ? "Too many attempts. Try again later." : "Couldn't load the invitation.")}</p>
    {invitationError && ![400, 404].includes(invitationError.status) && <Button onClick={() => retryInvitation()}>{translate("Try again")}</Button>}
    <button type="button" className={styles.switch} onClick={() => router.push("/login")}>{translate("Back to sign in")}</button>
  </div>;
  return <form className={styles.form} onSubmit={submit} aria-busy={busy}>
    <PageTitle>{signup ? "Create account" : "Sign in"}</PageTitle>
    {hasInvitation && invitation && <section className={`${familyStyles.family} ${familyStyles.acceptInvitation}`} aria-labelledby="invited-family">
      <InvitationHeading name={invitation.name} />
      <p>{translate("invitation-signup", { name: invitation.name })}</p>
    </section>}
    <label htmlFor="email">{translate("Email")}
      <Input id="email" name="email" type="email" autoComplete={signup ? "email" : "username"} autoCapitalize="none" spellCheck={false}
        placeholder={translate("Enter your email")}
        required maxLength={254} disabled={busy} />
    </label>
    <div className={styles.passwordField}>
      <div className={styles.passwordLabelRow}>
        <label htmlFor="password">{translate("Password")}</label>
        {!signup && <button type="button" className={styles.forgotPassword} disabled={busy}
          onClick={() => router.push({ pathname: "/forgot-password", query: typeof query.code === "string" ? { code: query.code } : {} })}>{translate("Forgot password?")}</button>}
      </div>
      <Input id="password" name="password" type="password" autoComplete={signup ? "new-password" : "current-password"}
        placeholder={translate("Enter your password")}
        onChange={() => setPasswordMismatch(false)}
        required minLength={6} maxLength={128} disabled={busy} />
    </div>
    {signup && <label htmlFor="confirmPassword">{translate("Confirm password")}
      <Input ref={confirmPasswordRef} id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password"
        placeholder={translate("Enter your password again")} required maxLength={128} disabled={busy}
        aria-invalid={passwordMismatch || undefined}
        aria-describedby={passwordMismatch ? "confirm-password-error" : undefined}
        onChange={() => setPasswordMismatch(false)} />
      {passwordMismatch && <span id="confirm-password-error" role="alert" className={styles.error}>{translate("Passwords don't match.")}</span>}
    </label>}
    {error && <p role="alert" className={styles.error}>{translate(error)}</p>}
    <Button type="submit" variant={signup ? "secondary" : "primary"} icon={signup ? "greeting-card" : "tag"} block disabled={busy}>{signup ? translate("Create account") : translate("Sign in")}</Button>
    <div className={styles.accountPrompt}>
      <span>{signup ? translate("Already have an account?") : translate("No account?")} </span>
      <button className={`${styles.switch}${signup ? ` ${styles.signIn}` : ""}`} type="button" disabled={busy}
        onClick={() => { setSignup(!signup); setError(""); setPasswordMismatch(false); }}>{signup ? translate("Sign in") : translate("Create an account")}</button>
    </div>
  </form>;
}
