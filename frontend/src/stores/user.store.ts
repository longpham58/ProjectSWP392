import { create } from "zustand";
import { userApi, User } from "../api/user.api";

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  importUsers: (file: File) => Promise<number>;
  deleteUser: (userId: number) => Promise<void>;
  toggleUserStatus: (userId: number) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await userApi.getUsers();
      set({ users: res.data.data || [] });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to fetch users" });
    } finally {
      set({ loading: false });
    }
  },

  importUsers: async (file: File) => {
    set({ loading: true, error: null });
    try {
      const res = await userApi.importUsers(file);
      // Refresh users after import
      const usersRes = await userApi.getUsers();
      set({ users: usersRes.data.data || [] });
      return res.data.data;
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to import users" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  deleteUser: async (userId: number) => {
    set({ loading: true, error: null });
    try {
      await userApi.deleteUser(userId);
      set((state) => ({
        users: state.users.filter((u) => u.id !== userId),
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to delete user" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  toggleUserStatus: async (userId: number) => {
    set({ loading: true, error: null });
    try {
      await userApi.toggleUserStatus(userId);
      set((state) => ({
        users: state.users.map((u) =>
          u.id === userId ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" } : u
        ),
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Failed to toggle user status" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
}));
