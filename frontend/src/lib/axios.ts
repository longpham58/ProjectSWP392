import axios from "axios";
import { useAuthStore } from "../stores/auth.store";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  withCredentials: true, // 🔥 VERY IMPORTANT for session-based auth
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Optional: response interceptor
 * Useful for handling 401 / session expired globally
 */
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      window.location.href = "/login";
    }
    if (err.response?.status === 403) {
      window.location.href = "/unauthorized";
    }
    return Promise.reject(err);
  }
);

export default api;
