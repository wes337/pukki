import { useEffect } from "react";
import { useRouter } from "next/router";
import useSWR, { SWRConfig } from "swr";
import { request } from "../actions/request";
import { useUser } from "../hooks/useAuth";
import { useFamilyData } from "../hooks/useFamilyData";

const cacheSettings = {
  provider: () => new Map(),
  // Share simultaneous requests, but refresh cached data when a screen mounts.
  dedupingInterval: 2000,
  revalidateOnMount: true,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  errorRetryCount: 2,
  shouldRetryOnError: (error) => ![401, 403, 404].includes(error.status),
};

function Prefetch() {
  const user = useUser();
  const router = useRouter();
  const { gifts } = useFamilyData();
  // Load invitation data after the primary lists, ready for the Invite button.
  useSWR(user?.family_id && gifts ? "/family" : null, request);
  const firstGift = gifts?.[0];
  const ownGift = gifts?.find((gift) => gift.user === user.id);
  const giftPath = firstGift ? `/users/${firstGift.user}/${firstGift.id}` : null;
  const editPath = ownGift ? `/users/${ownGift.user}/${ownGift.id}/edit` : null;

  useEffect(() => {
    if (!user?.family_id) return;
    // Next prefetches route bundles in production; data caching also works in development.
    for (const path of ["/users", "/gifts", "/family", `/users/${user.id}`, `/users/${user.id}/gift`, giftPath, editPath].filter(Boolean)) {
      void router.prefetch(path).catch(() => {});
    }
  }, [user?.id, user?.family_id, router, giftPath, editPath]);
  return null;
}

export default function DataProvider({ children }) {
  const user = useUser();
  // No persistent browser storage. Account/family changes discard the entire private cache.
  return <SWRConfig key={`${user?.id ?? "guest"}:${user?.family_id ?? "none"}`} value={cacheSettings}>
    <Prefetch />
    {children}
  </SWRConfig>;
}
