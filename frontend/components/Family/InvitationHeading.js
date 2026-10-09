import styles from "./Family.module.scss";

export default function InvitationHeading({ name }) {
  const titleSize = Math.max(32, Math.min(64, 64 * 14 / [...name].length));
  return <>
    <img className={styles.invitationArtwork} src="/images/icons/fireplace.png" width={88} height={88} alt="" />
    <h1 id="invited-family" className={styles.familyTitle} style={{ "--family-title-size": `${titleSize}px` }}>
      <img className={styles.titleMistletoe} src="/images/icons/mistletoe.png" width={40} height={40} alt="" />
      <span className={styles.titleText}>{name}</span>
      <img className={styles.titleGift} src="/images/icons/gift.png" width={40} height={40} alt="" />
    </h1>
  </>;
}
