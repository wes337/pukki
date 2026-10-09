import useSWR, { useSWRConfig } from "swr";
import { useUser } from "./useAuth";
import { getAllUsers } from "../actions/users";
import { getAllGifts, addGift, removeGift, claimGift } from "../actions/gifts";
import { applyGiftChange } from "../utils/family-cache.mjs";

export const familyDataKey = "family-data";
const fetchFamilyData = async () => {
  const [users, gifts] = await Promise.all([getAllUsers(), getAllGifts()]);
  return { users, gifts };
};

// The API already returns complete, viewer-filtered gifts. Share them between screens.
export function useFamilyData() {
  const user = useUser();
  const { data, error, mutate } = useSWR(user?.family_id ? familyDataKey : null, fetchFamilyData);
  const denied = error?.status === 401 || error?.status === 403;
  return {
    users: denied ? undefined : data?.users,
    gifts: denied ? undefined : data?.gifts,
    loading: !data && !error,
    error: denied || !data ? error?.message : null,
    refresh: mutate,
  };
}

export function useGiftActions() {
  const { mutate } = useSWRConfig();
  async function updateGift(action, id) {
    const result = await action();
    let needsRefresh = false;
    // Merge into the latest cache after the write. SWR discards older in-flight reads.
    await mutate(familyDataKey, (current) => {
      if (!current) { needsRefresh = true; return current; }
      return applyGiftChange(current, result, id);
    }, { revalidate: false });
    if (needsRefresh) void mutate(familyDataKey).catch(() => {});
    return result;
  }
  return {
    saveGift: (gift) => updateGift(() => addGift(gift), gift.id),
    deleteGift: (id) => updateGift(() => removeGift(id), id),
    setClaim: (id, claimant) => updateGift(() => claimGift(id, claimant), id),
  };
}
