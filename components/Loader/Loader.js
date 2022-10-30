import Image from "next/image";
import styles from "./Loader.module.scss";

export default function Loader() {
  return (
    <div className={styles.loader}>
      <Image
        src="/images/icons/candycane.png"
        height={100}
        width={100}
        priority
        loading="eager"
        alt="Loading"
      />
      <div>Loading...</div>
    </div>
  );
}
