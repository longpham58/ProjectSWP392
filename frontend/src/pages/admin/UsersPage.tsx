import { useState, useEffect } from "react";
import UserImportModal from "./components/UserImportModal";
import { useUserStore } from "../../stores/user.store";
import { User } from "../../api/user.api";



const ITEMS_PER_PAGE = 10;

export default function UsersPage() {
  const { users, loading, fetchUsers, importUsers, deleteUser, toggleUserStatus } = useUserStore();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Fetch all users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle delete user
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id);
      } catch (error) {
        console.error("Failed to delete user:", error);
        alert("Failed to delete user. Please try again.");
      }
    }
  };

  // Handle toggle user status (lock/unlock)
  const toggleStatus = async (id: number) => {
    try {
      await toggleUserStatus(id);
    } catch (error) {
      console.error("Failed to toggle user status:", error);
      alert("Failed to update user status. Please try again.");
    }
  };

  // Handle import users - now passes file directly to backend
  const handleImport = async (file: File) => {
    try {
      const count = await importUsers(file);
      alert(`Successfully imported ${count} users`);
      fetchUsers();
    } catch (error) {
      console.error("Failed to import users:", error);
      alert("Failed to import users. Please try again.");
    }
  };

  // Filter Logic - apply all filters locally
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      search === "" ||
      user.fullname?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.userId?.toLowerCase().includes(search.toLowerCase());

    const matchesDepartment =
      departmentFilter === "All" || user.department === departmentFilter;

    const matchesRole =
      roleFilter === "All" || user.role === roleFilter;

    const matchesStatus =
      statusFilter === "All" || user.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const roleColor = (role: string) => {
    switch (role.toUpperCase()) {
      case "ADMIN":
        return "bg-blue-600 text-white";
      case "HR":
        return "bg-emerald-600 text-white";
      case "TRAINER":
        return "bg-amber-500 text-white";
      case "EMPLOYEE":
        return "bg-purple-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const formatRole = (role: string) => {
    switch (role.toUpperCase()) {
      case "ADMIN":
        return "Admin";
      case "HR":
        return "HR";
      case "TRAINER":
        return "Trainer";
      case "EMPLOYEE":
        return "Employee";
      default:
        return role;
    }
  };

  const statusColor = (status: string) =>
    status === "Active"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Users Management</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        {/* Search */}
        <input
          type="text"
          placeholder="Search by name or email..."
          className="border rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />

        {/* Role Filter */}
        <select
          className="border rounded-lg px-4 py-2"
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="HR">HR</option>
          <option value="TRAINER">Trainer</option>
          <option value="EMPLOYEE">Employee</option>
        </select>
        {/* Department Filter */}
        <select
          className="border rounded-lg px-4 py-2"
          value={departmentFilter}
          onChange={(e) => {
            setDepartmentFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">All Departments</option>
          {[...new Set(users.map(user => user.department).filter(Boolean))].map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>
        {/* Status Filter */}
        <select
          className="border rounded-lg px-4 py-2"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <button
          onClick={() => fetchUsers()}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          Refresh
        </button>

        <button
          onClick={() => setIsImportOpen(true)}
          className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Import Users
        </button>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="text-center py-4 text-gray-500">Loading users...</div>
      )}

      {/* Users Table */}
      {!loading && (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="p-4">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th className="text-right pr-6">Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="p-4 font-medium">{user.fullname || user.userId}</td>
                  <td>{user.email}</td>

                  <td>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleColor(user.role)}`}>
                      {formatRole(user.role)}
                    </span>
                  </td>

                  <td>{user.department || "N/A"}</td>

                  <td>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>

                  <td className="text-right pr-6">
                    {user.role === "ADMIN" ? (
                      <span className="text-gray-400 text-sm">-</span>
                    ) : (
                      <>
                        <button
                          onClick={() => toggleStatus(user.id)}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {user.status === "Active" ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:underline text-sm ml-3"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {paginatedUsers.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No users found.
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
      <UserImportModal
        open={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
}
