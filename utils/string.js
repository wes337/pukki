export const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const formGenitiveCase = (name, locale = "en") => {
  try {
    if (locale === "en") {
      return `${name}'${name.endsWith("s") ? "" : "s"}`;
    }

    if (locale === "fi") {
      if (name.endsWith("us") || name.endsWith("as") || name.endsWith("es")) {
        return `${name.slice(0, -1)}ksen`;
      }

      if (name.endsWith("s")) {
        return `${name}in`;
      }

      return `${name}n`;
    }

    return name;
  } catch {
    return name;
  }
};

export const formAllativeCase = (name, locale = "en") => {
  try {
    if (locale === "en") {
      return name;
    }

    if (locale === "fi") {
      if (name.endsWith("us") || name.endsWith("as") || name.endsWith("es")) {
        return `${name.slice(0, -1)}kselle`;
      }

      if (name.endsWith("s")) {
        return `${name}ille`;
      }

      return `${name}lle`;
    }

    return name;
  } catch {
    return name;
  }
};
