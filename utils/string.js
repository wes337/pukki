export const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const formPossessive = (name) => {
  return `${name}'${name.endsWith("s") ? "" : "s"}`;
};
