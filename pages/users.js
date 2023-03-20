import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { getAllUsers } from "../actions/users";
import { getAllGifts } from "../actions/gifts";
import { getUserName, getFirstName } from "../utils/users";
import useTranslate from "../hooks/useTranslate";
import { Button, List, Loader, ProgressBar, Avatar } from "../components";
import styles from "./users.module.scss";

export default function Users() {
  const [loading, setLoading] = useState(false);
  const supabase = useSupabaseClient();
  const [users, setUsers] = useState([]);
  const [gifts, setGifts] = useState([]);
  const session = useSession();
  const router = useRouter();
  const translate = useTranslate();

  useEffect(() => {
    setLoading(true);

    const updateUser = async () => {
      const updatedUser = {
        user_id: session.user.id,
        name: getUserName(session.user),
        avatar_url: session.user.user_metadata?.avatar_url,
      };

      await supabase
        .from("users")
        .upsert(updatedUser, { onConflict: "user_id" })
        .select();
    };

    Promise.all([updateUser(), getAllUsers(), getAllGifts()]).then(
      ([_, users, gifts]) => {
        setUsers(users);
        setGifts(gifts);
        setLoading(false);
      }
    );
  }, [session, supabase]);

  const usersWithGiftPercentages = useMemo(() => {
    if (!session || !users || !gifts) {
      return [];
    }

    const usersWithPercentages = users
      .map((user) => {
        if (user.user_id === session.user.id) {
          return null;
        }
        const userGifts = gifts.filter((gift) => gift.user === user.user_id);
        const userGiftsClaimed = userGifts.filter((gift) => gift.claimed_by);

        const percentage =
          Math.floor((userGiftsClaimed.length / userGifts.length) * 100) || 0;

        return { ...user, percentage };
      })
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name))
      .sort((a, b) => b.percentage - a.percentage);

    return usersWithPercentages;
  }, [users, gifts, session]);

  const renderUserListItem = (user) => {
    return (
      <div className={styles.item}>
        <div>
          {translate("user's-wishlist", { name: getFirstName(user.name) })}
        </div>
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
          onClick={() => {
            setLoading(true);
            router.push(`/users/${session.user.id}`);
          }}
        >
          {translate("my-wishlist")}
        </Button>
        <Button
          icon="sock"
          variant="outline"
          block
          onClick={() => {
            setLoading(true);
            router.push("/gifts");
          }}
        >
          {translate("gifts-i'm-buying")}
        </Button>
      </div>
      <hr />
      <List
        items={usersWithGiftPercentages.map((user) => ({
          id: user.user_id,
          onClick: () => {
            setLoading(true);
            router.push(`/users/${user.user_id}`);
          },
          label: renderUserListItem(user),
          icon: <Avatar url={user.avatar_url} size={24} />,
        }))}
      />
    </div>
  );
}

export const getServerSideProps = async (ctx) => {
  const supabase = createServerSupabaseClient(ctx);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session)
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };

  return {
    props: {
      initialSession: session,
      user: session.user,
    },
  };
};
