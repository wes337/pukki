import styles from "./Snow.module.scss";

export default function Snow({ snowflakes = 50 }) {
  return (
    <div className={styles.snow}>
      {[...Array(snowflakes)].map((_, index) => (
        <div key={index} />
      ))}
    </div>
  );
}
