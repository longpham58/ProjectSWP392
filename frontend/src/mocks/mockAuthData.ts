/**
 * Mock user data for HR dashboard (trainer dropdowns, etc.).
 */

export interface MockAuthUser {
  id: number;
  fullName: string;
  username: string;
  roles: string[];
}

export const mockUsers: MockAuthUser[] = [
  { id: 1, fullName: 'Nguyễn Văn A', username: 'trainer001', roles: ['TRAINER'] },
  { id: 2, fullName: 'Trần Thị B', username: 'trainer002', roles: ['TRAINER'] },
  { id: 3, fullName: 'Lê Văn C', username: 'trainer003', roles: ['TRAINER'] },
  { id: 4, fullName: 'HR User', username: 'hr001', roles: ['HR'] },
  { id: 5, fullName: 'Admin User', username: 'admin001', roles: ['ADMIN'] },
];
