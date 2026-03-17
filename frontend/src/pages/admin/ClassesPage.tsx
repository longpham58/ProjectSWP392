import { useState, useMemo, useEffect, ReactNode } from "react";
import { useCourseStore } from "../../stores/course.store";

export default function AdminClassesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  
  const { classes, loading, fetchClasses } = useCourseStore();

  const itemsPerPage = 5;

  // Fetch classes from store
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  /* =========================
     FILTER LOGIC
  ========================= */

  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      const matchesSearch =
        cls.className.toLowerCase().includes(search.toLowerCase()) ||
        cls.classCode.toLowerCase().includes(search.toLowerCase()) ||
        (cls.courseName && cls.courseName.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL" ||
        cls.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [classes, search, statusFilter]);

  /* =========================
     PAGINATION
  ========================= */

  const totalPages = Math.ceil(
    filteredClasses.length / itemsPerPage
  );

  const paginatedClasses = filteredClasses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* =========================
     KPI DATA
  ========================= */

  const total = classes.length;
  const active = classes.filter(c => c.status === "ACTIVE").length;
  const completed = classes.filter(c => c.status === "COMPLETED").length;
  const draft = classes.filter(c => c.status === "DRAFT" || c.status === "PLANNING").length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Class Management
        </h1>
      </div>

      {/* KPI SECTION */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KpiCard title="Total Classes" value={total} />
        <KpiCard title="Active" value={active} />
        <KpiCard title="Completed" value={completed} />
        <KpiCard title="Draft/Planning" value={draft} />
      </div>

      {/* FILTER SECTION */}
      <div className="bg-white p-4 rounded-xl shadow mb-4 flex justify-between">
        <input
          type="text"
          placeholder="Search by class name, code or course..."
          className="border rounded-lg px-3 py-2 w-1/3"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />

        <select
          className="border rounded-lg px-3 py-2"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="DRAFT">DRAFT</option>
          <option value="PLANNING">PLANNING</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <TableHead>Class Code</TableHead>
                <TableHead>Class Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Trainer</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Max</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </tr>
            </thead>

            <tbody>
              {paginatedClasses.map((cls) => (
                <tr key={cls.id} className="border-t hover:bg-gray-50">
                  <TableCell className="font-mono">{cls.classCode}</TableCell>
                  <TableCell className="font-medium">{cls.className}</TableCell>
                  <TableCell>{cls.courseName || "N/A"}</TableCell>
                  <TableCell>{cls.trainerName || "N/A"}</TableCell>
                  <TableCell>
                    <span className="font-semibold text-green-600">
                      {cls.studentCount || 0}
                    </span>
                  </TableCell>
                  <TableCell>{cls.maxStudents || "Unlimited"}</TableCell>
                  <TableCell>
                    <StatusBadge status={cls.status} />
                  </TableCell>
                  <TableCell>
                    {cls.createdAt 
                      ? new Date(cls.createdAt).toLocaleDateString() 
                      : "N/A"}
                  </TableCell>
                </tr>
              ))}

              {paginatedClasses.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center p-6 text-gray-500">
                    No classes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-600">
          Page {currentPage} of {totalPages || 1}
        </p>

        <div className="space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>

          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================
   SMALL COMPONENTS
========================= */

function KpiCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white shadow rounded-xl p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const base =
    "px-2 py-1 text-xs font-semibold rounded-full";

  const styles: Record<string, string> = {
    DRAFT: "bg-gray-200 text-gray-700",
    PLANNING: "bg-blue-100 text-blue-700",
    ACTIVE: "bg-green-100 text-green-700",
    COMPLETED: "bg-purple-100 text-purple-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <span className={`${base} ${styles[status] || styles.DRAFT}`}>
      {status}
    </span>
  );
}

function TableHead({ children }: { children: ReactNode }) {
  return <th className="p-3">{children}</th>;
}

function TableCell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <td className={`p-3 ${className}`}>
      {children}
    </td>
  );
}
