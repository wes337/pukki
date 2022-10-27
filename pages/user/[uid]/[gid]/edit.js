import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { getGift } from "../../../../actions/gifts";
import { Loader } from "../../../../components";
import Gift from "../gift";

export default function EditGift() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [gift, setGift] = useState();

  const { uid, gid } = router.query;

  useEffect(() => {
    if (session && gid && uid) {
      setLoading(true);

      if (!session.user || uid !== session.user.id) {
        router.push("/");
      }

      getGift(supabase, gid).then((gift) => {
        setGift(gift);
        setLoading(false);
      });
    }
  }, [session, uid, gid]);

  if (loading) {
    return <Loader />;
  }

  return <Gift gift={gift} />;
}
