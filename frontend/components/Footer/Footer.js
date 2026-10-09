import useTranslate from "../../hooks/useTranslate";
import styles from "./Footer.module.scss";
import Link from "next/link";
import { useUser } from "../../hooks/useAuth";
import LanguageSelector from "../LanguageSelector/LanguageSelector";

export default function Footer() {
  const translate = useTranslate();
  const user = useUser();

  const today = new Date();
  const year = today.getFullYear();
  const christmas = new Date(`25 December ${year}`);

  const differenceInTime = christmas.getTime() - today.getTime();
  const daysUntilChristmas = Math.floor(differenceInTime / (1000 * 3600 * 24));

  return (
    <>
      <footer className={styles.footer}>
        {translate("days-until-christmas", {
          number: <span>{daysUntilChristmas}</span>,
        })}{" "}
        <img
          src="/images/icons/wreath.png"
          height={24}
          width={24}
          alt=""
        />
        {user && <div className={styles.languages}><LanguageSelector /></div>}
      </footer>
      <div className={styles.legal}>
        <nav className={styles.links} aria-label="About and privacy">
          <Link className={styles.link} href="/about">About</Link>
          <Link className={styles.link} href="/privacy">Privacy</Link>
        </nav>
        <small className={styles.copyright}>&copy; 2026 WesWare</small>
      </div>
    </>
  );
}
