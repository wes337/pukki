import { useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "../../../hooks/useAuth";
import { useFamilyData, useGiftActions } from "../../../hooks/useFamilyData";
import useTranslate from "../../../hooks/useTranslate";
import { getFirstName } from "../../../utils/users";
import { getWebUrl, formatWebUrl } from "../../../utils/string";
import { Banner, Button, Header, Icon, Loader } from "../../../components";
import ConfirmDialog from "../../../components/ConfirmDialog/ConfirmDialog";
import styles from "./gift.module.scss";

export default function Gift() {
  const { users, gifts, loading, error, refresh } = useFamilyData();
  const { deleteGift, setClaim } = useGiftActions();
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [previewClaimed, setPreviewClaimed] = useState(true);
  const session = useSession();
  const router = useRouter();
  const translate = useTranslate();
  const { locale, query } = router;
  const { uid, gid } = query;
  const preview = process.env.NODE_ENV === "development" && query.preview === "1";
  const viewerId = preview ? "preview-giver" : session?.user.id;
  const gift = preview ? {
    id: "preview-gift", user: "preview-recipient", name: "A cosy winter reading set",
    url: "Any grocery store",
    description: "A soft wool blanket, a ceramic mug, and a good mystery novel for snowy evenings. I love forest green and warm cream colours. A second-hand book would be lovely too!",
    claimed_by: previewClaimed ? { user_id: viewerId, name: "Alex" } : null,
  } : gifts?.find((item) => item.id === gid && item.user === uid) ?? confirmDelete;
  const user = preview ? { name: "Taylor", avatar_url: "/images/avatars/winter-glasses.png" }
    : users?.find((member) => member.user_id === uid);
  const isMe = !preview && uid === viewerId;

  const claimAndUpdateGift = (userId) => {
    if (preview) { setPreviewClaimed(Boolean(userId)); return; }
    if (busy) return;
    setBusy(true);
    setActionError("");
    setClaim(gift.id, userId).then(() => {
      setBusy(false);
    }).catch((error) => {
      setActionError(error.message);
      setBusy(false);
      void refresh().catch(() => {});
    });
  };

  const renderOwnGiftButtons = () => {
    return (
      <>
        <Button
          icon="bauble-alt"
          onClick={() => {
            router.push(`/users/${gift.user}/${gift.id}/edit`);
          }}
          block
        >
          {translate("edit")}
        </Button>
        <Button
          icon="bauble"
          variant="secondary"
          onClick={() => setConfirmDelete(gift)}
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
        gift.claimed_by.user_id === viewerId ||
        gift.claimed_by === viewerId;

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
              disabled={busy}
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
        disabled={busy}
        onClick={() => claimAndUpdateGift(viewerId)}
      >
        {translate("i'll-buy-it")}
      </Button>
    );
  };

  const renderFooterButtons = () => {
    if (isMe) {
      return renderOwnGiftButtons();
    }

    return renderGiftButtons();
  };

  if (!preview && error) return <p role="alert">{translate(error)}</p>;

  if (!preview && loading) return <Loader />;

  if (!gift || !user) {
    return (
      <Banner
        icon="globe"
        title="404"
        message={translate("gift-not-found")}
        action={{
          label: translate("back"),
          callback: () => {
            router.push(`/users/${uid}`);
          },
        }}
      />
    );
  }

  const purchaseUrl = getWebUrl(gift.url || "");

  return (
    <div className={styles.gift}>
      <Header
        title={
          isMe
            ? translate("my-wishlist")
            : translate("user's-wishlist", {
                name: getFirstName(user?.name),
              })
        }
        avatar={isMe ? undefined : user.avatar_url}
        back={preview ? "/about" : query.from === "shopping" && "/gifts"}
      />
      <div className={styles.body}>
        <h5 className={styles.giftName}>
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
            {purchaseUrl ? (
              <a className={styles.purchaseLink} href={purchaseUrl} target="_blank" rel="noopener noreferrer">
                {formatWebUrl(purchaseUrl)}
              </a>
            ) : (
              gift.url
            )}
          </h5>
        )}
        {gift.description && (
          <blockquote className={styles.quote}>
            {gift.description}
            <cite>{getFirstName(user?.name)}</cite>
          </blockquote>
        )}
      </div>
      {actionError && <p role="alert">{translate(actionError)}</p>}
      <div className={styles.footer}>{renderFooterButtons()}</div>
      {confirmDelete && <ConfirmDialog
        title="Delete this gift?"
        description={gift.name}
        confirmLabel={translate("Delete")}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={async () => {
          await deleteGift(gid);
          await router.push(`/users/${gift.user}`);
        }}
      />}
    </div>
  );
}
