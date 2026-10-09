import useTranslate from "../hooks/useTranslate";
import { Header } from "../components";
import styles from "./about.module.scss";

export default function About() {
  const translate = useTranslate();
  return <section>
    <Header title="About" />
    <div className={styles.content}>
      <div className={styles.artwork} aria-hidden="true">
        <img className={styles.mistletoe} src="/images/icons/mistletoe.png" width={44} height={44} alt="" />
        <img className={styles.fireplace} src="/images/icons/fireplace.png" width={112} height={112} alt="" />
        <img className={styles.gifts} src="/images/icons/gift.png" width={60} height={60} alt="" />
      </div>
      <h1>{translate("Christmas, together.")}</h1>
      <p>{translate("Share wishlists with your family, choose gifts to give, and keep the surprises.")}</p>
      <img src="/images/icons/ornament.png" width={48} height={48} alt="" />
      <p>{translate("about-name-origin")}</p>
    </div>
  </section>;
}
