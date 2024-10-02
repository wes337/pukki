import { Header } from "../components";
import styles from "./page.module.scss";

export default function Privacy() {
  return (
    <div className={styles.page}>
      <Header title={"Privacy Policy"} />
      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        <p>
          <em>Last Updated: 2 October 20204</em>
        </p>
        <p>
          Thank you for using Pukki, where users can log in and write their
          Christmas wishlists. Your privacy is very important to us. This
          Privacy Policy outlines how we handle and protect your personal
          information.
        </p>
        <p>
          1. Information We Collect
          <br /> When you use Facebook to log in to our app, we receive your
          basic profile information (such as your name and email address) from
          Facebook. The wishlists you create within the app are stored securely.
        </p>
        <p>
          2. How We Use Your Information
          <br /> We use your Facebook login information to authenticate your
          identity and allow you to access and use our app. We store the
          wishlists you create so that you can access them whenever you log in.
        </p>
        <p>
          3. Data Security
          <br /> We take appropriate security measures to protect your data
          against unauthorized access, alteration, disclosure, or destruction.
          However, please note that no method of transmission over the Internet
          or electronic storage is 100% secure.
        </p>
        <p>
          4. Data Sharing
          <br /> We do not share, sell, or trade your personal information with
          any third parties.
        </p>
        <p>
          5. Your Rights
          <br />
          You have the right to access, correct, or delete your personal data at
          any time. Please contact me at wesmoses@gmail.com if you need
          assistance with any of these actions.
        </p>
        <p>
          6. Changes to This Privacy Policy
          <br />
          We may update this Privacy Policy from time to time. We will notify
          you of any changes by posting the new policy on this page. You are
          advised to review this Privacy Policy periodically for any changes.
        </p>
        <p>
          7. Contact Us
          <br /> If you have any questions about this Privacy Policy, please
          contact us at wesmoses@gmail.com.
        </p>
        <p>By using Pukki, you agree to the terms of this Privacy Policy.</p>
        <p>Pukki</p>
        <p>wesmoses@gmail.com</p>
      </div>
    </div>
  );
}
