import { useState, useEffect } from "react";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { updateUser } from "../actions/users";
import Users from "./users";

export default function Index() {
  const [ready, setReady] = useState(false);
  const supabaseClient = useSupabaseClient();
  const session = useSession();

  useEffect(() => {
    if (!session) {
      setReady(false);
    } else {
      updateUser(session.user).then(() => setReady(true));
    }
  }, [session]);

  return ready ? (
    <Users />
  ) : (
    <Auth
      supabaseClient={supabaseClient}
      providers={["facebook"]}
      appearance={{ theme: ThemeSupa }}
      onlyThirdPartyProviders
    />
  );
}
