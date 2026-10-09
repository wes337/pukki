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

// Shorten the visible label without changing the link's destination.
export const formatWebUrl = (value) => {
  const href = getWebUrl(value);
  if (!href) return value;
  const url = new URL(href);
  const host = url.host.replace(/^www\./i, "");
  const path = url.pathname.replace(/\/+$/, "");
  return `${host}${path}${url.search}${url.hash}`;
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

      if (!/[aeiouyäöå]$/i.test(name)) {
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

      if (!/[aeiouyäöå]$/i.test(name)) {
        return `${name}ille`;
      }

      return `${name}lle`;
    }

    return name;
  } catch {
    return name;
  }
};
