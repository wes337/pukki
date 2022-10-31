import { useRouter } from "next/router";
import { useSession } from "@supabase/auth-helpers-react";
import { withPageAuth } from "@supabase/auth-helpers-nextjs";
import { IconCheck } from "@tabler/icons";
import variables from "../../styles/variables.module.scss";
import { isAdmin, isTestUser, getFirstName } from "../../utils/users";
import { formPossessive } from "../../utils/string";
import { Header, Avatar, Banner, Button, List } from "../../components";
import styles from "./users.module.scss";

export default function User({ user, gifts }) {
  const session = useSession();
  const router = useRouter();
  const { uid } = router.query;
  const isMe = uid === session.user.id;

  const canAddGifts =
    isMe || (isTestUser(user.user_id) && session && isAdmin(session.user.id));

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
        <Banner
          icon="fireplace"
          title="No gifts!"
          message={emptyWishlistMessage}
        />
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

export const getServerSideProps = withPageAuth({
  redirectTo: "/login",
  async getServerSideProps(ctx, supabase) {
    const { uid } = ctx.params;

    const {
      data: [user],
    } = await supabase
      .from("users")
      .select("user_id, name, avatar_url")
      .eq("user_id", uid);

    const { data: gifts } = await supabase
      .from("gifts")
      .select("id, name, claimed_by ( user_id, avatar_url )")
      .eq("user", uid);

    return { props: { user, gifts } };
  },
});
