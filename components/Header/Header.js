import { useRouter } from "next/router";
import { useUser } from "@supabase/auth-helpers-react";
import Button from "../Button/Button";
import Avatar from "../Avatar/Avatar";
import styles from "./Header.module.scss";

export default function Header({ title, avatar }) {
  const user = useUser();
  const router = useRouter();

  return (
    <div className={styles.header}>
      <Button
        icon="christmas-tree"
        variant="outline"
        onClick={() => history.back()}
      >
        Back
      </Button>
      <h4>{title}</h4>
      {avatar && <Avatar url={avatar} size={36} />}
    </div>
  );
}
