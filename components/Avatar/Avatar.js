import styles from "./Avatar.module.scss";

export default function Avatar({ url, size = 30 }) {
  return (
    <img
      className={styles.avatar}
      src={url}
      height={size}
      width={size}
      alt=""
    />
  );
}
