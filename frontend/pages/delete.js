import { Header } from "../components";
import { contactEmail } from "../config";
import styles from "./page.module.scss";

export default function Delete() {
  return (
    <div className={styles.page}>
      <Header title={"Delete Data"} />
      <p>Email <a href={`mailto:${contactEmail}`}>{contactEmail}</a> with your account email address
        to request account deletion. Do not include your password.</p>
    </div>
  );
}
