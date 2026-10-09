import useSWR from "swr";
import { request } from "../actions/request";

export function useInvitation(code, preview = false) {
  const result = useSWR(code && !preview ? `/family/invitation?code=${encodeURIComponent(code)}` : null, request, {
    revalidateOnFocus: false, shouldRetryOnError: false,
  });
  return { ...result, data: preview ? { id: "preview-family", name: "The Johnsons" } : result.data };
}
