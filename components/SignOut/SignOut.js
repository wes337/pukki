import { useRouter } from "next/router";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { getFirstName, getUserName } from "../../utils/users";
import useTranslate from "../../hooks/useTranslate";
import Logo from "../Logo/Logo";
import Button from "../Button/Button";
import styles from "./SignOut.module.scss";

export default function SignOut() {
  const user = useUser();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const translate = useTranslate();

  const signOut = () => {
    sessionStorage.clear();

    localStorage.clear();

    caches.keys().then((keys) => {
      keys.forEach((key) => caches.delete(key));
    });

    indexedDB.databases().then((dbs) => {
      dbs.forEach((db) => indexedDB.deleteDatabase(db.name));
    });

    document.cookie = document.cookie.split(";").reduce((cookie, keyVal) => {
      var pair = keyVal.trim().split("=");
      if (pair[0]) {
        if (pair[0] !== "path" && pair[0] !== "expires") {
          cookie += pair[0] + "=;";
        }
      }
      return cookie;
    }, "expires=Thu, 01 Jan 1970 00:00:00 UTC; path:/;");

    supabase.auth.signOut().then(() => router.push("/"));
  };

  return (
    <header className={styles["sign-out"]}>
      <Logo centered={!user} />
      {user && (
        <div className={styles.user}>
          {translate("welcome", {
            name: <span>{getFirstName(getUserName(user))}</span>,
          })}
          <hr />
          <Button icon="tag" variant="link" size="small" onClick={signOut}>
            {translate("sign-out")}
          </Button>
        </div>
      )}
    </header>
  );
}
