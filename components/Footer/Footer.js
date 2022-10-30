import Image from "next/image";
import styles from "./Footer.module.scss";

export default function Footer() {
  const today = new Date();
  const year = today.getFullYear();
  const christmas = new Date(`25 December ${year}`);

  const differenceInTime = christmas.getTime() - today.getTime();
  const daysUntilChristmas = Math.floor(differenceInTime / (1000 * 3600 * 24));

  return (
    <footer className={styles.footer}>
      <span>{daysUntilChristmas}</span> days until Christmas{" "}
      <Image
        src={`/images/icons/wreath.png`}
        height={24}
        width={24}
        quality={100}
        alt=""
      />
    </footer>
  );
}
