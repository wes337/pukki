import { apiUrl } from "../config";

export async function request(url, { method = "GET", body } = {}) {
  const response = await fetch(`${apiUrl}${url}`, {
    method,
    credentials: "include",
    ...(method !== "GET" ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) } : {}),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw Object.assign(new Error(data.error || "Something went wrong. Please try again."), {
      status: response.status,
    });
  }
  return response.status === 204 ? null : response.json();
}
