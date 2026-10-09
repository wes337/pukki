import Input from "../../../components/Input/Input";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession, useUser } from "../../../hooks/useAuth";
import useTranslate from "../../../hooks/useTranslate";

import { useGiftActions } from "../../../hooks/useFamilyData";
import { Header, Button, Loader } from "../../../components";
import styles from "./gift.module.scss";

export default function Gift({ gift }) {
  const session = useSession();
  const user = useUser();
  const router = useRouter();
  const translate = useTranslate();
  const { saveGift } = useGiftActions();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState(gift?.name || "");
  const [description, setDescription] = useState(gift?.description || "");
  const [url, setUrl] = useState(gift?.url || "");

  const { uid } = router.query;

  const canEdit = uid === session?.user.id && (!gift || gift.user === uid);
  useEffect(() => {
    if (!canEdit) void router.replace(`/users/${uid}`);
  }, [canEdit, uid, router]);

  const addOrUpdateGift = () => {
    if (!name || saving) {
      return;
    }

    setSaving(true);
    setError("");

    const newGift = {
      name,
      url,
      description,
      user: uid,
    };

    if (gift) {
      newGift.id = gift.id;
    }

    saveGift(newGift).then(() => router.push(`/users/${uid}`)).catch((error) => { setError(error.message); setSaving(false); });
  };

  if (!canEdit) {
    return <Loader />;
  }

  return (
    <div className={styles.gift}>
      <Header
        title={translate(
          gift
            ? "change-a-gift-on-your-wishlist"
            : "add-a-gift-to-your-wishlist"
        )}
        avatar={user?.avatar_url}
      />
      <div className={styles.body}>
        <label htmlFor="name">
          <span>{translate("what-do-you-want")}</span>
          <Input
            name="name"
            type="text"
            value={name}
            placeholder={translate("name-of-the-gift")}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label htmlFor="description">
          <span>{translate("write-a-short-description")}</span>
          <Input multiline
            name="description"
            rows={5}
            value={description}
            placeholder={translate("include-details")}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        <label htmlFor="url">
          <span>{translate("where-can-you-buy-it")}</span>
          <Input
            name="url"
            type="text"
            value={url}
            placeholder={translate("link-to-gift-or-name-of-shop")}
            onChange={(event) => setUrl(event.target.value)}
          />
        </label>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className={styles.footer}>
        <Button icon="gift" block onClick={addOrUpdateGift} disabled={!name || saving}>
          {translate(gift ? "update-your-wishlist" : "add-to-your-wishlist")}
        </Button>
      </div>
    </div>
  );
}
