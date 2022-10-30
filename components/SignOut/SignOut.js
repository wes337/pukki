import { useRouter } from "next/router";
import { useUser } from "@supabase/auth-helpers-react";
import supabase from "../../lib/supabaseClient";
import { getUserName } from "../../utils/users";
import Logo from "../Logo/Logo";
import Button from "../Button/Button";
import styles from "./SignOut.module.scss";

export default function SignOut() {
  const user = useUser();
  const router = useRouter();

  return (
    <header className={styles["sign-out"]}>
      <Logo centered={!user} />
      {user && (
        <div className={styles.user}>
          Welcome, <span>{getUserName(user)}</span>
          <hr />
          <Button
            icon="tag"
            variant="link"
            size="small"
            onClick={() => {
              supabase.auth.signOut().then(() => {
                router.push("/");
              });
            }}
          >
            Sign out
          </Button>
        </div>
      )}
    </header>
  );
}
