import { Header } from "../components";
import { contactEmail } from "../config";
import styles from "./page.module.scss";
import privacyStyles from "./privacy.module.scss";

export default function Privacy() {
  return (
    <div className={styles.page}>
      <Header title="Privacy Policy" />
      <div className={privacyStyles.policy}>
        <p className={privacyStyles.updated}>Updated 9 October 2026</p>
        <p>
          Pukki is a family wishlist app by WesWare. For privacy questions or data
          requests, email <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
        </p>
        <section>
          <h2>What we store</h2>
          <p>
            Your username, name, selected avatar, password hash, family membership,
            family name and invitation code. We also store gift names, descriptions,
            links, and who has chosen to get each gift, plus account and family creation dates.
          </p>
          <p>
            We keep login sessions and records of sign-in and family-joining attempts
            to limit repeated attempts. Passwords are stored as salted hashes, not readable
            passwords. Signup does not require an email address. If you email us,
            we receive your address and the information in your message.
          </p>
        </section>
        <section>
          <h2>How we use it</h2>
          <p>
            We use this information to run your account, display family wishlists,
            coordinate gifts, protect accounts, and respond to support and privacy
            requests. We do not sell your personal information or use it for advertising.
          </p>
        </section>
        <section>
          <h2>What your family can see</h2>
          <p>
            Family members can see your first name, avatar, and wishlist. Other
            members can see who has chosen to get a gift; its recipient cannot.
            Wishlists are available to signed-in members of the same family.
          </p>
          <p>
            Anyone with a valid family code, invitation link, or QR code can join
            immediately and see the family&apos;s wishlists. Share invitations with care.
          </p>
        </section>
        <section>
          <h2>Cookies and service providers</h2>
          <p>
            Pukki uses a session cookie to keep you signed in for up to 14 days.
            Signing out ends that session. We do not use advertising cookies or
            analytics trackers in the app.
          </p>
          <p>
            We use Vercel to host the website, Fly.io to run the server, and
            DigitalOcean to store app data. These providers process information
            needed to deliver the service, which can include IP addresses and
            technical request logs. Fonts load from Google Fonts, so your browser
            also connects to Google when loading them.
          </p>
          <p>
            Links to shops and other websites open services with their own privacy policies.
          </p>
        </section>
        <section>
          <h2>Keeping and deleting data</h2>
          <p>
            Account, family, and wishlist information stays in the app until it is
            deleted; inactive accounts are not automatically removed. You can edit
            or delete your own gifts at any time. Sessions expire after 14 days,
            and expired session and login-attempt records are cleared during
            later sign-in activity.
          </p>
          <p>
            To request account deletion, a copy of your data, or a correction,
            email <a href={`mailto:${contactEmail}`}>{contactEmail}</a> with your
            username. We may need to verify that the account is yours. Do not send
            your password. Deleted data may remain in provider backups until those
            backups expire.
          </p>
          <p>
            Depending on the law where you live, you may also have rights to restrict
            or object to processing, receive a portable copy of your data, and
            complain to your local data protection authority.
          </p>
        </section>
        <section>
          <h2>Policy updates</h2>
          <p>
            We will publish updates here and change the date above when this policy changes.
          </p>
        </section>
      </div>
    </div>
  );
}
