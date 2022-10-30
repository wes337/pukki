import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "@supabase/auth-helpers-react";
import { getGift } from "../../../../actions/gifts";
import { Loader } from "../../../../components";
import Gift from "../gift";

export default function EditGift() {
  const session = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [gift, setGift] = useState();

  const { uid, gid } = router.query;

  useEffect(() => {
    setLoading(true);

    if (session && gid && uid) {
      if (!session.user || uid !== session.user.id) {
        router.push("/");
      }

      getGift(gid).then((gift) => {
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
