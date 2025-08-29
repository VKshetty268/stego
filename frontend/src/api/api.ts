// src/api/api.ts
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000", // backend URL
  withCredentials: true,            // so cookies/sessions work
});

// Interceptor (optional): Attach token if using JWT later
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
