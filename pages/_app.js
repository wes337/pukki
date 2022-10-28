import { useState } from "react";
import Head from "next/head";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { SignOut, Card, Footer } from "../components";
import "../styles/index.scss";

export default function MyApp({ Component, pageProps }) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  return (
    <>
      <Head>
        <title>Pukki</title>
      </Head>
      <div className="main">
        <main>
          <SessionContextProvider
            supabaseClient={supabaseClient}
            initialSession={pageProps.initialSession}
          >
            <SignOut />
            <Card>
              <Component {...pageProps} />
            </Card>
            <Footer />
          </SessionContextProvider>
        </main>
      </div>
    </>
  );
}
