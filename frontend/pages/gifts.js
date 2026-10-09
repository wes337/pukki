import { useRouter } from "next/router";
import { useUser } from "../hooks/useAuth";
import useTranslate from "../hooks/useTranslate";
import { useFamilyData } from "../hooks/useFamilyData";
import { Header, Avatar, List, Banner, Loader } from "../components";
import variables from "../styles/variables.module.scss";
import styles from "./page.module.scss";
import userStyles from "./users/users.module.scss";

export default function Gifts() {
  const { gifts: familyGifts, loading, error } = useFamilyData();
  const router = useRouter();
  const translate = useTranslate();
  const user = useUser();

  const gifts = familyGifts?.filter((gift) => gift.claimed_by?.user_id === user.id) ?? [];

  if (error) return <p role="alert">{translate(error)}</p>;

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={styles.page}>
      <Header title={translate("gifts-i'm-buying")} />
      {gifts.length === 0 ? (
        <Banner
          icon="globe"
          title={translate("no-gifts")}
          message={translate("you-haven't-claimed-any-gifts-yet")}
        />
      ) : (
        <div className={userStyles.memberList}><List
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
            rightIcon: <Avatar url={gift.users.avatar_url} size={36} />,
            onClick: () => {
              router.push(`/users/${gift.user}/${gift.id}?from=shopping`);
            },
          }))}
        /></div>
      )}
    </div>
  );
}
