import Image from "next/image";
import styles from "./Loader.module.scss";

export default function Loader() {
  return (
    <div className={styles.loader}>
      <Image
        objectFit="contain"
        src="/images/icons/candycane.png"
        height={100}
        width={100}
        alt="Loading"
      />
      <div>Loading...</div>
    </div>
  );
}
