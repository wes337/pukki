import { createClient } from "@supabase/supabase-js";
import { withApiAuth } from "@supabase/auth-helpers-nextjs";
import { WHITELIST } from "../../utils/users";
import supabaseAdmin from "../../utils/supabase-admin";

async function getUsers(req, res, supabase) {
  try {
    const { data, error } = await supabaseAdmin.from("users").select();

    if (error) {
      throw error;
    }

    //  const users = data.filter(({ user_id }) => WHITELIST.includes(user_id));
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
