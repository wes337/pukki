import { useRouter } from "next/router";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { getUserName } from "../../utils/users";
import Logo from "../Logo/Logo";
import Button from "../Button/Button";
import styles from "./Header.module.scss";

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
