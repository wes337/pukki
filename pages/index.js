import { useUser } from "@supabase/auth-helpers-react";
import Users from "./users";
import Login from "./login";

export default function Index() {
  const user = useUser();

  return user ? <Users /> : <Login />;
}
