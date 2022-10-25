import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { List, Loader } from "../components";

export default function Users() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!user) {
      router.push("/");
    } else {
      getUsers();
    }
  }, [user]);

  async function getUsers() {
    try {
      setLoading(true);

      const { data, error, status } = await supabase.from("users").select();

      if (error && status !== 406) {
        throw error;
      }

      setUsers(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

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
        label: user.name,
        icon: user.avatar_url,
      }))}
    />
  );
}
