import { buildUrl } from "@/lib/api";

const defaultHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  } as Record<string, string>;
};

export type ApiFetchOptions = RequestInit & { skipAutoReload?: boolean };

export async function apiFetch(path: string, opts: ApiFetchOptions = {}) {
  const method = (opts.method || "GET").toUpperCase();
  const url = path.startsWith("http") ? path : buildUrl(path);

  const headers = { ...defaultHeaders(), ...(opts.headers || {}) } as Record<string, string>;

  const init: RequestInit = {
    ...opts,
    headers,
  };

  const res = await fetch(url, init);
  let data: any = null;
  try {
    data = await res.json();
  } catch (e) {
    // ignore JSON parse errors for non-json responses
  }

  // NOTE: previous behavior dispatched an event and automatically reloaded the page
  // after successful mutations. That behavior was removed to avoid full page reloads
  // on POST/PUT/DELETE/PATCH. Callers should update UI state or listen to
  // 'app:backend-mutated' if needed (event dispatch removed to avoid surprises).

  if (!res.ok) {
    const message = data?.message || `Request failed with status ${res.status}`;
    const err: any = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export default apiFetch;
