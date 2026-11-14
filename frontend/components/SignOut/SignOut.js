import { useRouter } from "next/router";
import { useState } from "react";
import { useAuth, useUser } from "../../hooks/useAuth";
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
  return <AccountHeader key={user?.id ?? "guest"} user={user} />;
}

function AccountHeader({ user }) {
  const { replaceSession } = useAuth();
  const router = useRouter();
  const translate = useTranslate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pickingAvatar, setPickingAvatar] = useState(false);
  const signOut = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await request("/auth/logout", { method: "POST" });
      setError("");
      setPickingAvatar(false);
      replaceSession(null);
      await router.replace("/login");
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
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
