import { create } from "zustand";
import { authApi } from "../api";
import type { UserInfo } from "../api";

const AUTH_SESSION_HINT_KEY = "itms_has_session_hint";

interface AuthState {
  user: UserInfo | null;
  loading: boolean;
  otpRequired: boolean;
  error: string | null;
  initialized: boolean;
  setError: (error: string | null) => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  

  login: (
    username: string,
    password: string,
    rememberMe: boolean
  ) => Promise<void>;

  verifyOtp: (
    otp: string
  ) => Promise<void>;
  resendOtp: () => Promise<void>;

   forgotPassword: (email: string) => Promise<void>;
  resetPassword: (newPassword: string) => Promise<void>;


  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  otpRequired: false,
  error: null,
  initialized: false,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  refreshUser: async () => {
    try {
      const res = await authApi.me();
      set({ user: res.data.data });
    } catch { /* ignore */ }
  },
  login: async (username, password, rememberMe) => {
  set({ loading: true, error: null });
  try {
    const res = await authApi.login({
      username,
      password,
      rememberMe,
    });

    const otpRequired = res.data.data?.otpRequired ?? false;

    set({ otpRequired });

    if (!otpRequired) {
      const me = await authApi.me();
      localStorage.setItem(AUTH_SESSION_HINT_KEY, "1");
      set({ user: me.data.data,
        otpRequired: false });
    }
  }catch (err: any) {
    const message =
      err.response?.data?.message ||
      "Server error during login";
    console.error("Login error:", err);
    set({ error: message});
    throw err; // important
  }
   finally {
    set({ loading: false });
  }
},

  verifyOtp: async (otp) => {
    set({ loading: true, error: null });
    try {
      await authApi.verifyOtp({ otp });

      const me = await authApi.me();
      localStorage.setItem(AUTH_SESSION_HINT_KEY, "1");
      set({
        user: me.data.data,
        otpRequired: false
      });
    }catch (err: any) {
    set({ error: err.response?.data?.message ?? "Invalid OTP" });
    throw err;
    } finally {
      set({ loading: false });
    }
  },
  resendOtp: async () => {
    set({ loading: true, error: null });
    try {
      await authApi.resendOtp();
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? "Failed to resend OTP" });
      throw err;
    } finally {
      set({ loading: false });

    }
  },
  forgotPassword: async (email: string) => {
  set({ loading: true, error: null });
  try {
    // Call requestForgotPasswordOtp to send OTP only
    await authApi.requestForgotPasswordOtp(email);
  } catch (err: any) {
    set({
      error:
        err.response?.data?.message ||
        "Failed to send reset password email",
    });
    throw err;
  } finally {
    set({ loading: false });
  }
},
resetPassword: async (newPassword: string) => {
  set({ loading: true, error: null });
  try {
    await authApi.resetPassword({
      newPassword,
    });
  } catch (err: any) {
    set({
      error:
        err.response?.data?.message ||
        "Failed to reset password",
    });
    throw err;
  } finally {
    set({ loading: false });
  }
},

  fetchMe: async () => {
    try {
      // Check if user already exists in store (from login)
      const currentState = useAuthStore.getState();
      if (currentState.user) {
        set({ initialized: true });
        return;
      }

      // Avoid unnecessary /auth/me call before any successful login.
      const hasSessionHint = localStorage.getItem(AUTH_SESSION_HINT_KEY) === "1";
      if (!hasSessionHint) {
        set({ user: null, initialized: true });
        return;
      }

      const res = await authApi.me();
      localStorage.setItem(AUTH_SESSION_HINT_KEY, "1");
      set({ user: res.data.data, initialized: true });
    } catch {
      localStorage.removeItem(AUTH_SESSION_HINT_KEY);
      set({ user: null, initialized: true });
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore API errors in mock mode
    }
    
    // Clear all auth state and localStorage
    localStorage.removeItem(AUTH_SESSION_HINT_KEY);
    set({
      user: null,
      otpRequired: false,
      error: null,
      initialized: false,
    });
  },
}));