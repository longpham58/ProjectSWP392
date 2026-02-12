import { create } from "zustand";
import { authApi } from "../api";
import type { UserInfo } from "../api";

interface AuthState {
  user: UserInfo | null;
  loading: boolean;
  otpRequired: boolean;
  error: string | null;
  initialized: boolean;
  setError: (error: string | null) => void;
  

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
  resetPassword: (token: string, newPassword: string) => Promise<void>;


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
      set({ user: me.data.data,
        otpRequired: false });
    }
  }catch (err: any) {
    const message =
      err.response?.data?.message ||
      "Server error during login";

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
    await authApi.forgotPassword(email);
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
resetPassword: async (token: string, newPassword: string) => {
  set({ loading: true, error: null });
  try {
    await authApi.resetPassword({
      token,
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
      const res = await authApi.me();
      set({ user: res.data.data, initialized: true });
    } catch {
      set({ user: null, initialized: true });
    }
  },

  logout: async () => {
    await authApi.logout();
    set({
      user: null,
      otpRequired: false,
    });
  },
}));