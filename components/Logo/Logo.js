import Image from "next/image";
import Link from "next/link";
import styles from "./Logo.module.scss";

export default function Logo({ centered }) {
  return (
    <Link
      className={styles.logo}
      style={{ margin: centered ? "auto" : 0 }}
      href="/"
    >
      <Image
        src="/images/icons/santa-claus.png"
        height={50}
        width={50}
        alt=""
      />
      <h1>Pukki</h1>
    </Link>
  );
}
