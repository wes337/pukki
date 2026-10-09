import styles from "./Input.module.scss";

export default function Input({ multiline = false, ...props }) {
  const Control = multiline ? "textarea" : "input";
  return <span className={styles.inputControl}><Control {...props} /></span>;
}
