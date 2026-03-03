export interface MockUser {
  id: number;
  username: string;
  password: string;
  email: string;
  fullName: string;
  roles: string[];
  department?: string;
  avatar?: string;
}

export const mockUsers: MockUser[] = [
  {
    id: 1,
    username: "admin",
    password: "admin123",
    email: "admin@itms.com",
    fullName: "Admin User",
    roles: ["ADMIN"],
    department: "IT",
    avatar: "https://ui-avatars.com/api/?name=Admin+User&background=3b82f6&color=fff"
  },
  {
    id: 2,
    username: "trainer",
    password: "trainer123",
    email: "trainer@itms.com",
    fullName: "John Smith",
    roles: ["TRAINER"],
    department: "Training",
    avatar: "https://ui-avatars.com/api/?name=John+Smith&background=10b981&color=fff"
  },
  {
    id: 3,
    username: "employee",
    password: "employee123",
    email: "employee@itms.com",
    fullName: "Alice Johnson",
    roles: ["EMPLOYEE"],
    department: "HR",
    avatar: "https://ui-avatars.com/api/?name=Alice+Johnson&background=f59e0b&color=fff"
  },
  {
    id: 4,
    username: "trainer2",
    password: "trainer123",
    email: "sarah@itms.com",
    fullName: "Sarah Johnson",
    roles: ["TRAINER"],
    department: "Training",
    avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=10b981&color=fff"
  },
  {
    id: 5,
    username: "trainer3",
    password: "trainer123",
    email: "david@itms.com",
    fullName: "David Lee",
    roles: ["TRAINER"],
    department: "Training",
    avatar: "https://ui-avatars.com/api/?name=David+Lee&background=10b981&color=fff"
  }
];

export const findUserByCredentials = (username: string, password: string): MockUser | undefined => {
  return mockUsers.find(
    user => user.username === username && user.password === password
  );
};
