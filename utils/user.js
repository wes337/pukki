export function getUserName(user) {
  if (!user) {
    return "";
  }

  if (user.user_metadata) {
    return (
      user.user_metadata.nickname ||
      user.user_metadata.name ||
      user.user_metadata.full_name
    );
  }

  return user.email || "No name";
}
