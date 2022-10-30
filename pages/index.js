import { useState, useEffect } from "react";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import { useSession } from "@supabase/auth-helpers-react";
import supabase from "../lib/supabaseClient";
import { updateUser } from "../actions/users";
import Users from "./users";

export default function Index() {
  const [ready, setReady] = useState(false);
  const session = useSession();

  useEffect(() => {
    if (!session) {
      setReady(false);
    } else {
      updateUser(supabase, session.user).then(() => setReady(true));
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
