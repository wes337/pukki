import useTranslate from "../hooks/useTranslate";
import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../hooks/useAuth";
import { request } from "../actions/request";
import { Button, Loader } from "../components";
import Input from "../components/Input/Input";
import formStyles from "./login.module.scss";
import styles from "./name.module.scss";

export default function Name() {
  const translate = useTranslate();
  const router = useRouter();
  const { updateUser } = useAuth();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const preview = process.env.NODE_ENV === "development" && router.query.preview === "1";

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    if (!name.trim()) { setError("Enter your first name."); return; }
    if (preview) return;
    setBusy(true);
    setError("");
    try {
      const user = await request("/profile/name", { method: "PATCH", body: { name } });
      // ClientAccess continues to family setup or the preserved invitation when the name is saved.
      updateUser(user);
    } catch (error) { setError(error.message); setBusy(false); }
  }

  if (busy) return <Loader />;
  return <section className={styles.onboarding}>
    <Head><meta name="robots" content="noindex" /></Head>
    <h1 id="name-heading">{translate("What's your name?")}</h1>
    <form className={formStyles.form} onSubmit={submit}>
      <Input name="name" aria-labelledby="name-heading" autoComplete="given-name" autoFocus required maxLength={80}
        placeholder={translate("First name")} value={name} onChange={(event) => setName(event.target.value)} />
      {error && <p role="alert" className={formStyles.error}>{translate(error)}</p>}
      <Button type="submit" icon="santa-hat" block disabled={busy || preview}>{translate("Continue")}</Button>
    </form>
  </section>;
}
