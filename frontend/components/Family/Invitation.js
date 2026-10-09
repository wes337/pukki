import { useRef, useState } from "react";
import { useRouter } from "next/router";
import InvitationHeading from "./InvitationHeading";
import { useInvitation } from "../../hooks/useInvitation";
import { useSession } from "../../hooks/useAuth";
import { request } from "../../actions/request";
import Button from "../Button/Button";
import Loader from "../Loader/Loader";
import styles from "./Family.module.scss";

export default function Invitation({ code, preview }) {
  const router = useRouter();
  const session = useSession();
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const submitting = useRef(false);
  const { data: invitation, error: fetchError, mutate } = useInvitation(code, preview);
  const error = preview === "invalid" ? { status: 404 } : fetchError;
  const currentFamily = preview
    ? preview === "joined" ? "preview-family" : preview === "other-family" ? "another-family" : null
    : session.user.family_id;
  const leave = () => router.push(currentFamily ? "/users" : "/family");

  const accept = async () => {
    if (submitting.current) return;
    if (preview) {
      void router.push("/join?preview=joined");
      return;
    }
    submitting.current = true;
    setBusy(true);
    setSubmitError("");
    try {
      await request("/family/join", { method: "POST", body: { code } });
      // Refresh the session and discard the pre-membership data cache.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`${router.locale === "fi" ? "/fi" : ""}/users`);
    } catch (error) {
      setSubmitError(error.status === 409 ? "You already belong to a family."
        : [400, 404].includes(error.status) ? "This invitation is no longer available."
        : error.status === 429 ? "Too many attempts. Try again later." : "Couldn't join. Try again.");
      setBusy(false);
      submitting.current = false;
    }
  };

  if (busy || (code && !invitation && !error)) return <div role="status" aria-busy="true"><Loader /></div>;
  if (!code || error) {
    const invalid = !code || [400, 404].includes(error?.status);
    return <section className={`${styles.family} ${styles.acceptInvitation}`}>
      <p role="alert" className={styles.error}>{invalid ? "This invitation is invalid or no longer available."
        : error.status === 429 ? "Too many attempts. Try again later." : "Couldn't load the invitation."}</p>
      {!invalid && <Button onClick={() => mutate()}>Try again</Button>}
      <button className={styles.switch} onClick={leave}>Back</button>
    </section>;
  }

  const alreadyJoined = currentFamily === invitation.id;
  return <section className={`${styles.family} ${styles.acceptInvitation}`} aria-labelledby="invited-family">
    <InvitationHeading name={invitation.name} />
    <p>{alreadyJoined ? "You're already part of this family."
      : currentFamily ? "You already belong to another family."
      : "You've been invited to join this family."}</p>
    <div className={styles.form}>
      {currentFamily
        ? <Button block icon="santa-claus" onClick={leave}>{alreadyJoined ? "Open family" : "Go to my family"}</Button>
        : <Button type="submit" block icon="santa-hat" iconSize={32} disabled={busy} onClick={accept}>Join</Button>}
      {submitError && <p role="alert" className={styles.error}>{submitError}</p>}
    </div>
    {!currentFamily && <button className={styles.switch} disabled={busy} onClick={leave}>Not now</button>}
  </section>;
}
