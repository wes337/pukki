import Icon from "../Icon/Icon";
import styles from "./Banner.module.scss";

export default function Banner({ icon, message }) {
  return (
    <div className={styles.banner}>
      <Icon name={icon} size={64} />
      <p>{message}</p>
    </div>
  );
}
