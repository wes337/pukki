import { useEffect } from "react";
import { withPageAuth } from "@supabase/auth-helpers-nextjs";
import { getUserName } from "../utils/users";
import { Loader } from "../components";
import { useRouter } from "next/router";

export default function Index({ user }) {
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/users");
    }
  }, [user, router]);

  return <Loader />;
}

export const getServerSideProps = withPageAuth({
  redirectTo: "/login",
  async getServerSideProps(ctx, supabase) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const updatedUser = {
      user_id: session.user.id,
      name: getUserName(session.user),
      avatar_url: session.user.user_metadata?.avatar_url,
    };

    const { data } = await supabase
      .from("users")
      .upsert(updatedUser, { onConflict: "user_id" })
      .select();

    return {
      redirect: {
        permanent: false,
        destination: "/users",
      },
      props: { user: data[0] },
    };
  },
});
