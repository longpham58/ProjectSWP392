import { useState, useEffect } from "react";
import UserImportModal from "./components/UserImportModal";
import { useUserStore } from "../../stores/user.store";
import { Search, UserPlus, Upload, Trash2, RefreshCw, ChevronLeft, ChevronRight, User, Mail, Building, Shield, Loader2 } from "lucide-react";

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
    if (confirm("Bạn có chắc muốn xóa người dùng này không?")) {
      try {
        await deleteUser(id);
      } catch (error) {
        console.error("Failed to delete user:", error);
        alert("Xóa người dùng thất bại. Vui lòng thử lại.");
      }
    }
  };

  // Handle toggle user status (lock/unlock)
  const toggleStatus = async (id: number) => {
    try {
      await toggleUserStatus(id);
    } catch (error) {
      console.error("Failed to toggle user status:", error);
      alert("Cập nhật trạng thái người dùng thất bại. Vui lòng thử lại.");
    }
  };

  // Handle import users - now passes file directly to backend
  const handleImport = async (file: File) => {
    try {
      const count = await importUsers(file);
      alert(`Đã nhập thành công ${count} người dùng`);
      fetchUsers();
    } catch (error) {
      console.error("Failed to import users:", error);
      alert("Nhập người dùng thất bại. Vui lòng thử lại.");
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
        return "bg-gradient-to-r from-blue-500 to-indigo-600 text-white";
      case "HR":
        return "bg-gradient-to-r from-green-500 to-emerald-600 text-white";
      case "TRAINER":
        return "bg-gradient-to-r from-amber-500 to-orange-600 text-white";
      case "EMPLOYEE":
        return "bg-gradient-to-r from-purple-500 to-pink-600 text-white";
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-600 text-white";
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

  // KPI stats
  const total = users.length;
  const admins = users.filter(u => u.role === "ADMIN").length;
  const employees = users.filter(u => u.role === "EMPLOYEE").length;
  const active = users.filter(u => u.status === "Active").length;

  const kpis = [
    { title: "Tổng người dùng", value: total, icon: User, gradient: "from-indigo-500 to-purple-400", bgGradient: "from-indigo-50 to-purple-50" },
    { title: "Quản trị viên", value: admins, icon: Shield, gradient: "from-blue-500 to-cyan-400", bgGradient: "from-blue-50 to-cyan-50" },
    { title: "Nhân viên", value: employees, icon: User, gradient: "from-green-500 to-emerald-400", bgGradient: "from-green-50 to-emerald-50" },
    { title: "Đang hoạt động", value: active, icon: Shield, gradient: "from-amber-500 to-orange-400", bgGradient: "from-amber-50 to-orange-50" },
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-slate-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Quản lý người dùng</h2>
      <p className="text-gray-500 mb-8">Quản lý người dùng hệ thống và vai trò của họ</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={kpi.title}
              className={`bg-gradient-to-br ${kpi.bgGradient} p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-white/50`}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-600 text-sm font-medium">{kpi.title}</p>
                <div className={`p-2 rounded-xl bg-gradient-to-br ${kpi.gradient}`}>
                  <Icon className="text-white" size={18} />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">{kpi.value}</h2>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 mb-6 flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <select
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">Tất cả vai trò</option>
          <option value="ADMIN">Admin</option>
          <option value="HR">HR</option>
          <option value="TRAINER">Giảng viên</option>
          <option value="EMPLOYEE">Nhân viên</option>
        </select>

        <select
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          value={departmentFilter}
          onChange={(e) => {
            setDepartmentFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">Tất cả phòng ban</option>
          {[...new Set(users.map(u => u.department).filter(Boolean))].map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        <select
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">Tất cả trạng thái</option>
          <option value="Active">Hoạt động</option>
          <option value="Locked">Bị khóa</option>
        </select>

        <div className="flex gap-2">
          <button
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <Upload size={16} />
            Import
          </button>
          <button
            onClick={() => fetchUsers()}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-indigo-600 mx-auto" size={32} />
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gradient-to-r from-gray-50 to-slate-50 text-left">
              <tr>
                <th className="p-4 font-semibold text-gray-700">Mã người dùng</th>
                <th className="p-4 font-semibold text-gray-700">Tên</th>
                <th className="p-4 font-semibold text-gray-700">Email</th>
                <th className="p-4 font-semibold text-gray-700">Phòng ban</th>
                <th className="p-4 font-semibold text-gray-700">Vai trò</th>
                <th className="p-4 font-semibold text-gray-700">Trạng thái</th>
                <th className="p-4 font-semibold text-gray-700">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-mono text-indigo-600">{user.userId}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {user.fullname?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="font-medium text-gray-900">{user.fullname || "N/A"}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Mail size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Building size={14} className="text-gray-400 flex-shrink-0" />
                      {user.department || "N/A"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${roleColor(user.role || '')}`}>
                      {formatRole(user.role || '')}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleStatus(user.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full ${statusColor(user.status || '')} hover:opacity-80 transition-opacity`}
                    >
                      {user.status || "Active"}
                    </button>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center p-12 text-gray-500">
                    <div className="flex flex-col items-center">
                      <User size={48} className="text-gray-300 mb-2" />
                      <p>Không tìm thấy người dùng nào.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-xl shadow-sm">
        <p className="text-sm text-gray-600">
          Hiển thị {((currentPage - 1) * ITEMS_PER_PAGE) + 1} đến {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} trong {filteredUsers.length} kết quả
        </p>

        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Import Modal */}
      {isImportOpen && (
        <UserImportModal
          open={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onImport={handleImport}
        />
      )}
    </div>
  );
}
