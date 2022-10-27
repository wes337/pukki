import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { IconCheck } from "@tabler/icons";
import variables from "../../styles/variables.module.scss";
import { isAdmin, isTestUser, getFirstName } from "../../utils/users";
import { formPossessive } from "../../utils/string";
import { getAllUsers, getUser } from "../../actions/users";
import { getGifts } from "../../actions/gifts";
import { Avatar, Banner, Button, List, Loader } from "../../components";
import styles from "./user.module.scss";

export default function User() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState();
  const [allUsers, setAllUsers] = useState([]);
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
      Promise.all([
        getUser(supabase, uid),
        getGifts(supabase, uid),
        getAllUsers(supabase),
      ]).then(([user, gifts, allUsers]) => {
        setUser(user);
        setGifts(gifts);
        setAllUsers(allUsers);
        setLoading(false);
      });
    }
  }, [session, uid]);

  const getUserAvatar = (userId) => {
    const user = allUsers.find((user) => user.user_id === userId);
    return user.avatar_url;
  };

  if (loading || !user) {
    return <Loader />;
  }

  const emptyWishlistMessage = isMe
    ? "You haven't added any gifts to your wishlist yet. Click the add gift button below to get started!"
    : `${user.name} hasn't added any gifts to their wishlist yet!`;

  return (
    <>
      <div className={styles.header}>
        <Button
          icon="christmas-tree"
          variant="outline"
          onClick={() => router.push("/users")}
        >
          Back
        </Button>
        <h4>
          <span>{isMe ? "My" : formPossessive(getFirstName(user?.name))}</span>
          wishlist
        </h4>
        <Avatar url={user.avatar_url} size={36} />
      </div>
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
            rightIcon: !isMe && gift.claimed_by && (
              <>
                <IconCheck color={variables.colorGreen} stroke={2} />
                <Avatar url={getUserAvatar(gift.claimed_by)} size={24} />
              </>
            ),
            onClick: () => router.push(`/user/${uid}/${gift.id}`),
          }))}
        />
      )}
      {canAddGifts && (
        <div className={styles.add}>
          <Button
            block
            icon="gift"
            onClick={() => router.push(`/user/${uid}/gift`)}
          >
            Add Gift
          </Button>
        </div>
      )}
    </>
  );
}
