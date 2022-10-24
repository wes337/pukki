import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Divider, IconLogOut, Typography, Menu } from "@supabase/ui";

export default function Users() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user]);

  useEffect(() => {
    if (user) {
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
    return <Typography.Text>Loading...</Typography.Text>;
  }

  const Avatar = ({ imgUrl }) => (
    <img
      src={imgUrl}
      height={24}
      width={24}
      alt=""
      style={{ borderRadius: "100%", outline: "1px solid lightgray" }}
    />
  );

  return (
    <Menu>
      {users.map((user) => (
        <Menu.Item
          key={user.user_id}
          icon={<Avatar imgUrl={user.avatar_url} />}
          onClick={() => router.push(`/user/${user.user_id}`)}
        >
          {user.name}
        </Menu.Item>
      ))}
      <Divider light />
      <Menu.Item
        icon={<IconLogOut size={24} />}
        onClick={() => supabase.auth.signOut()}
      >
        Sign out
      </Menu.Item>
    </Menu>
  );
}
