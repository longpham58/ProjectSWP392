import type { UserInfo } from '../api/auth.api';

// Mock Users Data
export const mockUsers: Record<string, { password: string; user: UserInfo }> = {
  employee: {
    password: 'employee123',
    user: {
      id: 1,
      username: 'employee',
      email: 'employee@itms.com',
      fullName: 'Nguyễn Văn Employee',
      roles: ['EMPLOYEE'],
      department: {
        id: 1,
        name: 'Phòng IT',
      },
      otpEnabled: false,
      lastLogin: '2026-02-27T10:00:00',
      active: true,
    },
  },
  admin: {
    password: 'admin123',
    user: {
      id: 2,
      username: 'admin',
      email: 'admin@itms.com',
      fullName: 'Trần Thị Admin',
      roles: ['ADMIN'],
      department: {
        id: 2,
        name: 'Phòng Nhân sự',
      },
      otpEnabled: false,
      lastLogin: '2026-02-27T09:30:00',
      active: true,
    },
  },
  trainer: {
    password: 'trainer123',
    user: {
      id: 3,
      username: 'trainer',
      email: 'trainer@itms.com',
      fullName: 'Lê Văn Trainer',
      roles: ['TRAINER'],
      department: {
        id: 1,
        name: 'Phòng IT',
      },
      otpEnabled: false,
      lastLogin: '2026-02-27T08:45:00',
      active: true,
    },
  },
  manager: {
    password: 'manager123',
    user: {
      id: 4,
      username: 'manager',
      email: 'manager@itms.com',
      fullName: 'Phạm Thị Manager',
      roles: ['MANAGER'],
      department: {
        id: 3,
        name: 'Phòng Kinh doanh',
      },
      otpEnabled: false,
      lastLogin: '2026-02-27T08:00:00',
      active: true,
    },
  },
  employee2: {
    password: 'employee123',
    user: {
      id: 5,
      username: 'employee2',
      email: 'employee2@itms.com',
      fullName: 'Hoàng Văn Employee 2',
      roles: ['EMPLOYEE'],
      department: {
        id: 1,
        name: 'Phòng IT',
      },
      otpEnabled: true,
      lastLogin: '2026-02-26T16:30:00',
      active: true,
    },
  },
};

// Mock OTP for testing
export const MOCK_OTP = '123456';

// Mock JWT Token
export const MOCK_JWT_TOKEN = 'mock-jwt-token-12345';

// Helper function to validate credentials
export const validateCredentials = (username: string, password: string) => {
  const user = mockUsers[username];
  if (!user) {
    return { success: false, error: 'Tên đăng nhập không tồn tại' };
  }
  if (user.password !== password) {
    return { success: false, error: 'Mật khẩu không chính xác' };
  }
  return { success: true, user: user.user, otpRequired: user.user.otpEnabled };
};

// Helper function to validate OTP
export const validateOtp = (otp: string) => {
  return otp === MOCK_OTP;
};