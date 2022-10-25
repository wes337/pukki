import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { Avatar, Banner, Button, List, Loader } from "../../components";
import styles from "./user.module.scss";

export default function User() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState();
  const [gifts, setGifts] = useState([]);
  const [isMe, setIsMe] = useState(false);

  const { uid } = router.query;

  useEffect(() => {
    if (session && uid) {
      setLoading(true);
      setIsMe(uid === session.user.id);
      Promise.all([getUser(), getGifts()]).then(() => {
        setLoading(false);
      });
    }
  }, [session, uid]);

  async function getUser() {
    try {
      const { data, error } = await supabase
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

  async function getGifts() {
    try {
      let { data, error } = await supabase
        .from("gifts")
        .select("id, name")
        .eq("user", uid);

      if (error) {
        throw error;
      }

      setGifts(data);
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  if (loading || !user) {
    return <Loader />;
  }

  const emptyWishlistMessage = () => {
    if (isMe) {
      return "You haven't added any gifts to your wishlist yet. Click the add gift button below to get started!";
    }

    return `${user.name} hasn't added any gifts to their wishlist yet!`;
  };

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
        <h4>{isMe ? "Your" : `${user.name}'s`} wishlist</h4>
        <Avatar url={user.avatar_url} size={36} />
      </div>
      {gifts.length === 0 ? (
        <Banner icon="fireplace" message={emptyWishlistMessage()} />
      ) : (
        <List
          withDivider
          items={gifts.map((gift, index) => ({
            id: gift.id,
            label: (
              <>
                <span style={{ fontWeight: 600 }}>{index + 1}</span>
                {gift.name}
              </>
            ),
            onClick: () => router.push(`/user/${uid}/${gift.id}`),
          }))}
        />
      )}
      {isMe && (
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
