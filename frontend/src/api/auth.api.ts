import axios from "../lib/axios";

/* =====================
   Types
===================== */

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe: boolean;
}

export interface VerifyOtpRequest {
  otp: string;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  department?: {
    id: number;
    name: string;
  } | null;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}

/* =====================
   API calls
===================== */

export const authApi = {
  login: (payload: LoginRequest) =>
    axios.post<ApiResponse<any>>("/auth/login", payload),
  resendOtp: () =>
     axios.post<ApiResponse<void>>("/auth/resend-otp"),

  verifyOtp: (payload: VerifyOtpRequest) =>
    axios.post<ApiResponse<any>>("/auth/verify-otp", payload),

  me: () =>
    axios.get<ApiResponse<UserInfo>>("/auth/me"),

  logout: () =>
    axios.post<ApiResponse<void>>("/auth/logout"),

  forgotPassword: (email: string) =>
    axios.post<ApiResponse<void>>("/auth/forgot-password", { email }),

  resetPassword: (payload: {
  token: string;        // 🔐 JWT from email link
  newPassword: string; // 🔑 new password
}) =>
  axios.post<ApiResponse<void>>("/auth/reset-password", payload),
};
