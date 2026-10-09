import { useRouter } from "next/router";
import { useSession } from "../../hooks/useAuth";
import { FiCheck } from "react-icons/fi";
import variables from "../../styles/variables.module.scss";
import { useFamilyData } from "../../hooks/useFamilyData";
import { getFirstName } from "../../utils/users";
import useTranslate from "../../hooks/useTranslate";
import { Header, Avatar, Banner, Button, List, Loader, ProgressBar } from "../../components";
import styles from "./users.module.scss";

export default function User() {
  const { users, gifts: familyGifts, loading, error } = useFamilyData();
  const session = useSession();
  const router = useRouter();
  const translate = useTranslate();
  const { uid } = router.query;
  const user = users?.find((member) => member.user_id === uid);
  const gifts = familyGifts?.filter((gift) => gift.user === uid) ?? [];
  const isMe = uid === session?.user?.id;
  const percentage = gifts.length
    ? Math.floor((gifts.filter((gift) => gift.claimed_by).length / gifts.length) * 100)
    : 0;

  const canAddGifts = isMe;

  if (error) return <p role="alert">{translate(error)}</p>;

  if (loading) {
    return <Loader />;
  }
  if (!user) return <p role="alert">{translate("User not found.")}</p>;

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
        avatar={isMe ? undefined : user.avatar_url}
      />
      {!isMe && gifts.length > 0 && (
        <div className={styles.wishlistProgress}>
          <ProgressBar percent={percentage} />
        </div>
      )}
      {gifts.length === 0 ? (
        <Banner
          icon="fireplace"
          title={translate("no-gifts")}
          message={
            isMe
              ? translate("you-haven't-added-any-gifts-yet")
              : translate("user-hasn't-added-any-gifts-yet", {
                  name: getFirstName(user.name),
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
                    marginRight: 12,
                    display: "inline-block",
                    transform: "translateY(-1px) scale(1.2)",
                    transformOrigin: "left center",
                  }}
                >
                  {index + 1}{" "}
                </span>
                {gift.name}
              </>
            ),
            rightIcon: !isMe && gift.claimed_by?.user_id && (
              <>
                <FiCheck color={variables.colorGreen} size={24} aria-hidden="true" />
                <Avatar url={gift.claimed_by.avatar_url} size={24} />
              </>
            ),
            onClick: () => {
              router.push(`/users/${uid}/${gift.id}`);
            },
          }))}
        />
      )}
      {canAddGifts && <div className={styles.add}>
        <Button icon="gift" block onClick={() => {
          router.push(`/users/${uid}/gift`);
        }}>{translate("add-gift")}</Button>
      </div>}
    </>
  );
}
