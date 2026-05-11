const envBaseUrl = import.meta.env.VITE_API_BASE_URL;

const fallbackBaseUrl = import.meta.env.PROD
  ? "https://pfc-aia.onrender.com"
  : "http://localhost:4000";

export const API_BASE_URL = (envBaseUrl || fallbackBaseUrl).replace(/\/+$/, "");

export function apiUrl(path = "") {
  if (!path) return API_BASE_URL;
  return path.startsWith("/") ? `${API_BASE_URL}${path}` : `${API_BASE_URL}/${path}`;
}

export function assetUrl(path = "") {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return path.startsWith("/") ? `${API_BASE_URL}${path}` : `${API_BASE_URL}/${path}`;
}
console.log("API_BASE_URL:", API_BASE_URL);
console.log("PROD:", import.meta.env.PROD);