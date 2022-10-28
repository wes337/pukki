import Image from "next/image";
import styles from "./Logo.module.scss";

export default function Logo({ centered }) {
  return (
    <div className={styles.logo} style={{ margin: centered ? "auto" : 0 }}>
      <Image
        objectFit="contain"
        src="/images/icons/santa-claus.png"
        height={50}
        width={50}
        alt=""
      />
      <h1>Pukki</h1>
    </div>
  );
}
