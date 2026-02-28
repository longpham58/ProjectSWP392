import { useState } from "react";

type Role = "Admin" | "HR" | "Trainer" | "Employee";
type Status = "Active" | "Inactive";

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: Status;
}

const ITEMS_PER_PAGE = 3;

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "All">("All");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [currentPage, setCurrentPage] = useState(1);

  const users: User[] = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "Active" },
    { id: 2, name: "Sarah Smith", email: "sarah@example.com", role: "HR", status: "Active" },
    { id: 3, name: "David Lee", email: "david@example.com", role: "Trainer", status: "Inactive" },
    { id: 4, name: "Emily Chen", email: "emily@example.com", role: "Employee", status: "Active" },
    { id: 5, name: "Michael Brown", email: "michael@example.com", role: "Employee", status: "Inactive" },
    { id: 6, name: "Olivia White", email: "olivia@example.com", role: "Trainer", status: "Active" },
  ];

  // 🔎 Filtering Logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "All" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // 📄 Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const roleColor = (role: Role) => {
    switch (role) {
      case "Admin":
        return "bg-blue-100 text-blue-700";
      case "HR":
        return "bg-green-100 text-green-700";
      case "Trainer":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-purple-100 text-purple-700";
    }
  };

  const statusColor = (status: Status) =>
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
            setRoleFilter(e.target.value as Role | "All");
            setCurrentPage(1);
          }}
        >
          <option value="All">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="HR">HR</option>
          <option value="Trainer">Trainer</option>
          <option value="Employee">Employee</option>
        </select>

        {/* Status Filter */}
        <select
          className="border rounded-lg px-4 py-2"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as Status | "All");
            setCurrentPage(1);
          }}
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <button className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="p-4">Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th className="text-right pr-6">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedUsers.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-4 font-medium">{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="text-right pr-6">
                  <button className="text-blue-600 hover:underline text-sm mr-4">
                    Edit
                  </button>
                  <button className="text-red-600 hover:underline text-sm">
                    Delete
                  </button>
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
    </div>
  );
}