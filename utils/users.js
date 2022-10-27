export const getUserName = (user) => {
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
};

export const getFirstName = (userName) => {
  if (userName === "Del Monte") {
    return userName;
  }
  return userName.split(" ")[0];
};

export const isAdmin = (userId) => {
  return userId === "f126e7fb-79a9-4377-ade3-be654317f4af";
};

export const isTestUser = (userId) => {
  const LARRY_PICKLECOPTER = "38f362f8-fa5d-450d-a368-1b5d5979785b";
  return userId === LARRY_PICKLECOPTER;
};
