import useTranslate from "../../hooks/useTranslate";
import { FiArrowLeft } from "react-icons/fi";
import Button from "../Button/Button";
import styles from "./BackButton.module.scss";

export default function BackButton({ onClick, disabled }) {
  const translate = useTranslate();
  return <div className={styles.back}>
    <Button icon="christmas-tree" variant="outline" onClick={onClick} disabled={disabled}>
      <span className={styles.arrow} aria-hidden="true"><FiArrowLeft size={24} /></span>
      <span className={styles.label}>{translate("back")}</span>
    </Button>
  </div>;
}
