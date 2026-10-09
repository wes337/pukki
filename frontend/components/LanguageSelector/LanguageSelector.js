import { useRouter } from "next/router";
import useTranslate from "../../hooks/useTranslate";
import Icon from "../Icon/Icon";
import styles from "./LanguageSelector.module.scss";

export default function LanguageSelector() {
  const translate = useTranslate();
  const router = useRouter();
  const changeLocale = (locale) => {
    if (router.locale !== locale) {
      void router.replace(router.asPath, router.asPath, { locale });
    }
  };

  return <div className={styles.languages} role="group" aria-label={translate("Language")}>
    <button type="button" aria-label="English" aria-pressed={router.locale === "en"} onClick={() => changeLocale("en")}>
      <Icon name="english" size={24} />
    </button>
    <button type="button" aria-label="Suomi" aria-pressed={router.locale === "fi"} onClick={() => changeLocale("fi")}>
      <Icon name="finnish" size={24} />
    </button>
  </div>;
}
