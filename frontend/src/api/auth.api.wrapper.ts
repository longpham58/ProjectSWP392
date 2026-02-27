// Wrapper để tự động chọn giữa Mock API và Real API
import { USE_MOCK_DATA } from '../config/useMockData';
import { authApi as realAuthApi } from './auth.api';
import mockAuthApi from './auth.api.mock';

// Export types
export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface VerifyOtpRequest {
  otp: string;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  department?: {
    id: number;
    name: string;
  } | null;
  otpEnabled?: boolean;
  lastLogin?: string;
  active?: boolean;
}

// Wrapper functions
export const authApi = {
  login: async (payload: LoginRequest) => {
    if (USE_MOCK_DATA) {
      const response = await mockAuthApi.login({
        username: payload.username,
        password: payload.password
      });
      
      if (!response.success) {
        throw new Error(response.message);
      }
      
      return {
        data: {
          data: response.data,
          message: response.message
        }
      };
    }
    return realAuthApi.login(payload);
  },

  me: async () => {
    if (USE_MOCK_DATA) {
      const response = await mockAuthApi.getMe();
      
      if (!response.success) {
        throw new Error(response.message);
      }
      
      return {
        data: {
          data: response.data,
          message: response.message
        }
      };
    }
    return realAuthApi.me();
  },

  logout: async () => {
    if (USE_MOCK_DATA) {
      await mockAuthApi.logout();
      return {
        data: {
          data: null,
          message: 'Đăng xuất thành công'
        }
      };
    }
    return realAuthApi.logout();
  },

  forgotPassword: async (email: string) => {
    if (USE_MOCK_DATA) {
      const response = await mockAuthApi.forgotPassword(email);
      
      if (!response.success) {
        throw new Error(response.message);
      }
      
      return {
        data: {
          data: null,
          message: response.message
        }
      };
    }
    return realAuthApi.forgotPassword(email);
  },

  verifyOtp: async (payload: VerifyOtpRequest) => {
    if (USE_MOCK_DATA) {
      const email = localStorage.getItem('mock_reset_email') || '';
      const response = await mockAuthApi.verifyOtp(email, payload.otp);
      
      if (!response.success) {
        throw new Error(response.message);
      }
      
      return {
        data: {
          data: null,
          message: response.message
        }
      };
    }
    return realAuthApi.verifyOtp(payload);
  },

  resetPassword: async (payload: { token?: string; newPassword: string }) => {
    if (USE_MOCK_DATA) {
      const email = localStorage.getItem('mock_reset_email') || '';
      const response = await mockAuthApi.resetPassword(email, payload.newPassword);
      
      if (!response.success) {
        throw new Error(response.message);
      }
      
      return {
        data: {
          data: null,
          message: response.message
        }
      };
    }
    return realAuthApi.resetPassword(payload);
  },

  resendOtp: async () => {
    if (USE_MOCK_DATA) {
      // Mock resend OTP
      return {
        data: {
          data: null,
          message: 'Mã OTP mới: 123456'
        }
      };
    }
    return realAuthApi.resendOtp();
  }
};

export default authApi;
