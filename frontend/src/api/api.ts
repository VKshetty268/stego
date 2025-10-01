import axios from "axios";

const base =
  // 1) Prefer Vite env var injected at build time (Docker/Prod)
  import.meta.env.VITE_API_URL
  // 3) Last resort: your local dev backend
  || "http://localhost:4000/api";

const API = axios.create({
  baseURL: base,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
