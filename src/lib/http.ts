import { buildUrl } from "@/lib/api";

// Re-exportar buildUrl para uso em outros módulos
export { buildUrl };

const defaultHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  } as Record<string, string>;
};

// Exportar getAuthHeaders como alias de defaultHeaders
export const getAuthHeaders = defaultHeaders;

export type ApiFetchOptions = RequestInit & { 
  skipAutoReload?: boolean;
};

// âœ… Tipo para a resposta da API
export interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  [key: string]: unknown;
}

// âœ… Tipo para erros da API
export interface ApiError extends Error {
  status: number;
  data: ApiResponse | null;
}

export async function apiFetch<T = unknown>(
  path: string, 
  opts: ApiFetchOptions = {}
): Promise<ApiResponse<T>> {
  const method = (opts.method || "GET").toUpperCase();
  const url = path.startsWith("http") ? path : buildUrl(path);

  const headers = { ...defaultHeaders(), ...(opts.headers || {}) } as Record<string, string>;

  const init: RequestInit = {
    ...opts,
    headers,
  };

  const res = await fetch(url, init);
  
  // âœ… CORRIGIDO: Tipagem explÃ­cita para data
  let data: ApiResponse<T> | null = null;
  try {
    data = await res.json() as ApiResponse<T>;
  } catch (e) {
    // ignore JSON parse errors for non-json responses
  }

  // âœ… Dispatch evento para listeners, mas SEM reload automÃ¡tico
  const isMutation = ["POST", "PUT", "DELETE", "PATCH"].includes(method);
  const success = res.ok && (data === null || data.success === undefined || data.success === true);

  if (isMutation && success) {
    // Dispatch an event for listeners
    try {
      window.dispatchEvent(new CustomEvent('app:backend-mutated', { 
        detail: { path, method, data } 
      }));
    } catch (e) {
      // noop
    }
  }

  if (!res.ok) {
    const message = data?.message || `Request failed with status ${res.status}`;
    const err = new Error(message) as ApiError;
    err.status = res.status;
    err.data = data;
    throw err;
  }

  // âœ… CORRIGIDO: Retorna objeto vazio tipado se data for null
  return data ?? {} as ApiResponse<T>;
}

export default apiFetch;