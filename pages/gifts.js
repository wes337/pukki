import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { withPageAuth } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import useTranslate from "../hooks/useTranslate";
import { getGiftsClaimedByUser } from "../actions/gifts";
import { Header, Avatar, List, Banner, Loader } from "../components";
import variables from "../styles/variables.module.scss";
import styles from "./users.module.scss";

export default function Gifts() {
  const [loading, setLoading] = useState(false);
  const [gifts, setGifts] = useState([]);
  const router = useRouter();
  const translate = useTranslate();
  const user = useUser();

  useEffect(() => {
    setLoading(true);
    getGiftsClaimedByUser(user.id).then((gifts) => {
      setGifts(gifts);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={styles.gifts}>
      <Header title={translate("gifts-i'm-buying")} />
      {gifts.length === 0 ? (
        <Banner
          icon="globe"
          title={translate("no-gifts")}
          message={translate("you-haven't-claimed-any-gifts-yet")}
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
              router.push(`/users/${gift.user.user_id}/${gift.id}`),
          }))}
        />
      )}
    </div>
  );
}

export const getServerSideProps = withPageAuth({
  redirectTo: "/login",
});
