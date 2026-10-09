// Recognize web links, including bare domains, while leaving shop names as text.
export const getWebUrl = (value) => {
  const text = value.trim();
  const bareDomain = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(?::\d+)?(?:[/?#][^\s]*)?$/i;
  try {
    const url = new URL(bareDomain.test(text) ? `https://${text}` : text);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
};

export const formGenitiveCase = (name, locale = "en") => {
  try {
    if (locale === "en") {
      return `${name}'${name.endsWith("s") ? "" : "s"}`;
    }

    if (locale === "fi") {
      if (name.endsWith("us") || name.endsWith("as")) {
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
      if (name.endsWith("us") || name.endsWith("as")) {
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
