import { create } from 'zustand';
import { authApi } from '../api/auth.api';

interface ForgotPasswordState {
  // State
  loading: boolean;
  error: string | null;
  otpSent: boolean;
  otpVerified: boolean;
  secondsLeft: number | null;
  email: string | null;
  
  // Actions
  requestOtp: (email: string) => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  resendOtp: (email: string) => Promise<boolean>;
  resetPassword: (newPassword: string) => Promise<boolean>;
  resetState: () => void;
  clearError: () => void;
  setSecondsLeft: (seconds: number) => void;
}

export const useForgotPasswordStore = create<ForgotPasswordState>((set, get) => ({
  loading: false,
  error: null,
  otpSent: false,
  otpVerified: false,
  secondsLeft: null,
  email: null,

  requestOtp: async (email: string) => {
    set({ loading: true, error: null });
    try {
      await authApi.requestForgotPasswordOtp(email);
      set({ otpSent: true, loading: false, secondsLeft: 5 * 60, email });
      return true;
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || 'Failed to send OTP', 
        loading: false 
      });
      return false;
    }
  },

  verifyOtp: async (email: string, otp: string) => {
    set({ loading: true, error: null });
    try {
      // This will verify OTP and store user ID in session for password reset
      await authApi.forgotPassword({ email, otp, newPassword: '' });
      set({ otpVerified: true, loading: false });
      return true;
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || 'Invalid OTP', 
        loading: false 
      });
      return false;
    }
  },

  resendOtp: async (email: string) => {
    set({ error: null });
    try {
      await authApi.requestForgotPasswordOtp(email);
      set({ secondsLeft: 5 * 60 });
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to resend OTP' });
      return false;
    }
  },

  resetPassword: async (newPassword: string) => {
    set({ loading: true, error: null });
    try {
      // Use session-based password reset
      await authApi.resetPassword({ newPassword });
      set({ loading: false });
      return true;
    } catch (err: any) {
      set({ 
        error: err.response?.data?.message || 'Failed to reset password', 
        loading: false 
      });
      return false;
    }
  },

  resetState: () => {
    set({ 
      loading: false, 
      error: null, 
      otpSent: false, 
      otpVerified: false, 
      secondsLeft: null,
      email: null
    });
  },

  clearError: () => {
    set({ error: null });
  },

  setSecondsLeft: (seconds: number) => {
    set({ secondsLeft: seconds });
  },
}));
