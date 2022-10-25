import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { Avatar, Button, Loader } from "../../../components";
import styles from "./gift.module.scss";

export default function Gift() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [isMe, setIsMe] = useState(false);

  const { uid } = router.query;

  useEffect(() => {
    if (session && uid) {
      setIsMe(uid === session.user.id);
    }
  }, [session]);

  async function addGift() {
    try {
      if (!name) {
        return;
      }

      setLoading(true);

      const gift = {
        name,
        url,
        description,
        user: uid,
      };

      const { data, error } = await supabase
        .from("gifts")
        .insert(gift)
        .select();

      if (error) {
        throw error;
      }

      router.push(`/user/${uid}`);
    } catch (error) {
      console.log(error);
    }
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
        <h4>Add a gift to your wishlist</h4>
      </div>
      <div className={styles.body}>
        <label for="name">
          <span>
            Name <em>(Required)</em>
          </span>
          <input
            name="name"
            type="text"
            value={name}
            placeholder="Name of the gift"
            onChange={(event) => {
              setName(event.target.value);
            }}
          ></input>
        </label>
        <label for="description">
          <span>Description</span>
          <textarea
            name="description"
            value={description}
            placeholder="Write a short description of the gift"
            onChange={(event) => {
              setDescription(event.target.value);
            }}
          ></textarea>
        </label>
        <label for="url">
          <span>Where can you buy it?</span>
          <input
            name="url"
            type="text"
            value={url}
            placeholder="Link to the gift online, or name of the shop"
            onChange={(event) => {
              setUrl(event.target.value);
            }}
          ></input>
        </label>
      </div>
      <div className={styles.footer}>
        <Button icon="gift" block onClick={addGift} disabled={!name}>
          Add to wishlist
        </Button>
      </div>
    </div>
  );
}
