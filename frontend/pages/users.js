import { useMemo } from "react";
import { useRouter } from "next/router";
import { useSession } from "../hooks/useAuth";
import { useFamilyData } from "../hooks/useFamilyData";
import { getFirstName } from "../utils/users";
import useTranslate from "../hooks/useTranslate";
import { Button, List, Loader, ProgressBar, Avatar } from "../components";
import styles from "./page.module.scss";
import userStyles from "./users/users.module.scss";

export default function Users() {
  const { users, gifts, loading, error } = useFamilyData();
  const session = useSession();
  const router = useRouter();
  const translate = useTranslate();

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
      .sort((a, b) => getFirstName(a.name).localeCompare(getFirstName(b.name)))
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

  if (error) return <p role="alert">{error}</p>;

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={`${styles.page} ${userStyles.usersPage}`}>
      <div className={userStyles.primaryActions}>
      <div className={userStyles.familyHeader}>
        <h1>{session.user.family_name}</h1>
        {usersWithGiftPercentages.length > 0 && <Button variant="outlineRed" icon="fireplace" onClick={() => router.push("/family")}>
          {router.locale === "fi" ? "Kutsu perheesi" : "Invite"}
        </Button>}
      </div>
      <div className={`${styles.header} ${userStyles.wishlistActions}`}>
        <Button
          icon="greeting-card"
          block
          onClick={() => {
            router.push(`/users/${session.user.id}`);
          }}
        >
          {translate("my-wishlist")}
        </Button>
        <Button
          icon="sock"
          variant="secondary"
          block
          onClick={() => {
            router.push("/gifts");
          }}
        >
          {translate("gifts-i'm-buying")}
        </Button>
      </div>
      </div>
      <hr />
      {usersWithGiftPercentages.length === 0 && <div className={userStyles.emptyFamily}>
        <Button variant="outlineRed" icon="fireplace" iconSize={36} block onClick={() => router.push("/family")}>
          {router.locale === "fi" ? "Kutsu perheesi" : "Invite"}
        </Button>
      </div>}
      {usersWithGiftPercentages.length > 0 && <div className={userStyles.memberList}><List
        items={usersWithGiftPercentages.map((user) => ({
          id: user.user_id,
          onClick: () => {
            router.push(`/users/${user.user_id}`);
          },
          label: renderUserListItem(user),
          icon: <Avatar url={user.avatar_url} size={36} />,
        }))}
      /></div>}
    </div>
  );
}
