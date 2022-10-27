import { getUserName } from "../utils/users";

export async function getUsers(supabase) {
  try {
    const { data, error, status } = await supabase.from("users").select();

    if (error && status !== 406) {
      throw error;
    }

    return data;
  } catch (error) {
    console.log(error);
  }
}

export async function getUser(supabase, uid) {
  try {
    let { data, error } = await supabase
      .from("users")
      .select("name, avatar_url")
      .eq("user_id", uid);

    if (error) {
      throw error;
    }

    const user = data[0];
    return user;
  } catch (error) {
    console.log(error);
  }
}

export async function updateUser(supabase, user) {
  const updatedUser = {
    user_id: user.id,
    name: getUserName(user),
    avatar_url: user.user_metadata.avatar_url,
  };

  await supabase
    .from("users")
    .upsert(updatedUser, { onConflict: "user_id" })
    .select();
}
