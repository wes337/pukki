import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Image from "next/image";
import useTranslate from "../hooks/useTranslate";
import styles from "./login.module.scss";

export default function Login() {
  const supabase = useSupabaseClient();
  const translate = useTranslate();

  const signInWithFacebook = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "facebook",
    });
  };

  return (
    <button className={styles.login} onClick={signInWithFacebook}>
      <Image src="/images/icons/facebook.svg" width={24} height={24} alt="" />
      {translate("sign-in-with")} Facebook
    </button>
  );
}
