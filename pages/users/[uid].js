import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { useSession } from "@supabase/auth-helpers-react";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { IconCheck } from "@tabler/icons";
import variables from "../../styles/variables.module.scss";
import { getUser } from "../../actions/users";
import { getGiftsForUser } from "../../actions/gifts";
import { isAdmin, getFirstName } from "../../utils/users";
import useTranslate from "../../hooks/useTranslate";
import { Header, Avatar, Banner, Button, List, Loader } from "../../components";
import styles from "./users.module.scss";

export default function User() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState();
  const [gifts, setGifts] = useState([]);
  const session = useSession();
  const router = useRouter();
  const translate = useTranslate();
  const { uid } = router.query;
  const isMe = uid === session?.user?.id;

  const canAddGifts = useMemo(
    () => isMe || isAdmin(session?.user?.id),
    [isMe, session]
  );

  useEffect(() => {
    setLoading(true);
    Promise.all([getUser(uid), getGiftsForUser(uid)]).then(([user, gifts]) => {
      setUser(user);
      setGifts(gifts);
      setLoading(false);
    });
  }, [uid]);

  if (loading || !user) {
    return <Loader />;
  }

  return (
    <>
      <Header
        title={
          isMe
            ? translate("my-wishlist")
            : translate("user's-wishlist", {
                name: getFirstName(user.name),
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
            onClick: () => {
              setLoading(true);
              router.push(`/users/${uid}/${gift.id}`);
            },
          }))}
        />
      )}
      {canAddGifts && (
        <div className={styles.add}>
          <Button
            block
            icon="gift"
            onClick={() => {
              setLoading(true);
              router.push(`/users/${uid}/gift`);
            }}
          >
            {translate("add-gift")}
          </Button>
        </div>
      )}
    </>
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
