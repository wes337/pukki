import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { getGift, removeGift, claimGift } from "../../../actions/gifts";
import { getUser } from "../../../actions/users";
import { formPossessive, isValidUrl } from "../../../utils/string";
import { Avatar, Button, Icon, Loader } from "../../../components";
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
      Promise.all([getUser(supabase, uid), getGift(supabase, gid)]).then(
        ([user, gift]) => {
          setUser(user);
          setGift(gift);
          setLoading(false);
        }
      );
    }
  }, [session, uid, gid]);

  function claimAndUpdateGift(userId) {
    setLoading(true);
    claimGift(supabase, gift.id, userId).then(() => {
      setGift((gift) => ({
        ...gift,
        claimed_by: userId,
      }));
      setLoading(false);
    });
  }

  if (loading || !gift || !user) {
    return <Loader />;
  }

  const renderOwnGiftButtons = () => {
    return (
      <>
        <Button
          icon="bauble-alt"
          onClick={() => router.push(`/user/${gift.user}/${gift.id}/edit`)}
          block
        >
          Edit
        </Button>
        <Button
          icon="bauble"
          variant="secondary"
          onClick={() =>
            removeGift(supabase, gid).then(() =>
              router.push(`/user/${gift.user}`)
            )
          }
          block
        >
          Delete
        </Button>
      </>
    );
  };

  const renderGiftButtons = () => {
    if (gift.claimed_by) {
      return (
        <div className={styles.claimed}>
          <div>
            <Icon name="ornament" size={32} />
            <div>
              {gift.claimed_by === session.user.id ? "You're" : gift.claimed_by}{" "}
              buying
              <br />
              <span>{gift.name}</span>
            </div>
            <br />
            <div>
              for
              <br />
              <span>{user.name}</span>
            </div>
            <Icon name="ornament" size={32} />
          </div>
          <Button
            icon="reindeer"
            variant="secondary"
            block
            onClick={() => claimAndUpdateGift(undefined)}
          >
            Nevermind, I'm not buying this
          </Button>
        </div>
      );
    }

    return (
      <Button
        icon="gift-bag"
        block
        onClick={() => claimAndUpdateGift(session.user.id)}
      >
        I'll buy it!
      </Button>
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
            <span>Where can you buy it?</span>
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
