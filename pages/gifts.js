import { useRouter } from "next/router";
import { withPageAuth } from "@supabase/auth-helpers-nextjs";
import { Header, Avatar, List } from "../components";
import variables from "../styles/variables.module.scss";
import styles from "./users.module.scss";

export default function Gifts({ gifts }) {
  const router = useRouter();

  return (
    <div className={styles.gifts}>
      <Header title="Gifts I'm buying" />
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
          onClick: () => router.push(`/users/${gift.user.user_id}/${gift.id}`),
        }))}
      />
    </div>
  );
}

export const getServerSideProps = withPageAuth({
  redirectTo: "/login",
  async getServerSideProps(ctx, supabase) {
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
