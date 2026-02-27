import { mockUsers, delay, generateMockToken } from '../mocks/mockAuthData';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: {
      id: number;
      username: string;
      email: string;
      fullName: string;
      roles: string[];
      department: string;
      phone: string;
    };
  };
}

export interface UserInfoResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    username: string;
    email: string;
    fullName: string;
    roles: string[];
    department: string;
    phone: string;
  };
}

// Mock Auth API
export const mockAuthApi = {
  // Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    await delay(1000);

    const user = mockUsers.find(
      u => u.username === credentials.username && u.password === credentials.password
    );

    if (!user) {
      return {
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng'
      };
    }

    const token = generateMockToken(user.id);
    
    // Save to localStorage
    localStorage.setItem('mock_token', token);
    localStorage.setItem('mock_user', JSON.stringify(user));

    return {
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          roles: user.roles,
          department: user.department,
          phone: user.phone
        }
      }
    };
  },

  // Get current user info
  getMe: async (): Promise<UserInfoResponse> => {
    await delay(500);

    const token = localStorage.getItem('mock_token');
    const userStr = localStorage.getItem('mock_user');

    if (!token || !userStr) {
      return {
        success: false,
        message: 'Chưa đăng nhập'
      };
    }

    const user = JSON.parse(userStr);

    return {
      success: true,
      message: 'Lấy thông tin người dùng thành công',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles,
        department: user.department,
        phone: user.phone
      }
    };
  },

  // Logout
  logout: async (): Promise<{ success: boolean; message: string }> => {
    await delay(300);
    
    localStorage.removeItem('mock_token');
    localStorage.removeItem('mock_user');

    return {
      success: true,
      message: 'Đăng xuất thành công'
    };
  },

  // Forgot password (mock)
  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    await delay(1000);

    const user = mockUsers.find(u => u.email === email);

    if (!user) {
      return {
        success: false,
        message: 'Email không tồn tại trong hệ thống'
      };
    }

    // Mock: save email to localStorage for OTP verification
    localStorage.setItem('mock_reset_email', email);
    localStorage.setItem('mock_otp', '123456'); // Mock OTP

    return {
      success: true,
      message: 'Mã OTP đã được gửi đến email của bạn. Mã OTP: 123456'
    };
  },

  // Verify OTP (mock)
  verifyOtp: async (email: string, otp: string): Promise<{ success: boolean; message: string }> => {
    await delay(800);

    const savedEmail = localStorage.getItem('mock_reset_email');
    const savedOtp = localStorage.getItem('mock_otp');

    if (email !== savedEmail || otp !== savedOtp) {
      return {
        success: false,
        message: 'Mã OTP không đúng'
      };
    }

    localStorage.setItem('mock_otp_verified', 'true');

    return {
      success: true,
      message: 'Xác thực OTP thành công'
    };
  },

  // Reset password (mock)
  resetPassword: async (email: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    await delay(800);

    const otpVerified = localStorage.getItem('mock_otp_verified');

    if (otpVerified !== 'true') {
      return {
        success: false,
        message: 'Vui lòng xác thực OTP trước'
      };
    }

    // Mock: update password (in real app, this would update database)
    const userIndex = mockUsers.findIndex(u => u.email === email);
    if (userIndex !== -1) {
      mockUsers[userIndex].password = newPassword;
    }

    // Clear reset session
    localStorage.removeItem('mock_reset_email');
    localStorage.removeItem('mock_otp');
    localStorage.removeItem('mock_otp_verified');

    return {
      success: true,
      message: 'Đặt lại mật khẩu thành công'
    };
  }
};

export default mockAuthApi;
