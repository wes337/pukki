import { withApiAuth } from "@supabase/auth-helpers-nextjs";

export default withApiAuth(async function ProtectedRoute(req, res, supabase) {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    return res.status(200).send();
  } catch (error) {
    console.log(error);
    return res.status(500).send();
  }
});
