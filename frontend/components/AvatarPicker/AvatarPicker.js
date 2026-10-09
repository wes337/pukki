import useTranslate from "../../hooks/useTranslate";
import { useEffect, useRef, useState } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import { useSWRConfig } from "swr";
import { request } from "../../actions/request";
import { useAuth, useUser } from "../../hooks/useAuth";
import { familyDataKey } from "../../hooks/useFamilyData";
import Avatar from "../Avatar/Avatar";
import Button from "../Button/Button";
import Loader from "../Loader/Loader";
import { useToast } from "../Toast/Toast";
import styles from "./AvatarPicker.module.scss";

export default function AvatarPicker({ onClose }) {
  const translate = useTranslate();
  const dialog = useRef(null);
  const saving = useRef(false);
  const user = useUser();
  const { updateUser } = useAuth();
  const { mutate } = useSWRConfig();
  const showToast = useToast();
  const [avatars, setAvatars] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement;
    const overflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      trigger?.focus();
    };
  }, []);

  useEffect(() => {
    let active = true;
    request("/profile/avatar")
      .then((value) => { if (active) setAvatars(value); })
      .catch(() => { if (active) setError("Couldn't load avatars."); });
    return () => { active = false; };
  }, [attempt]);

  async function selectAvatar(url) {
    if (saving.current) return;
    if (url === user.avatar_url) return onClose();
    saving.current = true;
    setBusy(true);
    setError("");
    try {
      const updated = await request("/profile/avatar", { method: "PATCH", body: { avatar_url: url } });
      updateUser(updated);
      // Refresh member avatars without discarding the currently displayed lists.
      void mutate(familyDataKey).catch(() => {});
      showToast(translate("Avatar updated."));
      onClose();
    } catch {
      setError("Couldn't save avatar. Try again.");
      setBusy(false);
      saving.current = false;
    }
  }

  return <dialog ref={dialog} className={styles.dialog} aria-labelledby="avatar-picker-title"
    onCancel={(event) => { event.preventDefault(); if (!saving.current) onClose(); }}
    onClick={(event) => { if (event.target === event.currentTarget && !saving.current) onClose(); }}>
    <div className={styles.panel}>
      <header className={styles.header}>
        <h2 id="avatar-picker-title">{translate("Choose your avatar")}</h2>
        <button type="button" className={styles.close} aria-label={translate("Close avatar picker")} disabled={busy} onClick={onClose}>
          <FiX size={24} aria-hidden="true" />
        </button>
      </header>
      <div className={styles.content} aria-busy={busy}>
        {error && <p className={styles.error} role="alert">{translate(error)}</p>}
        {!avatars && (error
          ? <Button onClick={() => { setError(""); setAttempt((value) => value + 1); }}>{translate("Try again")}</Button>
          : <Loader />)}
        {avatars && <div className={styles.grid} aria-label={translate("Avatars")}>
          {avatars.map(({ url, name }) => <button key={url} type="button" className={styles.choice}
            aria-label={translate(name)} aria-pressed={url === user.avatar_url} disabled={busy} onClick={() => selectAvatar(url)}>
            <Avatar url={url} size={80} />
            {url === user.avatar_url && <span className={styles.check}><FiCheck size={16} strokeWidth={3} aria-hidden="true" /></span>}
          </button>)}
        </div>}
        {busy && <div className={styles.loading} role="status"><Loader /></div>}
      </div>
    </div>
  </dialog>;
}
