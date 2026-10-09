import Image from "next/image";
import useTranslate from "../../hooks/useTranslate";
import styles from "./Loader.module.scss";

export default function Loader() {
  const translate = useTranslate();

  return (
    <div className={styles.loader}>
      <span className={styles.spinner}><Image
        src="/images/icons/candycane.png"
        height={100}
        width={100}
        priority
        loading="eager"
        alt=""
      /></span>
      <div>{translate("loading")}</div>
    </div>
  );
}
