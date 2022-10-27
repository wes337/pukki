import { useState } from "react";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { Header, Card } from "../components";
import "../styles/index.scss";

export default function MyApp({ Component, pageProps }) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  return (
    <div className="main">
      <main>
        <SessionContextProvider
          supabaseClient={supabaseClient}
          initialSession={pageProps.initialSession}
        >
          <Header />
          <Card>
            <Component {...pageProps} />
          </Card>
        </SessionContextProvider>
      </main>
    </div>
  );
}
