import { useState, useEffect } from "react";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Users from "./users";
import { getUserName } from "../utils/user";

export default function Index() {
  const [ready, setReady] = useState(false);
  const session = useSession();
  const supabase = useSupabaseClient();

  useEffect(() => {
    if (!session) {
      setReady(false);
    } else {
      const user = {
        user_id: session.user.id,
        name: getUserName(session.user),
        avatar_url: session.user.user_metadata.avatar_url,
      };

      supabase
        .from("users")
        .upsert(user, { onConflict: "user_id" })
        .select()
        .then(() => {
          setReady(true);
        });
    }
  }, [session]);

  return ready ? (
    <Users />
  ) : (
    <Auth
      supabaseClient={supabase}
      providers={["facebook"]}
      appearance={{ theme: ThemeSupa }}
      onlyThirdPartyProviders
    />
  );
}
