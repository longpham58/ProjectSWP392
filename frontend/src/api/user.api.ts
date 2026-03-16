import axios from "../lib/axios";

export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface User {
  id: number;
  userId: string;
  fullname: string;
  email: string;
  role: string;
  status: string;
  department: string;
}

export const userApi = {
  getUsers: () =>
    axios.get<ApiResponse<User[]>>("/users"),

  toggleUserStatus: (userId: number) =>
    axios.put<ApiResponse<void>>(`/users/${userId}/status`),

  deleteUser: (userId: number) =>
    axios.delete<ApiResponse<void>>(`/users/${userId}`),

  importUsers: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return axios.post<ApiResponse<number>>("/users/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
