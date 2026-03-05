/**
 * Mock employee data for HR module (dev/demo).
 */

import type { Employee } from '@/types/hr.types';

export const mockEmployees: Employee[] = [
  { id: 1, userId: 'HR001', fullname: 'Nguyễn Văn A', email: 'anv@company.com', role: 'HR', status: 'Active' },
  { id: 2, userId: 'TR002', fullname: 'Trần Thị B', email: 'bt@company.com', role: 'TRAINER', status: 'Active' },
  { id: 3, userId: 'EM003', fullname: 'Lê Văn C', email: 'c.le@company.com', role: 'EMPLOYEE', status: 'Inactive' },
  { id: 4, userId: 'EM004', fullname: 'Phạm Thị D', email: 'd.pham@company.com', role: 'EMPLOYEE', status: 'Active' },
  { id: 5, userId: 'TR005', fullname: 'Hoàng Văn E', email: 'e.hoang@company.com', role: 'TRAINER', status: 'Inactive' },
];
