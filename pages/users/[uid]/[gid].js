import { useState } from "react";
import { useRouter } from "next/router";
import { withPageAuth } from "@supabase/auth-helpers-nextjs";
import { useSession } from "@supabase/auth-helpers-react";
import { removeGift, claimGift } from "../../../actions/gifts";
import useTranslate from "../../../hooks/useTranslate";
import { isAdmin, isTestUser, getFirstName } from "../../../utils/users";
import { isValidUrl } from "../../../utils/string";
import { Banner, Button, Header, Icon, Loader } from "../../../components";
import styles from "./gift.module.scss";

export default function Gift({ user, gift: initialGift, fromMyGifts }) {
  const session = useSession();
  const router = useRouter();
  const translate = useTranslate();
  const [gift, setGift] = useState(initialGift);
  const [loading, setLoading] = useState(false);
  const { locale, query } = router;
  const { uid, gid } = query;
  const isMe = uid === session.user.id;

  const claimAndUpdateGift = (userId) => {
    setLoading(true);
    claimGift(gift.id, userId).then((claimedGift) => {
      setGift((gift) => ({
        ...gift,
        ...claimedGift,
      }));
      setLoading(false);
    });
  };

  const renderOwnGiftButtons = () => {
    return (
      <>
        <Button
          icon="bauble-alt"
          onClick={() => router.push(`/users/${gift.user}/${gift.id}/edit`)}
          block
        >
          {translate("edit")}
        </Button>
        <Button
          icon="bauble"
          variant="secondary"
          onClick={() => {
            setLoading(true);
            removeGift(gid).then(() => router.push(`/users/${gift.user}`));
          }}
          block
        >
          {translate("delete")}
        </Button>
      </>
    );
  };

  const renderGiftButtons = () => {
    if (gift.claimed_by) {
      const claimedByMe =
        gift.claimed_by.user_id === session.user.id ||
        gift.claimed_by === session.user.id;

      return (
        <div className={styles.claimed}>
          <div>
            <Icon name="ornament" size={32} />
            <div>
              {claimedByMe
                ? translate("you-are-buying")
                : translate("user-is-buying", {
                    name: getFirstName(gift.claimed_by.name),
                  })}
              <br />
              <span>{gift.name}</span>
            </div>
            <br />
            <div>
              {locale === "en" && (
                <>
                  {translate("for")}
                  <br />
                </>
              )}
              <span>
                {translate("for-user", { name: getFirstName(user.name) })}
              </span>
            </div>
            <Icon name="ornament" size={32} />
          </div>
          {claimedByMe && (
            <Button
              icon="reindeer"
              variant="secondary"
              block
              onClick={() => claimAndUpdateGift(null)}
            >
              {translate("nevermind-im-not-buying-this")}
            </Button>
          )}
        </div>
      );
    }

    return (
      <Button
        icon="gift-bag"
        block
        onClick={() => claimAndUpdateGift(session.user.id)}
      >
        {translate("i'll-buy-it")}
      </Button>
    );
  };

  const renderFooterButtons = () => {
    if (isTestUser(uid) && isAdmin(session.user.id)) {
      return (
        <div>
          {renderGiftButtons()}
          {renderOwnGiftButtons()}
        </div>
      );
    }

    if (isMe) {
      return renderOwnGiftButtons();
    }

    return renderGiftButtons();
  };

  if (!gift) {
    return (
      <Banner
        icon="globe"
        title="404"
        message={translate("gift-not-found")}
        action={{
          label: translate("back"),
          callback: () => router.push(`/users/${uid}`),
        }}
      />
    );
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={styles.gift}>
      <Header
        title={translate("user's-wishlist", {
          name: isMe ? "My" : getFirstName(user?.name),
        })}
        avatar={user.avatar_url}
        back={fromMyGifts && "/gifts"}
      />
      <div className={styles.body}>
        <h5>
          <span>
            {isMe
              ? translate("you-want")
              : translate("user-wants", { name: getFirstName(user?.name) })}
          </span>
          {gift.name}
        </h5>
        {gift.url && (
          <h5>
            <span>{translate("where-can-you-buy-it")}</span>
            {isValidUrl(gift.url) ? (
              <Button
                icon="gift-alt"
                onClick={() => window.open(gift.url, "_blank")}
              >
                {translate("click-here")}
              </Button>
            ) : (
              gift.url
            )}
          </h5>
        )}
        {gift.description && (
          <blockquote className={styles.quote}>
            {gift.description}
            <cite>{user?.name}</cite>
          </blockquote>
        )}
      </div>
      <div className={styles.footer}>{renderFooterButtons()}</div>
    </div>
  );
}

export const getServerSideProps = withPageAuth({
  redirectTo: "/login",
  async getServerSideProps(ctx, supabase) {
    const { uid, gid } = ctx.params;

    const {
      data: [user],
    } = await supabase
      .from("users")
      .select("user_id, name, avatar_url")
      .eq("user_id", uid);

    const {
      data: [gift],
    } = await supabase
      .from("gifts")
      .select("id, name, claimed_by ( user_id, name ), user, description, url")
      .eq("id", gid);

    const fromMyGifts = ctx.req.headers.referer.includes("/gifts");

    return { props: { user, gift: gift || null, fromMyGifts } };
  },
});
