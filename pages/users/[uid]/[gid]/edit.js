import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getGift } from "../../../../actions/gifts";
import { Loader } from "../../../../components";
import Gift from "../gift";

export default function EditGift() {
  const [loading, setLoading] = useState(false);
  const [gift, setGift] = useState();
  const router = useRouter();
  const { gid } = router.query;

  useEffect(() => {
    setLoading(true);
    getGift(gid).then((gift) => {
      setGift(gift);
      setLoading(false);
    });
  }, [gid]);

  if (loading) {
    return <Loader />;
  }

  return <Gift gift={gift} />;
}

export const getServerSideProps = async (ctx) => {
  const supabase = createServerSupabaseClient(ctx);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session)
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };

  return {
    props: {
      initialSession: session,
      user: session.user,
    },
  };
};
