import { useRouter } from "next/router";
import { withPageAuth } from "@supabase/auth-helpers-nextjs";
import useTranslate from "../hooks/useTranslate";
import { Header, Avatar, List, Banner } from "../components";
import variables from "../styles/variables.module.scss";
import styles from "./users.module.scss";

export default function Gifts({ gifts }) {
  const router = useRouter();
  const translate = useTranslate();

  return (
    <div className={styles.gifts}>
      <Header title={translate("gifts-i'm-buying")} />
      {gifts.length === 0 ? (
        <Banner
          icon="globe"
          title="No gifts!"
          message="You haven't claimed any gifts yet."
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
            rightIcon: <Avatar url={gift.user.avatar_url} size={24} />,
            onClick: () =>
              router.push(`/users/${gift.user.user_id}/${gift.id}`, undefined, {
                query: "k",
              }),
          }))}
        />
      )}
    </div>
  );
}

export const getServerSideProps = withPageAuth({
  redirectTo: "/login",
  async getServerSideProps(ctx, supabase) {
    const { res } = ctx;

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=10, stale-while-revalidate=59"
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: gifts } = await supabase
      .from("gifts")
      .select(
        `
        id,
        name,
        user (
          user_id,
          avatar_url
        ),
        claimed_by`
      )
      .eq("claimed_by", user.id);

    return { props: { gifts } };
  },
});
