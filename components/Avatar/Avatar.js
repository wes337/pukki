import Image from "next/image";
import { useState } from "react";
import styles from "./Avatar.module.scss";

export default function Avatar({ url, size = 30 }) {
  const [src, setSrc] = useState(url);

  return (
    <div className={styles.avatar}>
      <Image
        src={src}
        height={size}
        width={size}
        alt=""
        onError={() => setSrc("/images/avatar-placeholder.png")}
      />
    </div>
  );
}
