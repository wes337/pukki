// Replace complete server records, including hidden claim information, rather than merging fields.
export function applyGiftChange(current, result, removedId) {
  if (!current) return current;
  const gifts = current.gifts.filter((gift) => gift.id !== (result?.id ?? removedId));
  if (result) gifts.push(result);
  gifts.sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
  return { ...current, gifts };
}
