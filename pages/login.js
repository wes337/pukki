import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import useTranslate from "../hooks/useTranslate";

export default function Login() {
  const supabaseClient = useSupabaseClient();
  const translate = useTranslate();

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
