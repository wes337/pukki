import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  useUser,
  useSupabaseClient,
  useSession,
} from "@supabase/auth-helpers-react";
import { getUsers } from "../actions/users";
import { List, Loader } from "../components";
import { formPossessive } from "../utils/string";

export default function Users() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const session = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    setLoading(true);

    if (session) {
      if (!session.user) {
        router.push("/");
      } else {
        getUsers(supabase).then((users) => {
          const usersWithMeFirst = users.sort(
            (user) => user.user_id !== session.user.id
          );
          setUsers(usersWithMeFirst);
          setLoading(false);
        });
      }
    }
  }, [session]);

  if (!user) {
    return null;
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <List
      items={users.map((user) => ({
        id: user.user_id,
        onClick: () => router.push(`/user/${user.user_id}`),
        label:
          user.user_id === session.user.id
            ? "Your wishlist"
            : `${formPossessive(user.name)} wishlist`,
        icon: user.avatar_url,
      }))}
    />
  );
}
