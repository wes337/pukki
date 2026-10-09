import { useRouter } from "next/router";
import { useFamilyData } from "../../../../hooks/useFamilyData";
import { Loader } from "../../../../components";
import Gift from "../gift";

export default function EditGift() {
  const { gifts, loading, error } = useFamilyData();
  const router = useRouter();
  const { gid, uid } = router.query;
  const gift = gifts?.find((item) => item.id === gid && item.user === uid);

  if (error) return <p role="alert">{error}</p>;

  if (loading) {
    return <Loader />;
  }
  if (!gift) return <p role="alert">Gift not found.</p>;

  return <Gift gift={gift} />;
}
