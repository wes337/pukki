import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { getUserName } from "../../utils/user";
import Logo from "../Logo/Logo";
import Button from "../Button/Button";
import styles from "./Header.module.scss";
import { Router, useRouter } from "next/router";

export default function Header() {
  const user = useUser();
  const router = useRouter();
  const supabase = useSupabaseClient();

  return (
    <header className={styles.header}>
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
