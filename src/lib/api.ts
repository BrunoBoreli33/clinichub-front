// Centralized API base URL helper
export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8081';

export function buildUrl(path: string) {
  // ensure single slash between base and path
  return `${API_BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
