import { Header } from "../components";
import styles from "./page.module.scss";

export default function Delete() {
  return (
    <div className={styles.page}>
      <Header title={"Delete Data"} />
      <h1 style={{ textAlign: "center" }}>
        <a href="mailto:wesmoses@gmail.com">
          Click here to email me and I will delete all of your data.
        </a>
      </h1>
    </div>
  );
}
