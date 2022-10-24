import { useState } from "react";
import Image from "next/image";
import { Card, Space } from "@supabase/ui";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import "./../style.css";

export default function App({ Component, pageProps }) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  return (
    <div style={{ maxWidth: "420px", margin: "96px auto" }}>
      <header style={{ textAlign: "center" }}>
        <Image src="/images/logo.svg" height={120} width={420} alt="" />
      </header>
      <main>
        <SessionContextProvider
          supabaseClient={supabaseClient}
          initialSession={pageProps.initialSession}
        >
          <Card>
            <Space direction="vertical" size={8}>
              <Component {...pageProps} />
            </Space>
          </Card>
        </SessionContextProvider>
      </main>
    </div>
  );
}
