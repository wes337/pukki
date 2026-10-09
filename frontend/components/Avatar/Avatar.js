import Image from "next/image";
import { useState } from "react";
import styles from "./Avatar.module.scss";

export default function Avatar({ url, size = 30 }) {
  const [failedUrl, setFailedUrl] = useState(null);
  const src = url && url !== failedUrl ? url : "/images/avatar-placeholder.png";

  return (
    <div className={styles.avatar}>
      <Image
        src={src}
        className={src.startsWith("/images/avatars/") ? styles.generated : undefined}
        height={size}
        width={size}
        unoptimized={src.startsWith("/images/avatars/")}
        alt=""
        onError={() => setFailedUrl(url)}
      />
    </div>
  );
}
