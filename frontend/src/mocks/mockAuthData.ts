// Mock users data
export interface MockUser {
  id: number;
  username: string;
  password: string;
  email: string;
  fullName: string;
  roles: string[];
  department: string;
  phone: string;
  avatarUrl?: string;
}

export const mockUsers: MockUser[] = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    email: 'admin@itms.com',
    fullName: 'System Administrator',
    roles: ['ADMIN'],
    department: 'IT Department',
    phone: '0905123456'
  },
  {
    id: 2,
    username: 'hr001',
    password: 'admin123',
    email: 'hr@itms.com',
    fullName: 'Nguyễn Văn HR',
    roles: ['HR'],
    department: 'HR Department',
    phone: '0905123457'
  },
  {
    id: 3,
    username: 'trainer001',
    password: 'admin123',
    email: 'trainer@itms.com',
    fullName: 'Trần Thị Trainer',
    roles: ['TRAINER', 'EMPLOYEE'],
    department: 'IT Department',
    phone: '0905123458'
  },
  {
    id: 4,
    username: 'emp001',
    password: 'admin123',
    email: 'employee@itms.com',
    fullName: 'Lê Văn Employee',
    roles: ['EMPLOYEE'],
    department: 'Finance Department',
    phone: '0905123459'
  },
  {
    id: 5,
    username: 'emp002',
    password: 'admin123',
    email: 'employee2@itms.com',
    fullName: 'Phạm Thị Mai',
    roles: ['EMPLOYEE'],
    department: 'Sales Department',
    phone: '0905123460'
  }
];

// Simulate API delay
export const delay = (ms: number = 800) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Generate fake JWT token
export const generateMockToken = (userId: number): string => {
  return `mock_jwt_token_${userId}_${Date.now()}`;
};
