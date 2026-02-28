import { useState, useMemo } from "react";

type Role = "Admin" | "HR" | "Trainer" | "Employee";

type ActionType =
  | "Login"
  | "Logout"
  | "Assigned Course"
  | "Completed Course"
  | "Updated Role"
  | "Generated Certificate";

interface AuditLog {
  id: number;
  user: string;
  role: Role;
  action: ActionType;
  target: string;
  date: string; // ISO string format recommended
}

const ITEMS_PER_PAGE = 5;

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "All">("All");
 const [actionFilter, setActionFilter] = useState<string>("All");
  const [dateFilter, setDateFilter] = useState<
    "All" | "7days" | "30days"
  >("All");
  const [currentPage, setCurrentPage] = useState(1);

  // 🔹 Sample Data
  const logs: AuditLog[] = [
    {
      id: 1,
      user: "John Doe",
      role: "Employee",
      action: "Completed Course",
      target: "Compliance Training",
      date: "2026-02-25",
    },
    {
      id: 2,
      user: "Sarah Smith",
      role: "Trainer",
      action: "Assigned Course",
      target: "React Basics",
      date: "2026-02-20",
    },
    {
      id: 3,
      user: "Admin User",
      role: "Admin",
      action: "Updated Role",
      target: "Michael → Trainer",
      date: "2026-02-18",
    },
    {
      id: 4,
      user: "Emily Chen",
      role: "Employee",
      action: "Generated Certificate",
      target: "Soft Skills",
      date: "2026-02-10",
    },
    {
      id: 5,
      user: "David Lee",
      role: "Trainer",
      action: "Login",
      target: "System",
      date: "2026-02-24",
    },
    {
      id: 6,
      user: "David Lee",
      role: "Trainer",
      action: "Logout",
      target: "System",
      date: "2026-02-24",
    },
  ];

  // 🔎 Filtering Logic
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.user.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.target.toLowerCase().includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "All" || log.role === roleFilter;

      const matchesAction =
        actionFilter === "All" || log.action === actionFilter;

      const matchesDate = (() => {
        if (dateFilter === "All") return true;

        const logDate = new Date(log.date);
        const today = new Date();
        const diffTime = today.getTime() - logDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (dateFilter === "7days") return diffDays <= 7;
        if (dateFilter === "30days") return diffDays <= 30;

        return true;
      })();

      return (
        matchesSearch &&
        matchesRole &&
        matchesAction &&
        matchesDate
      );
    });
  }, [search, roleFilter, actionFilter, dateFilter]);

  // 📄 Pagination Logic
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
const renderActivityMessage = (log: AuditLog) => {
  switch (log.action) {
    case "Completed Course":
      return (
        <>
          <span className="font-semibold">{log.user}</span> completed{" "}
          <span className="font-medium">{log.target}</span>
        </>
      );

    case "Assigned Course":
      return (
        <>
          <span className="font-semibold">{log.user}</span> assigned{" "}
          <span className="font-medium">{log.target}</span>
        </>
      );

    case "Updated Role":
      return (
        <>
          <span className="font-semibold">{log.user}</span> updated role:{" "}
          <span className="font-medium">{log.target}</span>
        </>
      );

    case "Generated Certificate":
      return (
        <>
          <span className="font-semibold">{log.user}</span> generated a
          certificate for{" "}
          <span className="font-medium">{log.target}</span>
        </>
      );

    case "Login":
      return (
        <>
          <span className="font-semibold">{log.user}</span> logged into
          the system
        </>
      );

    case "Logout":
      return (
        <>
          <span className="font-semibold">{log.user}</span> logged out of
          the system
        </>
      );

    default:
      return (
        <>
          <span className="font-semibold">{log.user}</span> performed{" "}
          {log.action}
        </>
      );
  }
};const getActionColor = (action: ActionType) => {
  switch (action) {
    case "Completed Course":
      return "bg-green-500";
    case "Assigned Course":
      return "bg-blue-500";
    case "Updated Role":
      return "bg-yellow-500";
    case "Generated Certificate":
      return "bg-purple-500";
    case "Login":
      return "bg-gray-400";
    case "Logout":
      return "bg-red-400";
    default:
      return "bg-gray-300";
  }
};
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">System Activity</h2>

      {/* Filters Section */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">

        {/* Search */}
        <input
          type="text"
          placeholder="Search user, action, target..."
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

        {/* Action Filter */}
        <select
          className="border rounded-lg px-4 py-2"
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="All">All Actions</option>
          <option value="Login">Login</option>
          <option value="Logout">Logout</option>
          <option value="Assigned Course">Assigned Course</option>
          <option value="Completed Course">Completed Course</option>
          <option value="Updated Role">Updated Role</option>
          <option value="Generated Certificate">Generated Certificate</option>
        </select>

        {/* Date Filter */}
        <select
          className="border rounded-lg px-4 py-2"
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value as "All" | "7days" | "30days");
            setCurrentPage(1);
          }}
        >
          <option value="All">All Dates</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
  <h3 className="text-lg font-semibold mb-6">Recent Activity</h3>

  <div className="space-y-6">
    {paginatedLogs.map((log, index) => (
      <div key={log.id} className="flex items-start gap-4">

        {/* Timeline Dot */}
      <div
  className={`w-3 h-3 rounded-full ${getActionColor(log.action)} mt-2`}
/>

        {/* Content */}
        <div className="flex-1">
          <p className="text-sm text-gray-800">
            {renderActivityMessage(log)}
          </p>

          <p className="text-xs text-gray-500 mt-1">
            {new Date(log.date).toLocaleDateString()} • {log.role}
          </p>
        </div>
      </div>
    ))}

    {paginatedLogs.length === 0 && (
      <div className="text-center text-gray-500 py-6">
        No activity found.
      </div>
    )}
  </div>
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