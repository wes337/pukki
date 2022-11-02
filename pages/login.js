import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
// import { getUserName } from "../utils/users";
// import { updateUser } from "../actions/users";
import { Loader } from "../components";

export default function Login() {
  const router = useRouter();
  const session = useSession();
  const supabaseClient = useSupabaseClient();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      router.push("/");
    }
    // if (session?.user) {
    //   setLoading(true);
    //   updateUser({
    //     user_id: session.user.id,
    //     name: getUserName(session.user),
    //     avatar_url: session.user.user_metadata?.avatar_url,
    //   }).then(() => {
    //     router.push("/users");
    //   });
    // }
  }, [session, router]);

  if (loading) {
    return <Loader />;
  }

  return (
    <Auth
      supabaseClient={supabaseClient}
      providers={["facebook"]}
      appearance={{ theme: ThemeSupa }}
      onlyThirdPartyProviders
    />
  );
}
