import { useRouter } from "next/router";
import { useState } from "react";
import { useUser } from "../../hooks/useAuth";
import { request } from "../../actions/request";
import { getFirstName, getUserName } from "../../utils/users";
import useTranslate from "../../hooks/useTranslate";
import Logo from "../Logo/Logo";
import Button from "../Button/Button";
import Avatar from "../Avatar/Avatar";
import AvatarPicker from "../AvatarPicker/AvatarPicker";
import styles from "./SignOut.module.scss";
export default function SignOut() {
  const user = useUser();
  const { locale } = useRouter();
  const translate = useTranslate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pickingAvatar, setPickingAvatar] = useState(false);
  const signOut = async () => {
    setBusy(true);
    setError("");
    try {
      await request("/auth/logout", { method: "POST" });
      // Reload to replace the cached session after an account or membership change.
      window.location.assign(locale === "fi" ? "/fi/login" : "/login");
    } catch (error) { setError(error.message); setBusy(false); }
  };
  return <header className={styles["sign-out"]}>
    <Logo centered={!user} />
    {user && <div className={styles.user}>
      <div className={styles.userDetails}>
        {user.name?.trim() && <>
          <div className={styles.welcome}>{translate("welcome", { name: <span>{getFirstName(getUserName(user))}</span> })}</div>
          <span className={styles.compactName}>{getFirstName(getUserName(user))}</span>
          <hr />
        </>}
        <Button icon="tag" variant="link" size="small" onClick={signOut} disabled={busy}>{translate("sign-out")}</Button>
        {error && <p role="alert">{translate(error)}</p>}
      </div>
      {user.name?.trim() && <button type="button" className={styles.userAvatar} aria-label={translate("Choose your avatar")} aria-haspopup="dialog" onClick={() => setPickingAvatar(true)}><Avatar url={user.avatar_url} size={48} /></button>}
    </div>}
    {user && pickingAvatar && <AvatarPicker onClose={() => setPickingAvatar(false)} />}
  </header>;
}
