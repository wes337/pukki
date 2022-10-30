import { withApiAuth } from "@supabase/auth-helpers-nextjs";

export default withApiAuth(async function ProtectedRoute(req, res, supabase) {
  try {
    const { uid } = req.query;
    let { data, error } = await supabase
      .from("gifts")
      .select(
        `
        id,
        name,
        user (
          user_id,
          avatar_url
        ),
        claimed_by`
      )
      .eq("claimed_by", uid);

    if (error) {
      throw error;
    }

    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(500).send();
  }
});
