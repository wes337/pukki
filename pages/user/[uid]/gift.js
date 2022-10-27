import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { addGift } from "../../../actions/gifts";
import { Button, Loader } from "../../../components";
import styles from "./gift.module.scss";

export default function Gift({ gift }) {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");

  const { uid } = router.query;

  useEffect(() => {
    if (session && uid) {
      if (uid !== session.user.id) {
        router.push(`/user/${uid}`);
      }
    }
  }, [session, uid]);

  useEffect(() => {
    if (gift) {
      setName(gift.name);
      setDescription(gift.description);
      setUrl(gift.url);
    }
  }, [gift]);

  function addOrUpdateGift() {
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

    addGift(supabase, newGift).then(() => router.push(`/user/${uid}`));
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={styles.gift}>
      <div className={styles.header}>
        <Button
          icon="christmas-tree"
          variant="outline"
          onClick={() => router.push(`/user/${uid}`)}
        >
          Back
        </Button>
        <h4>
          {gift
            ? "Change a gift on your wishlist"
            : "Add a gift to your wishlist"}
        </h4>
      </div>
      <div className={styles.body}>
        <label htmlFor="name">
          <span>What do you want?</span>
          <input
            name="name"
            type="text"
            value={name}
            placeholder="Name of the gift"
            onChange={(event) => setName(event.target.value)}
          ></input>
        </label>
        <label htmlFor="description">
          <span>Write a short description</span>
          <textarea
            name="description"
            value={description}
            placeholder="Include details such as size, colour, or anything specific about the gift you want"
            onChange={(event) => setDescription(event.target.value)}
          ></textarea>
        </label>
        <label htmlFor="url">
          <span>Where can you buy it?</span>
          <input
            name="url"
            type="text"
            value={url}
            placeholder="Link to the gift online, or name of the shop"
            onChange={(event) => setUrl(event.target.value)}
          ></input>
        </label>
      </div>
      <div className={styles.footer}>
        <Button icon="gift" block onClick={addOrUpdateGift} disabled={!name}>
          {gift ? "Update your wishlist" : "Add to wishlist"}
        </Button>
      </div>
    </div>
  );
}
