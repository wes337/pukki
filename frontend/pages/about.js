import Head from "next/head";
import Image from "next/image";
import { Header } from "../components";
import styles from "./about.module.scss";

export default function About() {
  return <section>
    <Head><title>About Pukki</title></Head>
    <Header title="About" />
    <div className={styles.content}>
      <div className={styles.artwork} aria-hidden="true">
        <Image className={styles.mistletoe} src="/images/icons/mistletoe.png" width={44} height={44} quality={100} alt="" />
        <Image className={styles.fireplace} src="/images/icons/fireplace.png" width={112} height={112} quality={100} alt="" />
        <Image className={styles.gifts} src="/images/icons/gift.png" width={60} height={60} quality={100} alt="" />
      </div>
      <h1>Christmas, together.</h1>
      <p>Share wishlists with your family, choose gifts to give, and keep the surprises.</p>
      <p>Our name comes from <span lang="fi">Joulupukki</span>, the Finnish name for Santa Claus.
        It literally means &ldquo;Christmas goat&rdquo;, a nod to old Finnish Christmas traditions.</p>
    </div>
  </section>;
}
