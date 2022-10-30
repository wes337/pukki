import { useState, useEffect } from "react";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { updateUser } from "../actions/users";
import Users from "./users";
import { Loader } from "../components";

export default function Index() {
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const supabaseClient = useSupabaseClient();
  const session = useSession();

  useEffect(() => {
    setLoading(true);
    if (!session) {
      setLoading(false);
      setReady(false);
    } else {
      updateUser(session.user).then(() => {
        setReady(true);
        setLoading(false);
      });
    }
  }, [session]);

  if (loading) {
    return <Loader />;
  }

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
