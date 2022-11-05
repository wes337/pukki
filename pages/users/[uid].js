import { useRouter } from "next/router";
import { useSession } from "@supabase/auth-helpers-react";
import { withPageAuth } from "@supabase/auth-helpers-nextjs";
import { IconCheck } from "@tabler/icons";
import variables from "../../styles/variables.module.scss";
import { isAdmin, isTestUser, getFirstName } from "../../utils/users";
import useTranslate from "../../hooks/useTranslate";
import { Header, Avatar, Banner, Button, List } from "../../components";
import styles from "./users.module.scss";

export default function User({ user, gifts }) {
  const session = useSession();
  const router = useRouter();
  const translate = useTranslate();
  const { uid } = router.query;
  const isMe = uid === session.user.id;

  const canAddGifts =
    isMe || (isTestUser(user.user_id) && session && isAdmin(session.user.id));

  return (
    <>
      <Header
        title={
          isMe
            ? translate("my-wishlist")
            : translate("user's-wishlist", {
                name: getFirstName(user?.name),
              })
        }
        avatar={user.avatar_url}
      />
      {gifts.length === 0 ? (
        <Banner
          icon="fireplace"
          title={translate("no-gifts")}
          message={
            isMe
              ? translate("you-haven't-added-any-gifts-yet")
              : translate("user-hasn't-added-any-gifts-yet", {
                  name: user.name,
                })
          }
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
            {translate("add-gift")}
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
