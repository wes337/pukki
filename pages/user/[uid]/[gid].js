import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "@supabase/auth-helpers-react";
import supabase from "../../../lib/supabaseClient";
import { getGift, removeGift, claimGift } from "../../../actions/gifts";
import { getUser } from "../../../actions/users";
import { isAdmin, isTestUser, getFirstName } from "../../../utils/users";
import { formPossessive, isValidUrl } from "../../../utils/string";
import { Avatar, Button, Header, Icon, Loader } from "../../../components";
import styles from "./gift.module.scss";

export default function Gift() {
  const session = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState();
  const [gift, setGift] = useState([]);
  const [giftClaimedBy, setGiftClaimedBy] = useState("");
  const [isMe, setIsMe] = useState(false);

  const { uid, gid } = router.query;

  useEffect(() => {
    setLoading(true);

    if (session && uid && gid) {
      if (!session.user) {
        router.push("/");
      }

      setIsMe(uid === session.user.id);
      Promise.all([getUser(supabase, uid), getGift(supabase, gid)]).then(
        ([user, gift]) => {
          setUser(user);
          setGift(gift);

          if (gift.claimed_by && gift.claimed_by !== session.user.id) {
            getUser(supabase, gift.claimed_by).then(({ name }) => {
              setGiftClaimedBy(name);
              setLoading(false);
            });
          } else {
            setLoading(false);
          }
        }
      );
    }
  }, [session, uid, gid]);

  const claimAndUpdateGift = (userId) => {
    setLoading(true);
    claimGift(supabase, gift.id, userId).then((gift) => {
      setGift(gift);
      setLoading(false);
    });
  };

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
      const claimedByMe = gift.claimed_by === session.user.id;

      return (
        <div className={styles.claimed}>
          <div>
            <Icon name="ornament" size={32} />
            <div>
              {claimedByMe ? "You are " : `${giftClaimedBy} is `}
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
          {claimedByMe && (
            <Button
              icon="reindeer"
              variant="secondary"
              block
              onClick={() => claimAndUpdateGift(null)}
            >
              Nevermind, I'm not buying this
            </Button>
          )}
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

  const renderFooterButtons = () => {
    if (isTestUser(uid) && isAdmin(session.user.id)) {
      return (
        <div>
          {renderGiftButtons()}
          {renderOwnGiftButtons()}
        </div>
      );
    }

    if (isMe) {
      return renderOwnGiftButtons();
    }

    return renderGiftButtons();
  };

  if (loading || !gift || !user) {
    return <Loader />;
  }

  return (
    <div className={styles.gift}>
      <Header
        title={`${
          isMe ? "My" : formPossessive(getFirstName(user?.name))
        } wishlist`}
        avatar={user.avatar_url}
      />
      <div className={styles.body}>
        <h5>
          <span>
            {isMe ? "You want..." : `${getFirstName(user?.name)} wants...`}
          </span>
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
                Click here!
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
      <div className={styles.footer}>{renderFooterButtons()}</div>
    </div>
  );
}
