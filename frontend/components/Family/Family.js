import Input from "../Input/Input";
import FamilyCode from "./FamilyCode";
import { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
import Image from "next/image";
import { useSession } from "../../hooks/useAuth";
import BackButton from "../BackButton/BackButton";
import { request } from "../../actions/request";
import Button from "../Button/Button";
import Loader from "../Loader/Loader";
import { useToast } from "../Toast/Toast";
import styles from "./Family.module.scss";

const copy = {
  en: {
    title: "Christmas starts with family", intro: "Create a place for your family's wishlists, or join with a code someone shared with you.",
    create: "Create family", familyName: "Your family", example: "e.g. The Johnsons", nameHint: "Choose a name everyone will recognize.",
    join: "Join family", code: "Family code",
    haveCode: "Have a family code?", noCode: "Or start your own family", invited: "You've been invited",
    joinIntro: "Join the family to share your wishlist and see what everyone is hoping for.",
    share: "Invite your family", shareHint: "Share this code or let someone scan the QR code with their phone camera.",
    access: "Anyone with this code can join immediately. Share it only with people you want in your family.",
    copyCode: "Copy code", copyLink: "Copy invite link", codeCopied: "Family code copied.", linkCopied: "Invite link copied.",
    copyError: "Couldn't copy. Select and copy the code or link below.", back: "Let's go!", already: "You already belong to a family. Each account can join one family.",
    empty: "Invite someone to get started. Their wishlist will appear here when they join.", qr: "Scan to join this family", link: "Invitation link",
  },
  fi: {
    title: "Joulu alkaa perheestä", intro: "Luo paikka perheesi toivelistoille tai liity saamallasi koodilla.",
    create: "Luo perhe", familyName: "Perheen nimi", example: "Esim. Virtaset", nameHint: "Valitse nimi, jonka kaikki tunnistavat.",
    join: "Liity perheeseen", code: "Perhekoodi", codeHint: "Syötä 8 merkin koodi. Välilyönnit ja viivat sallitaan.",
    haveCode: "Onko sinulla perhekoodi?", noCode: "Tai luo oma perhe", invited: "Sinut on kutsuttu",
    joinIntro: "Liity perheeseen, jaa toivelistasi ja katso muiden toiveet.",
    share: "Kutsu perheesi", shareHint: "Jaa koodi tai pyydä toista skannaamaan QR-koodi puhelimen kameralla.",
    access: "Koodilla voi liittyä heti. Jaa se vain ihmisille, jotka haluat mukaan perheeseesi.",
    copyCode: "Kopioi koodi", copyLink: "Kopioi kutsulinkki", codeCopied: "Perhekoodi kopioitu.", linkCopied: "Kutsulinkki kopioitu.",
    copyError: "Kopiointi ei onnistunut. Valitse ja kopioi alla oleva koodi tai linkki.", back: "Perheen toivelistat", already: "Kuulut jo perheeseen. Yksi tili voi kuulua yhteen perheeseen.",
    empty: "Kutsu joku mukaan. Hänen toivelistansa näkyy täällä liittymisen jälkeen.", qr: "Liity perheeseen skannaamalla", link: "Kutsulinkki",
  },
};

export default function Family({ initialCode = "", joining = false }) {
  const codeLength = initialCode.replace(/[\s-]/g, "").length === 8 ? 8 : 6;
  const session = useSession();
  const showToast = useToast();
  const router = useRouter();
  const { locale } = router;
  const text = copy[locale] || copy.en;
  const [mode, setMode] = useState(joining ? "join" : "choose");
  const [code, setCode] = useState(initialCode.replace(/[\s-]/g, "").toUpperCase());
  const [codeAttempt, setCodeAttempt] = useState(0);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const familyId = session?.user.family_id;
  const { data: family, error: familyError } = useSWR(familyId ? "/family" : null, request);

  const submit = async (enteredCode = code) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await request(mode === "create" ? "/family" : "/family/join", {
        method: "POST", body: mode === "create" ? { name } : { code: enteredCode.slice(0, codeLength) },
      });
      const destination = mode === "create" ? "/family?created=1" : "/users";
      // Reload to replace the cached session after an account or membership change.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`${locale === "fi" ? "/fi" : ""}${destination}`);
    } catch (error) {
      const invalidCode = mode === "join" && (error.status === 400 || error.status === 404);
      setError(invalidCode ? "Invalid family code."
        : error.status === 429 ? "Too many attempts. Try again in 15 minutes."
        : mode === "join" ? "Couldn't join. Try again." : error.message);
      setBusy(false);
      if (invalidCode) {
        setCode("");
        // Remount the input to reset its caret and autofocus the first box.
        setCodeAttempt((attempt) => attempt + 1);
      }
    }
  };

  const updateCode = (next) => {
    setCode(next);
    if (next !== code && new RegExp(`^[A-HJ-NP-Z2-9]{${codeLength}}$`).test(next)) {
      void submit(next);
    }
  };

  const copyInvite = async (value, message) => {
    try { await navigator.clipboard.writeText(value); showToast(message); }
    catch { showToast(text.copyError, { tone: "error" }); }
  };

  if (familyId) {
    if (familyError && (!family || [401, 403].includes(familyError.status))) return <p role="alert">{familyError.message}</p>;
    if (!family) return <Loader />;
    const displayName = family.name;
    // Scale names longer than 14 characters down to 32px, then allow wrapping.
    const titleSize = Math.max(32, Math.min(64, 64 * 14 / [...displayName].length));
    const justCreated = router.query.created === "1";
    return <section className={styles.family}>
      {!justCreated && <BackButton onClick={() => router.push("/users")} />}
      <div>
        <h1 className={styles.familyTitle} style={{ "--family-title-size": `${titleSize}px` }}>
          <Image className={styles.titleMistletoe} src="/images/icons/mistletoe.png" width={40} height={40} alt="" />
          <span className={styles.titleText}>{displayName}</span>
          <Image className={styles.titleGift} src="/images/icons/gift.png" width={40} height={40} alt="" />
        </h1>
        {joining && <p>{text.already}</p>}
      </div>
      <div className={styles.inviteIntro}><h2>{text.share}</h2><p>{text.shareHint}</p></div>
      <div className={styles.invite}>
        <span>{text.code}</span>
        <strong className={styles.code}>{family.code.slice(0, family.code.length / 2)} {family.code.slice(family.code.length / 2)}</strong>
        <Image src={family.qr} width={256} height={256} alt={text.qr} unoptimized />
      </div>
      <div className={styles.shareActions}>
        <label className={styles.linkLabel}>{text.link}<Input readOnly value={family.joinUrl} onFocus={(event) => event.target.select()} /></label>
        <div className={styles.actions}>
          <Button onClick={() => copyInvite(family.code, text.codeCopied)}>{text.copyCode}</Button>
          <Button variant="secondary" onClick={() => copyInvite(family.joinUrl, text.linkCopied)}>{text.copyLink}</Button>
        </div>
        {justCreated && <div className={styles.continueAction}>
          <Button variant="secondary" icon="santa-claus" iconSize={40} block onClick={() => router.push("/users")}>{text.back}</Button>
        </div>}
      </div>
    </section>;
  }

  if (mode === "choose") return <section className={styles.choices} aria-label="Family setup">
    <Button icon="create-family" iconSize={56} block onClick={() => setMode("create")}>{text.create}</Button>
    <Button icon="join-family" iconSize={56} variant="secondary" block onClick={() => setMode("join")}>{text.join}</Button>
  </section>;

  if (busy) return <div role="status" aria-busy="true"><Loader /></div>;

  return <section className={`${styles.family} ${styles.setup}`}>
    {!joining && <BackButton onClick={() => { setMode("choose"); setCode(""); setError(""); }} disabled={busy} />}
    {joining && <div><h1>{text.invited}</h1><p>{text.joinIntro}</p></div>}
    <form className={styles.form} onSubmit={(event) => { event.preventDefault(); void submit(); }} aria-busy={busy}>
      {mode === "create" ? <label htmlFor="family-name"><span className={styles.familyName}>{text.familyName}</span>
        <Input id="family-name" value={name} onChange={(event) => setName(event.target.value)}
          required maxLength={80} placeholder={text.example} disabled={busy} />
      </label> : <FamilyCode key={codeAttempt} value={code} onChange={updateCode} label={text.code} disabled={busy}
        length={codeLength} />}
      <Button type="submit" icon={mode === "create" ? "create-family" : "join-family"} iconSize={32} block disabled={busy}>{mode === "create" ? text.create : text.join}</Button>
      {error && <p role="alert" className={styles.error}>{error}</p>}
    </form>
    <button type="button" className={styles.switch} disabled={busy}
      onClick={() => { setMode(mode === "create" ? "join" : "create"); setCode(""); setError(""); }}>
      {mode === "create" ? text.haveCode : text.noCode}
    </button>
  </section>;
}
