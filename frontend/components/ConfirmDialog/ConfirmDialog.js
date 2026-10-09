import { useEffect, useId, useRef, useState } from "react";
import Button from "../Button/Button";
import Loader from "../Loader/Loader";
import styles from "./ConfirmDialog.module.scss";

export default function ConfirmDialog({ title, description, confirmLabel, onConfirm, onCancel }) {
  const dialog = useRef(null);
  const submitting = useRef(false);
  const titleId = useId();
  const descriptionId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement;
    const overflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      if (trigger?.isConnected) trigger.focus();
    };
  }, []);

  async function confirm() {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      await onConfirm();
    } catch {
      setError("Couldn't delete the gift. Try again.");
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  return <dialog ref={dialog} className={styles.dialog} aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined}
    onCancel={(event) => { event.preventDefault(); if (!submitting.current) onCancel(); }}
    onClick={(event) => { if (event.target === event.currentTarget && !submitting.current) onCancel(); }}>
    <div className={styles.content}>
      <h2 id={titleId}>{title}</h2>
      {description && <p id={descriptionId}>{description}</p>}
      {busy && <div role="status"><Loader /></div>}
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.actions}>
        <Button variant="outline" block disabled={busy} onClick={onCancel}>Cancel</Button>
        <Button variant="secondary" block disabled={busy} onClick={confirm}>{confirmLabel}</Button>
      </div>
    </div>
  </dialog>;
}
