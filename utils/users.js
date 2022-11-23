export const getUserName = (user, defaultUserName = "Secret Santa") => {
  try {
    if (!user) {
      return defaultUserName;
    }

    if (user.user_metadata) {
      return (
        user.user_metadata.nickname ||
        user.user_metadata.name ||
        user.user_metadata.full_name
      );
    }

    return user.email || defaultUserName;
  } catch {
    return defaultUserName;
  }
};

export const getFirstName = (userName) => {
  try {
    if (userName === "Del Monte") {
      return userName;
    }
    return userName?.split?.(" ")[0];
  } catch {
    return userName;
  }
};

export const isAdmin = (userId) => {
  return userId === "f126e7fb-79a9-4377-ade3-be654317f4af";
};

export const isTestUser = (userId) => {
  const LARRY_PICKLECOPTER = "38f362f8-fa5d-450d-a368-1b5d5979785b";
  return userId === LARRY_PICKLECOPTER;
};

export const WHITELIST = [
  "b81dbdf3-dfce-489c-8e78-7f275218580d",
  "e355c15f-18dc-4b92-a330-081d787536d8",
  "e050b52b-c6a9-4e97-870a-00286fa4a85e",
  "367f7442-2906-4be1-93f2-bfc8167c552f",
  "1ab8ec81-8004-471c-9492-26e49397a8e5",
  "f126e7fb-79a9-4377-ade3-be654317f4af",
];
