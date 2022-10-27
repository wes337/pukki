import styles from "./ProgressBar.module.scss";

export default function ProgressBar({ percent }) {
  return (
    <div className={styles.progress}>
      {percent > 0 ? (
        <div
          role="progressbar"
          style={{ width: `${percent}%` }}
          className={`${styles.bar}${
            percent === 100 ? ` ${styles.completed}` : ""
          }`}
        >
          <span>{percent}&#37;</span>
        </div>
      ) : (
        <span>0&#37;</span>
      )}
    </div>
  );
}
