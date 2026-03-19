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
  phone?: string;
  address?: string;
  avatarUrl?: string;
  roles: string[];
  department?: {
    id: number;
    name: string;
  } | null;
  otpEnabled: boolean;
  lastLogin?: string;
  active: boolean;
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

  // Request OTP for forgot password
  requestForgotPasswordOtp: (email: string) =>
    axios.post<ApiResponse<void>>("/auth/forgot-password/request-otp", { email }),

  // Verify OTP and reset password in one step
  forgotPassword: (payload: { email: string; otp: string; newPassword: string }) =>
    axios.post<ApiResponse<void>>("/auth/forgot-password", payload),

  resetPassword: (payload: {
    newPassword: string;
  }) =>
    axios.post<ApiResponse<void>>("/auth/reset-password", payload),
};
