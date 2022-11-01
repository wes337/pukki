import { useEffect } from "react";
import { useRouter } from "next/router";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

export default function Login() {
  const router = useRouter();
  const session = useSession();
  const supabaseClient = useSupabaseClient();

  useEffect(() => {
    if (session) {
      router.push("/users");
    }
  }, [session, router]);

  return (
    <Auth
      supabaseClient={supabaseClient}
      providers={["facebook"]}
      appearance={{ theme: ThemeSupa }}
      onlyThirdPartyProviders
    />
  );
}
