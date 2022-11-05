import useTranslate from "../../hooks/useTranslate";
import Button from "../Button/Button";
import Avatar from "../Avatar/Avatar";
import styles from "./Header.module.scss";
import { useRouter } from "next/router";

export default function Header({ title, avatar, back }) {
  const router = useRouter();
  const translate = useTranslate();

  const goBack = () => {
    try {
      if (back) {
        router.push(back);
        return;
      }

      switch (router.pathname) {
        case "/users/[uid]": {
          router.push("/users");
          break;
        }
        case "/users/[uid]/gift": {
          router.push(`/users/${router.query.uid}`);
          break;
        }
        case "/users/[uid]/[gid]": {
          router.push(`/users/${router.query.uid}`);
          break;
        }
        case "/users/[uid]/[gid]/edit": {
          router.push(`/users/${router.query.uid}/${router.query.gid}`);
          break;
        }
        case "/gifts": {
          router.push("/users");
          break;
        }
        default: {
          router.back();
          break;
        }
      }
    } catch {
      history.back();
    }
  };

  return (
    <div className={styles.header}>
      <Button icon="christmas-tree" variant="outline" onClick={goBack}>
        {translate("back")}
      </Button>
      <h4>{title}</h4>
      {avatar && <Avatar url={avatar} size={36} />}
    </div>
  );
}
