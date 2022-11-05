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

  return (
    <header className={styles["sign-out"]}>
      <Logo centered={!user} />
      {user && (
        <div className={styles.user}>
          {translate("welcome", {
            name: <span>{getFirstName(getUserName(user))}</span>,
          })}
          <hr />
          <Button
            icon="tag"
            variant="link"
            size="small"
            onClick={() => supabase.auth.signOut().then(() => router.push("/"))}
          >
            {translate("sign-out")}
          </Button>
        </div>
      )}
    </header>
  );
}
