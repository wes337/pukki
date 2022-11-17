import { withApiAuth } from "@supabase/auth-helpers-nextjs";

export async function getGifts(req, res, supabase) {
  try {
    const { data, error } = await supabase
      .from("gifts")
      .select("id, name, claimed_by ( user_id, avatar_url ), user");

    if (error) {
      throw error;
    }

    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(500).send();
  }
}

export async function addGift(req, res, supabase) {
  try {
    const supabaseUser = await supabase.auth.getUser();
    const user = supabaseUser?.data?.user;
    const gift = req.body;

    if (user.id !== gift.user) {
      return res.status(401).send();
    }

    const { data, error } = await supabase.from("gifts").upsert(gift).select();

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
      return getGifts(req, res, supabase);
    case "POST":
      return addGift(req, res, supabase);
    default:
      return res.status(406).send();
  }
});
