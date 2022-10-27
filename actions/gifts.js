export async function getGifts(supabase, uid) {
  try {
    let { data, error } = await supabase
      .from("gifts")
      .select("id, name")
      .eq("user", uid);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.log(error);
  }
}

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

export async function removeGift(supabase, gid) {
  try {
    const { error } = await supabase.from("gifts").delete().eq("id", gid);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function addGift(supabase, gift) {
  try {
    const { error } = await supabase.from("gifts").upsert(gift).select();

    if (error) {
      throw error;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function claimGift(supabase, gid, uid) {
  try {
    const { data, error } = await supabase
      .from("gifts")
      .update({ claimed_by: uid || "" })
      .eq("id", gid)
      .select();

    if (error) {
      throw error;
    }

    const gift = data[0];
    return gift;
  } catch (error) {
    console.log(error);
  }
}
