export async function getGift(supabase, gid) {
  try {
    let { data, error } = await supabase
      .from("gifts")
      .select("id, name, claimed_by, user, description, url")
      .eq("id", gid);

    if (error) {
      throw error;
    }

    const gift = data[0];
    return gift;
  } catch (error) {
    console.log(error);
  }
}
