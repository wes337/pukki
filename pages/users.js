import { useMemo } from "react";
import { useRouter } from "next/router";
import { withPageAuth } from "@supabase/auth-helpers-nextjs";
import { useSession } from "@supabase/auth-helpers-react";
import { getFirstName } from "../utils/users";
import { formPossessive } from "../utils/string";
import { Button, List, ProgressBar } from "../components";
import styles from "./users.module.scss";

export default function Users({ users, gifts }) {
  const session = useSession();
  const router = useRouter();

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

  return (
    <div className={styles.users}>
      <div className={styles.header}>
        <Button
          icon="greeting-card"
          block
          onClick={() => router.push(`/users/${session.user.id}`)}
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
          onClick: () => router.push(`/users/${user.user_id}`),
          label: renderUserListItem(user),
          icon: user.avatar_url,
        }))}
      />
    </div>
  );
}

export const getServerSideProps = withPageAuth({
  redirectTo: "/",
  async getServerSideProps(ctx, supabase) {
    const { res } = ctx;

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=10, stale-while-revalidate=59"
    );

    const { data: users } = await supabase.from("users").select();
    const { data: gifts } = await supabase.from("gifts").select();

    return { props: { users, gifts } };
  },
});
