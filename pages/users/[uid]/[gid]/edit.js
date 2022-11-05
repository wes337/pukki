import { withPageAuth } from "@supabase/auth-helpers-nextjs";
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

export const getServerSideProps = withPageAuth({
  redirectTo: "/login",
});
