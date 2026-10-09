import Family from "../components/Family/Family";
import Loader from "../components/Loader/Loader";
import { useRouter } from "next/router";

export default function FamilyPage(props) {
  const { query } = useRouter();
  if (process.env.NODE_ENV === "development" && query.preview === "loading") return <Loader />;
  return <Family {...props} />;
}
