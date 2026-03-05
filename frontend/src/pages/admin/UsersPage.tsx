import { useState } from "react";
import * as XLSX from "xlsx";
import UserImportModal from "./components/UserImportModal";
type Role = "Admin" | "HR" | "Trainer" | "Employee";
type Status = "Active" | "Inactive";
type Department = "IT" | "HR" | "Training" | "Finance";


interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  department: Department;
  status: Status;
}

const ITEMS_PER_PAGE = 3;

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "All">("All");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
  const [departmentFilter, setDepartmentFilter] = useState<Department | "All">("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isImportOpen, setIsImportOpen] = useState(false); // ✅ ADD THIS

 const [users, setUsers] = useState<User[]>([
  { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", department: "IT", status: "Active" },
  { id: 2, name: "Sarah Smith", email: "sarah@example.com", role: "HR", department: "HR", status: "Active" },
  { id: 3, name: "David Lee", email: "david@example.com", role: "Trainer", department: "Training", status: "Inactive" },
  { id: 4, name: "Emily Chen", email: "emily@example.com", role: "Employee", department: "Finance", status: "Active" },
  { id: 5, name: "Michael Brown", email: "michael@example.com", role: "Employee", department: "IT", status: "Inactive" },
  { id: 6, name: "Olivia White", email: "olivia@example.com", role: "Trainer", department: "Training", status: "Active" },
]);
  // 🔎 Filtering Logic
  const filteredUsers = users.filter((user) => {
  const matchesSearch =
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase());

  const matchesRole = roleFilter === "All" || user.role === roleFilter;

  const matchesStatus =
    statusFilter === "All" || user.status === statusFilter;

  const matchesDepartment =
    departmentFilter === "All" || user.department === departmentFilter;

  return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
});

  const handleDelete = (id: number) => {
  if (confirm("Are you sure you want to delete this user?")) {
    setUsers(users.filter((user) => user.id !== id));
  }
};
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
const toggleStatus = (id: number) => {
  setUsers(
    users.map((user) =>
      user.id === id
        ? {
            ...user,
            status: user.status === "Active" ? "Inactive" : "Active",
          }
        : user
    )
  );
};

const handleImport = (file: File) => {
  const reader = new FileReader();

  reader.onload = (e) => {
    const data = e.target?.result;
    const workbook = XLSX.read(data, { type: "binary" });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const importedUsers: User[] = (jsonData as any[]).map((row, index) => ({
      id: users.length + index + 1,
      name: row.Name,
      email: row.Email,
      role: row.Role,
      department: row.Department,
      status: row.Status || "Active",
    }));

    setUsers((prev) => [...prev, ...importedUsers]);
  };

  reader.readAsBinaryString(file);
};
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
<select
  className="border rounded-lg px-4 py-2"
  value={departmentFilter}
  onChange={(e) => {
    setDepartmentFilter(e.target.value as Department | "All");
    setCurrentPage(1);
  }}
>
  <option value="All">All Departments</option>
  <option value="IT">IT</option>
  <option value="HR">HR</option>
  <option value="Training">Training</option>
  <option value="Finance">Finance</option>
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

        <button
  onClick={() => setIsImportOpen(true)}
  className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
>
  Import Users
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
  <th>Department</th>
  <th>Status</th>
  <th className="text-right pr-6">Action</th>
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

  <td>{user.department}</td>

  <td>
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(user.status)}`}>
      {user.status}
    </span>
  </td>

  <td className="text-right pr-6 space-x-3">
    <button
      onClick={() => toggleStatus(user.id)}
      className="text-blue-600 hover:underline text-sm"
    >
      {user.status === "Active" ? "Deactivate" : "Activate"}
    </button>
    <button
    onClick={() => handleDelete(user.id)}
    className="text-red-600 hover:underline text-sm"
  >
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
      <UserImportModal
  open={isImportOpen}
  onClose={() => setIsImportOpen(false)}
  onImport={handleImport}
/>
    </div>
    
  );
}