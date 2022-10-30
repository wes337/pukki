import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "@supabase/auth-helpers-react";
import { IconCheck } from "@tabler/icons";
import variables from "../../styles/variables.module.scss";
import { isAdmin, isTestUser, getFirstName } from "../../utils/users";
import { formPossessive } from "../../utils/string";
import { getUser } from "../../actions/users";
import { getGiftsForUser } from "../../actions/gifts";
import { Header, Avatar, Banner, Button, List, Loader } from "../../components";
import styles from "./users.module.scss";

export default function User() {
  const session = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState();
  const [gifts, setGifts] = useState([]);
  const [isMe, setIsMe] = useState(false);

  const { uid } = router.query;

  const canAddGifts =
    isMe || (isTestUser(uid) && session && isAdmin(session.user.id));

  useEffect(() => {
    setLoading(true);

    if (session && uid) {
      if (!session.user) {
        router.push("/");
      }

      setIsMe(uid === session.user.id);
      Promise.all([getUser(uid), getGiftsForUser(uid)]).then(
        ([user, gifts]) => {
          setUser(user);
          setGifts(gifts);
          setLoading(false);
        }
      );
    }
  }, [session, uid]);

  if (loading || !user) {
    return <Loader />;
  }

  const emptyWishlistMessage = isMe
    ? "You haven't added any gifts to your wishlist yet. Click the add gift button below to get started!"
    : `${user.name} hasn't added any gifts to their wishlist yet!`;

  return (
    <>
      <Header
        title={`${
          isMe ? "My" : formPossessive(getFirstName(user?.name))
        } wishlist`}
        avatar={user.avatar_url}
      />
      {gifts.length === 0 ? (
        <Banner icon="fireplace" message={emptyWishlistMessage} />
      ) : (
        <List
          withDivider
          items={gifts.map((gift, index) => ({
            id: gift.id,
            label: (
              <>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 400,
                    fontFamily: variables.headerFont,
                  }}
                >
                  {index + 1} —{" "}
                </span>
                {gift.name}
              </>
            ),
            rightIcon: !isMe && gift.claimed_by?.user_id && (
              <>
                <IconCheck color={variables.colorGreen} stroke={2} />
                <Avatar url={gift.claimed_by.avatar_url} size={24} />
              </>
            ),
            onClick: () => router.push(`/users/${uid}/${gift.id}`),
          }))}
        />
      )}
      {canAddGifts && (
        <div className={styles.add}>
          <Button
            block
            icon="gift"
            onClick={() => router.push(`/users/${uid}/gift`)}
          >
            Add Gift
          </Button>
        </div>
      )}
    </>
  );
}
