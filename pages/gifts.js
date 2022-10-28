import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { getGiftsClaimedBy } from "../actions/gifts";
import { Header, Avatar, List, Loader } from "../components";
import variables from "../styles/variables.module.scss";
import styles from "./users.module.scss";

export default function Gifts() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [gifts, setGifts] = useState([]);

  useEffect(() => {
    setLoading(true);

    if (session) {
      if (!session.user) {
        router.push("/");
      } else {
        getGiftsClaimedBy(supabase, session.user.id).then((gifts) => {
          setGifts(gifts);
          setLoading(false);
        });
      }
    }
  }, [session]);

  if (loading) {
    return <Loader />;
  }

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
          onClick: () => router.push(`/user/${gift.user.user_id}/${gift.id}`),
        }))}
      />
    </div>
  );
}
