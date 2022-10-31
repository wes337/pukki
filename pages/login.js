import { useEffect } from "react";
import { useRouter } from "next/router";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";

export default function Index() {
  const router = useRouter();
  const user = useUser();
  const supabaseClient = useSupabaseClient();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user]);

  return (
    <Auth
      supabaseClient={supabaseClient}
      providers={["facebook"]}
      appearance={{ theme: ThemeSupa }}
      onlyThirdPartyProviders
    />
  );
}
