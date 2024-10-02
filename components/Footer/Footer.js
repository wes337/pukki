import Image from "next/image";
import { useRouter } from "next/router";
import useTranslate from "../../hooks/useTranslate";
import Button from "../Button/Button";
import styles from "./Footer.module.scss";
import Link from "next/link";

export default function Footer() {
  const router = useRouter();
  const translate = useTranslate();

  const today = new Date();
  const year = today.getFullYear();
  const christmas = new Date(`25 December ${year}`);

  const differenceInTime = christmas.getTime() - today.getTime();
  const daysUntilChristmas = Math.floor(differenceInTime / (1000 * 3600 * 24));

  const changeLocale = (locale) => {
    const { locale: currentLocale, asPath } = router;

    if (currentLocale === locale) {
      return;
    }

    router.replace(asPath, asPath, {
      locale,
    });
  };

  return (
    <>
      <footer className={styles.footer}>
        {translate("days-until-christmas", {
          number: <span>{daysUntilChristmas}</span>,
        })}{" "}
        <Image
          src="/images/icons/wreath.png"
          height={24}
          width={24}
          quality={100}
          alt=""
        />
        <div>
          <Button
            icon="english"
            variant="link"
            onClick={() => changeLocale("en")}
          />
          <Button
            icon="finnish"
            variant="link"
            onClick={() => changeLocale("fi")}
          />
        </div>
      </footer>
      <Link className={styles.privacy} href="/privacy">
        Privacy
      </Link>
    </>
  );
}
