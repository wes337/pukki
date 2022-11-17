import { useSupabaseClient } from "@supabase/auth-helpers-react";
import useTranslate from "../hooks/useTranslate";

export default function Login() {
  const supabase = useSupabaseClient();
  const translate = useTranslate();

  const signInWithFacebook = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "facebook",
    });
  };

  return (
    <button onClick={signInWithFacebook}>{translate("sign-in-with")}</button>
    // <Auth
    //   supabaseClient={supabaseClient}
    //   providers={["facebook"]}
    //   appearance={{ theme: ThemeSupa }}
    //   onlyThirdPartyProviders
    //   localization={{
    //     variables: {
    //       sign_in: {
    //         social_provider_text: translate("sign-in-with"),
    //       },
    //     },
    //   }}
    // />
  );
}
