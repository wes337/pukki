import { useEffect } from "react";
import { useRouter } from "next/router";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import {
  useSession,
  useSupabaseClient,
  useUser,
} from "@supabase/auth-helpers-react";
import useTranslate from "../hooks/useTranslate";

export default function Login() {
  const router = useRouter();
  const user = useUser();
  const session = useSession();
  const supabaseClient = useSupabaseClient();
  const translate = useTranslate();

  useEffect(() => {
    if (user || session) {
      router.push("/users");
    }
  }, [user, session, router]);

  return (
    <Auth
      supabaseClient={supabaseClient}
      providers={["facebook"]}
      appearance={{ theme: ThemeSupa }}
      onlyThirdPartyProviders
      localization={{
        variables: {
          sign_in: {
            social_provider_text: translate("sign-in-with"),
          },
        },
      }}
    />
  );
}
