import styles from "./ChristmasTree.module.scss";

export default function ChristmasTree() {
  return (
    <div className={styles["christmas-tree"]}>
      <div className={styles.tree}>
        <div className={styles.star}></div>
        <div className={styles.t1}></div>
        <div className={styles.t2}></div>
        <div className={styles.t3}></div>
        <div className={styles.stem}></div>
      </div>
    </div>
  );
}
