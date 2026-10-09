import { request } from "./request";
export const getAllGifts = () => request("/gifts");
export const removeGift = (gid) => request(`/gifts/${gid}`, { method: "DELETE" });
export const addGift = (gift) => request("/gifts", { method: "POST", body: gift });
export const claimGift = (gid, claimedBy) => request(`/gifts/${gid}`, { method: "PATCH", body: { claim: claimedBy !== null } });
