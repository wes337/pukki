import { useLayoutEffect, useRef, useState } from "react";
import inputStyles from "../Input/Input.module.scss";
import styles from "./Family.module.scss";

const normalize = (text, length) => text.toUpperCase().replace(/[\s-]/g, "").slice(0, length);

export default function FamilyCode({ value, onChange, disabled, label, length = 6 }) {
  const input = useRef(null);
  const pendingCaret = useRef(null);
  const [focused, setFocused] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  // Preserve the native caret when pasted separators are removed or case changes.
  useLayoutEffect(() => {
    if (pendingCaret.current !== null) {
      input.current?.setSelectionRange(pendingCaret.current, pendingCaret.current);
      pendingCaret.current = null;
    }
  });

  const trackSelection = (event) => {
    setSelection({ start: event.target.selectionStart ?? 0, end: event.target.selectionEnd ?? 0 });
  };

  return <div className={styles.codeField}>
    <label htmlFor="family-code" className={styles.familyName}>{label}</label>
    <div className={styles.codeInputs} onPointerDown={(event) => {
      if (disabled) return;
      event.preventDefault();
      const bounds = event.currentTarget.getBoundingClientRect();
      const index = Math.min(value.length, length - 1, Math.max(0, Math.floor((event.clientX - bounds.left) / (bounds.width / length))));
      input.current.focus();
      input.current.setSelectionRange(index, Math.min(index + 1, value.length));
      setSelection({ start: index, end: Math.min(index + 1, value.length) });
    }}>
      <input ref={input} id="family-code" name="code" className={styles.codeNativeInput}
        type="text" value={value.slice(0, length)} maxLength={length} disabled={disabled} required autoFocus
        autoComplete="off" autoCapitalize="characters" spellCheck={false}
        pattern={`[A-HJ-NP-Z2-9]{${length}}`}
        onFocus={(event) => { setFocused(true); trackSelection(event); }}
        onBlur={() => setFocused(false)} onSelect={trackSelection}
        onPaste={(event) => {
          event.preventDefault();
          const pasted = normalize(event.clipboardData.getData("text"), length);
          const start = event.currentTarget.selectionStart ?? 0;
          const end = event.currentTarget.selectionEnd ?? start;
          const next = pasted.length === length ? pasted : normalize(value.slice(0, start) + pasted + value.slice(end), length);
          const caret = pasted.length === length ? length : Math.min(start + pasted.length, length);
          pendingCaret.current = caret;
          setSelection({ start: caret, end: caret });
          onChange(next);
        }}
        onChange={(event) => {
          const next = normalize(event.target.value, length);
          const caret = normalize(event.target.value.slice(0, event.target.selectionStart ?? 0), length).length;
          pendingCaret.current = caret;
          setSelection({ start: caret, end: caret });
          onChange(next);
        }}
      />
      {Array.from({ length }, (_, index) => {
        const active = focused && (selection.start === selection.end
          ? index === Math.min(selection.start, length - 1)
          : index >= selection.start && index < selection.end);
        return <span key={index} aria-hidden="true" data-focused={active} data-complete={Boolean(value[index]) && !active}
          className={`${inputStyles.inputControl} ${styles.codeSlot}`}>{value[index] || "\u00a0"}</span>;
      })}
    </div>
  </div>;
}
