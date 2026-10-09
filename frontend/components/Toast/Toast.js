import useTranslate from "../../hooks/useTranslate";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import styles from "./Toast.module.scss";

const ToastContext = createContext(null);

function ToastMessage({ toast, dismiss }) {
  const translate = useTranslate();
  const [closing, setClosing] = useState(false);
  const leaving = closing || Boolean(toast.next);

  useEffect(() => {
    const hide = setTimeout(() => setClosing(true), 4000);
    return () => clearTimeout(hide);
  }, []);

  useEffect(() => {
    if (!leaving) return;
    const remove = setTimeout(() => dismiss(toast.id), 250);
    return () => clearTimeout(remove);
  }, [leaving, toast.id, dismiss]);

  return <div className={styles.toast} data-tone={toast.tone} data-leaving={leaving}>
    <span>{toast.message}</span>
    <button type="button" aria-label={translate("Dismiss notification")} onClick={() => setClosing(true)}>
      <FiX aria-hidden="true" size={18} />
    </button>
  </div>;
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const nextId = useRef(0);
  const showToast = useCallback((message, { tone = "success" } = {}) => {
    const next = { id: ++nextId.current, message, tone };
    // Keep the outgoing toast mounted; rapid clicks replace only the pending message.
    setToast((current) => current ? { ...current, next } : next);
  }, []);
  const dismiss = useCallback((id) => {
    setToast((current) => current?.id === id ? current.next ?? null : current);
  }, []);

  return <ToastContext.Provider value={showToast}>
    {children}
    <div className={styles.region} role="status" aria-live="polite" aria-atomic="true">
      {toast && <ToastMessage key={toast.id} toast={toast} dismiss={dismiss} />}
    </div>
  </ToastContext.Provider>;
}

// Show one global notification; a new message replaces the current toast.
export function useToast() {
  const showToast = useContext(ToastContext);
  if (!showToast) throw new Error("useToast must be used within ToastProvider");
  return showToast;
}
