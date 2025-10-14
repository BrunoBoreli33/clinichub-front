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

  // If successful mutation, trigger reload (POST/PUT/DELETE)
  const isMutation = ["POST", "PUT", "DELETE", "PATCH"].includes(method);
  const success = res.ok && (data === null || data.success === undefined || data.success === true);

  if (isMutation && success && !opts.skipAutoReload) {
    // dispatch an event for listeners
    try {
      window.dispatchEvent(new CustomEvent('app:backend-mutated', { detail: { path, method, data } }));
    } catch (e) {
      // noop
    }

    // small delay to allow UI to settle
    setTimeout(() => {
      try { window.location.reload(); } catch (e) { /* noop */ }
    }, 450);
  }

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
