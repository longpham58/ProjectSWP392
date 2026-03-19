import axios from "axios";
import { useAuthStore } from "../stores/auth.store";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  withCredentials: true, // 🔥 VERY IMPORTANT for session-based auth
  headers: {
    "Content-Type": "application/json",
  },
});

// Endpoints that should not trigger redirect to login on 401
const NO_AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/logout",
  "/auth/forgot-password",
  "/auth/forgot-password/request-otp",
  "/auth/reset-password",
  "/auth/resend-otp",
  "/auth/verify-otp"
];

/**
 * Optional: response interceptor
 * Useful for handling 401 / session expired globally
 */
api.interceptors.response.use(
  res => res,
  err => {
    // Check if this is a no-auth endpoint that shouldn't trigger redirect
    const url = err.config?.url || "";
    const isNoAuthEndpoint = NO_AUTH_ENDPOINTS.some(endpoint => url.includes(endpoint));
    
    if (err.response?.status === 401 && !isNoAuthEndpoint) {
      window.location.href = "/login";
    }
    if (err.response?.status === 403) {
      window.location.href = "/unauthorized";
    }
    return Promise.reject(err);
  }
);

export default api;
