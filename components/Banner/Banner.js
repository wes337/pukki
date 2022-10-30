import Button from "../Button/Button";
import Icon from "../Icon/Icon";
import styles from "./Banner.module.scss";

export default function Banner({ icon, title, message, action }) {
  return (
    <div className={styles.banner}>
      <Icon name={icon} size={64} />
      {title && <h2>{title}</h2>}
      <p>{message}</p>
      {action && (
        <Button variant="outline" onClick={action.callback}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
