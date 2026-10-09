export function translateMessage(messages, locale, text, variables) {
  if (typeof text !== "string") return text;
  const entry = Object.hasOwn(messages, text) ? messages[text] : undefined;
  // null intentionally hides words such as English "to" in Finnish sentences.
  const value = entry && Object.hasOwn(entry, locale) ? entry[locale] : entry?.en ?? text;
  return typeof value === "function" ? value(variables) : value ?? "";
}
