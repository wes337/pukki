import Button from "../Button/Button";
import Avatar from "../Avatar/Avatar";
import styles from "./Header.module.scss";

export default function Header({ title, avatar }) {
  return (
    <div className={styles.header}>
      <Button
        icon="christmas-tree"
        variant="outline"
        onClick={() => history.back()}
      >
        Back
      </Button>
      <h4>{title}</h4>
      {avatar && <Avatar url={avatar} size={36} />}
    </div>
  );
}
