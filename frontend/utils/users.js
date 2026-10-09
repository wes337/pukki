export const getUserName = (user, defaultUserName = "Secret Santa") => {
  try {
    if (!user) {
      return defaultUserName;
    }

    return user.name || user.username || defaultUserName;
  } catch {
    return defaultUserName;
  }
};

export const getFirstName = (userName) => {
  return userName?.trim().split(/\s+/)[0];
};
