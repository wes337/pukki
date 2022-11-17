import { withApiAuth } from "@supabase/auth-helpers-nextjs";
import { isAdmin } from "../../../utils/users";

async function removeGift(req, res, supabase) {
  try {
    const { gid } = req.query;
    const { data: existingGift } = await supabase
      .from("gifts")
      .select("user")
      .eq("id", gid);
    const gift = existingGift[0];
    const supabaseUser = await supabase.auth.getUser();
    const requestingUser = supabaseUser?.data?.user;

    const cannotDelete =
      gift.user !== requestingUser.id && !isAdmin(requestingUser.id);

    if (cannotDelete) {
      return res.status(401).send();
    }

    const { error } = await supabase.from("gifts").delete().eq("id", gid);

    if (error) {
      throw error;
    }

    return res.status(200).send();
  } catch (error) {
    console.log(error);
    return res.status(500).send();
  }
}

async function getGift(req, res, supabase) {
  try {
    const { gid } = req.query;

    let { data, error } = await supabase
      .from("gifts")
      .select("id, name, claimed_by ( user_id, name ), user, description, url")
      .eq("id", gid);

    if (error) {
      throw error;
    }

    if (data.length === 0) {
      return res.status(404).send("Not found");
    }

    return res.status(200).json(data[0]);
  } catch (error) {
    console.log(error);
    return res.status(500);
  }
}

export async function claimGift(req, res, supabase) {
  try {
    const { gid } = req.query;
    const { data: existingGift } = await supabase
      .from("gifts")
      .select("claimed_by")
      .eq("id", gid);
    const gift = existingGift[0];
    const supabaseUser = await supabase.auth.getUser();
    const requestingUser = supabaseUser?.data?.user;
    const giftClaimedBySomebodyElse =
      gift.claimed_by && gift.claimed_by !== requestingUser.id;

    if (giftClaimedBySomebodyElse) {
      return res.status(401).send();
    }

    const claimedBy = req.body;

    const { data, error } = await supabase
      .from("gifts")
      .update({ claimed_by: claimedBy || null })
      .eq("id", gid)
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
      return getGift(req, res, supabase);
    case "DELETE":
      return removeGift(req, res, supabase);
    case "PATCH":
      return claimGift(req, res, supabase);
    default:
      return res.status(406).send();
  }
});
