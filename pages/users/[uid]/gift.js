import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { withPageAuth } from "@supabase/auth-helpers-nextjs";
import { useSession, useUser } from "@supabase/auth-helpers-react";
import useTranslate from "../../../hooks/useTranslate";
import { isAdmin, isTestUser } from "../../../utils/users";
import { addGift } from "../../../actions/gifts";
import { Header, Button, Loader } from "../../../components";
import styles from "./gift.module.scss";

export default function Gift({ gift }) {
  const session = useSession();
  const user = useUser();
  const router = useRouter();
  const translate = useTranslate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");

  const { uid } = router.query;

  useEffect(() => {
    setLoading(true);

    if (session && uid) {
      const canAddGifts =
        uid === session.user.id ||
        (isTestUser(uid) && isAdmin(session.user.id));

      if (!canAddGifts) {
        router.push(`/users/${uid}`);
      }

      setLoading(false);
    }
  }, [session, uid, router]);

  useEffect(() => {
    if (gift) {
      setName(gift.name);
      setDescription(gift.description);
      setUrl(gift.url);
    }
  }, [gift]);

  const addOrUpdateGift = () => {
    if (!name) {
      return;
    }

    setLoading(true);

    const newGift = {
      name,
      url,
      description,
      user: uid,
    };

    if (gift) {
      newGift.id = gift.id;
    }

    addGift(newGift).then(() => router.push(`/users/${uid}`));
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={styles.gift}>
      <Header
        title={translate(
          gift
            ? "add-a-gift-to-your-wishlist"
            : "change-a-gift-on-your-wishlist"
        )}
        avatar={user?.user_metadata?.avatar_url}
      />
      <div className={styles.body}>
        <label htmlFor="name">
          <span>{translate("what-do-you-want")}</span>
          <input
            name="name"
            type="text"
            value={name}
            placeholder={translate("name-of-the-gift")}
            onChange={(event) => setName(event.target.value)}
          ></input>
        </label>
        <label htmlFor="description">
          <span>{translate("write-a-short-description")}</span>
          <textarea
            name="description"
            value={description}
            placeholder={translate("include-details")}
            onChange={(event) => setDescription(event.target.value)}
          ></textarea>
        </label>
        <label htmlFor="url">
          <span>{translate("where-can-you-buy-it")}</span>
          <input
            name="url"
            type="text"
            value={url}
            placeholder={translate("link-to-gift-or-name-of-shop")}
            onChange={(event) => setUrl(event.target.value)}
          ></input>
        </label>
      </div>
      <div className={styles.footer}>
        <Button icon="gift" block onClick={addOrUpdateGift} disabled={!name}>
          {translate(gift ? "update-your-wishlist" : "add-to-your-wishlist")}
        </Button>
      </div>
    </div>
  );
}

export const getServerSideProps = withPageAuth({ redirectTo: "/login" });
