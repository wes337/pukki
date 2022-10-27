import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { formPossessive, isValidUrl } from "../../../utils/string";
import { Avatar, Button, Loader } from "../../../components";
import styles from "./gift.module.scss";

export default function Gift() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState();
  const [gift, setGift] = useState([]);
  const [isMe, setIsMe] = useState(false);

  const { uid, gid } = router.query;

  useEffect(() => {
    if (session && uid && gid) {
      setLoading(true);

      if (!session.user) {
        router.push("/");
      }

      setIsMe(uid === session.user.id);
      Promise.all([getUser(), getGift()]).then(() => {
        setLoading(false);
      });
    }
  }, [session, uid, gid]);

  async function getGift() {
    try {
      let { data, error } = await supabase
        .from("gifts")
        .select("id, name, claimed_by, user, description, url")
        .eq("id", gid);

      if (error) {
        throw error;
      }

      const gift = data[0];

      setGift(gift);
      return gift;
    } catch (error) {
      console.log(error);
    }
  }

  async function getUser() {
    try {
      let { data, error } = await supabase
        .from("users")
        .select("name, avatar_url")
        .eq("user_id", uid);

      if (error) {
        throw error;
      }

      const user = data[0];

      setUser(user);
      return user;
    } catch (error) {
      console.log(error);
    }
  }

  async function removeGift() {
    try {
      const { error } = await supabase.from("gifts").delete().eq("id", gid);

      if (error) {
        throw error;
      }

      router.push(`/user/${gift.user}`);
    } catch (error) {
      console.log(error);
    }
  }

  if (loading || !gift || !user) {
    return <Loader />;
  }

  const renderOwnGiftButtons = () => {
    return (
      <>
        <Button icon="bauble-alt" block>
          Edit
        </Button>
        <Button icon="bauble" variant="secondary" onClick={removeGift} block>
          Delete
        </Button>
      </>
    );
  };

  const renderGiftButtons = () => {
    return (
      <>
        {gift.claimed_by ? (
          <>Claimed by {gift.claimed_by}</>
        ) : (
          <Button icon="gift-bag" block>
            I'll buy it!
          </Button>
        )}
      </>
    );
  };

  return (
    <div className={styles.gift}>
      <div className={styles.header}>
        <Button
          icon="christmas-tree"
          variant="outline"
          onClick={() => router.push(`/user/${gift.user}`)}
        >
          Back
        </Button>
        <h4>{isMe ? "Your" : formPossessive(user?.name)} wishlist</h4>
        <Avatar url={user?.avatar_url} size={36} />
      </div>
      <div className={styles.body}>
        <h5>
          <span>{isMe ? "You want..." : `${user?.name} wants...`}</span>
          {gift.name}
        </h5>
        {gift.url && (
          <h5>
            <span>Where can you buy this?</span>
            {isValidUrl(gift.url) ? (
              <Button
                icon="gift-alt"
                onClick={() => window.open(gift.url, "_blank")}
              >
                Here!
              </Button>
            ) : (
              gift.url
            )}
          </h5>
        )}
        {gift.description && (
          <blockquote className={styles.quote}>
            {gift.description}
            <cite>{user?.name}</cite>
          </blockquote>
        )}
      </div>
      <div className={styles.footer}>
        {isMe ? renderOwnGiftButtons() : renderGiftButtons()}
      </div>
    </div>
  );
}
