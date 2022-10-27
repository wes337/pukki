import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { getAllUsers } from "../actions/users";
import { getAllGifts } from "../actions/gifts";
import { List, Loader } from "../components";
import { getFirstName } from "../utils/users";
import { formPossessive } from "../utils/string";
import styles from "./users.module.scss";
import ProgressBar from "../components/ProgressBar/ProgressBar";

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

    const me = users.find((user) => user.user_id === session.user.id);

    return [me, ...usersWithPercentages];
  }, [users, gifts, session]);

  useEffect(() => {
    setLoading(true);

    if (session) {
      if (!session.user) {
        router.push("/");
      } else {
        Promise.all([getAllUsers(supabase), getAllGifts(supabase)]).then(
          ([users, gifts]) => {
            const usersWithMeFirst = users.sort(
              (user) => user.user_id !== session.user.id
            );
            setUsers(usersWithMeFirst);
            setGifts(gifts);
            setLoading(false);
          }
        );
      }
    }
  }, [session]);

  const renderUserListItem = (user) => {
    const isMe = user.user_id === session.user.id;

    return (
      <div className={styles.list}>
        <div>
          {isMe
            ? "My wishlist"
            : `${formPossessive(getFirstName(user.name))} wishlist`}
        </div>
        {!isMe && (
          <span>
            <ProgressBar percent={user.percentage} />
          </span>
        )}
      </div>
    );
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <List
      items={usersWithGiftPercentages.map((user, index) => ({
        id: user.user_id,
        onClick: () => router.push(`/user/${user.user_id}`),
        label: renderUserListItem(user),
        icon: user.avatar_url,
        divider: index === 0,
      }))}
    />
  );
}
