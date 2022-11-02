import { withApiAuth } from "@supabase/auth-helpers-nextjs";

async function getUser(req, res, supabase) {
  try {
    const { uid } = req.query;

    let { data, error } = await supabase
      .from("users")
      .select("user_id, name, avatar_url")
      .eq("user_id", uid);

    if (error) {
      throw error;
    }

    if (data.length === 0) {
      return res.status(404).send("Not found");
    }

    return res.status(200).json(data[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).send();
  }
}

async function updateUser(req, res, supabase) {
  try {
    const { uid } = req.query;
    const user = req.body;

    const updatedUser = {
      user_id: uid,
      name: user.name,
      avatar_url: user.avatar_url,
    };

    const { data, error } = await supabase
      .from("users")
      .upsert(updatedUser, { onConflict: "user_id" })
      .select();

    if (error) {
      throw error;
    }

    return res.status(200).json(data[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).send();
  }
}

export default withApiAuth(async function ProtectedRoute(req, res, supabase) {
  switch (req.method) {
    case "GET":
      return getUser(req, res, supabase);
    case "POST":
      return updateUser(req, res, supabase);
    default:
      return res.status(406).send();
  }
});
