import { useRouter } from "next/router";
import Invitation from "../components/Family/Invitation";
import Login from "./login";
import { useSession } from "../hooks/useAuth";
export default function Join() {
  const session = useSession();
  const { query } = useRouter();
  const code = typeof query.code === "string" ? query.code.slice(0, 32) : "";
  const preview = process.env.NODE_ENV === "development" && ["accept", "signin", "signup", "joined", "other-family", "invalid"].includes(query.preview)
    ? query.preview : null;
  if (preview === "signin" || preview === "signup") return <Login initialSignup={preview === "signup"} preview />;
  if (preview) return <Invitation code="PREVIEW" preview={preview} />;
  return session ? <Invitation key={code} code={code} /> : <Login initialSignup />;
}
