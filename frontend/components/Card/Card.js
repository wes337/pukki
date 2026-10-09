import styles from "./Card.module.scss";
import { useUser } from "../../hooks/useAuth";
import LanguageSelector from "../LanguageSelector/LanguageSelector";

export default function Card({ children }) {
  const user = useUser();

  return <div className={styles.card}>
    {!user && <div className={styles.languages}><LanguageSelector /></div>}
    {children}
  </div>;
}
