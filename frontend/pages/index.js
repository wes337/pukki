import { useAuth } from "../hooks/useAuth";
import { Loader } from "../components";
import Users from "./users";
import Login from "./login";
import Family from "../components/Family/Family";
export default function Index() {
  const { session, loading } = useAuth();
  if (loading) return <Loader />;
  if (!session) return <Login />;
  return session.user.family_id ? <Users /> : <Family />;
}
