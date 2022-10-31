import Image from "next/image";
import styles from "./Avatar.module.scss";

export default function Avatar({ url, size = 30 }) {
  return (
    <div className={styles.avatar}>
      <Image src={url} height={size} width={size} alt="" />
    </div>
  );
}
