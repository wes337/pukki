import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { getFirstName } from "../utils/users";
import { formPossessive } from "../utils/string";
import { getAllUsers } from "../actions/users";
import { getAllGifts } from "../actions/gifts";
import { Button, List, Loader, ProgressBar } from "../components";
import styles from "./users.module.scss";

export default function Users() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [gifts, setGifts] = useState([]);

  const usersWithGiftPercentages = useMemo(() => {
    const usersWithPercentages = users
      .map((user) => {
        if (user.user_id === session.user.id) {
          return null;
        }
        const userGifts = gifts.filter((gift) => gift.user === user.user_id);
        const userGiftsClaimed = userGifts.filter((gift) => gift.claimed_by);

        const percentage = Math.floor(
          (userGiftsClaimed.length / userGifts.length) * 100
        );

        return { ...user, percentage };
      })
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name))
      .sort((a, b) => b.percentage - a.percentage);

    return usersWithPercentages;
  }, [users, gifts, session]);

  useEffect(() => {
    setLoading(true);

    if (session) {
      if (!session.user) {
        router.push("/");
      } else {
        Promise.all([getAllUsers(supabase), getAllGifts(supabase)]).then(
          ([users, gifts]) => {
            setUsers(users);
            setGifts(gifts);
            setLoading(false);
          }
        );
      }
    }
  }, [session]);

  const renderUserListItem = (user) => {
    return (
      <div className={styles.item}>
        <div>{formPossessive(getFirstName(user.name))} wishlist</div>
        <span>
          <ProgressBar percent={user.percentage} />
        </span>
      </div>
    );
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={styles.users}>
      <div className={styles.header}>
        <Button
          icon="greeting-card"
          block
          onClick={() => router.push(`/user/${session.user.id}`)}
        >
          My wishlist
        </Button>
        <Button
          icon="sock"
          variant="outline"
          block
          onClick={() => router.push("/gifts")}
        >
          Gifts I'm buying
        </Button>
      </div>
      <hr />
      <List
        items={usersWithGiftPercentages.map((user) => ({
          id: user.user_id,
          onClick: () => router.push(`/user/${user.user_id}`),
          label: renderUserListItem(user),
          icon: user.avatar_url,
        }))}
      />
    </div>
  );
}
