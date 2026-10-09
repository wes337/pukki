import useTranslate from "../hooks/useTranslate";
import { Header } from "../components";
import { contactEmail } from "../config";
import styles from "./page.module.scss";

export default function Delete() {
  const translate = useTranslate();
  return (
    <div className={styles.page}>
      <Header title={"Delete Data"} />
      <p>{translate("delete-account-instructions", { email: <a href={`mailto:${contactEmail}`}>{contactEmail}</a> })}</p>
    </div>
  );
}
