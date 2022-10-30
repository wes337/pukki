import { withApiAuth } from "@supabase/auth-helpers-nextjs";

async function getUsers(req, res, supabase) {
  try {
    const { data, error } = await supabase.from("users").select();

    if (error) {
      throw error;
    }

    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(500).send();
  }
}

export default withApiAuth(async function ProtectedRoute(req, res, supabase) {
  switch (req.method) {
    case "GET":
      return getUsers(req, res, supabase);
    default:
      return res.status(406).send();
  }
});
