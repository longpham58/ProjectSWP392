import { useState, useMemo, useEffect, ReactNode } from "react";
import { Link } from "react-router-dom";
import { useCourseStore } from "../../stores/course.store";

export default function AdminCoursesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  
  const { courses, loading, fetchCourses } = useCourseStore();

  const itemsPerPage = 5;

  // Fetch courses from store
  useEffect(() => {
    const status = statusFilter === "ALL" ? undefined : statusFilter;
    fetchCourses(status);
  }, [statusFilter, fetchCourses]);

  /* =========================
     FILTER LOGIC
  ========================= */

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.name.toLowerCase().includes(search.toLowerCase()) ||
        course.code.toLowerCase().includes(search.toLowerCase());

      return matchesSearch;
    });
  }, [courses, search]);

  /* =========================
     PAGINATION
  ========================= */

  const totalPages = Math.ceil(
    filteredCourses.length / itemsPerPage
  );

  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* =========================
     KPI DATA
  ========================= */

  const total = courses.length;
  const active = courses.filter(c => c.status === "ACTIVE").length;
  const draft = courses.filter(c => c.status === "DRAFT").length;
  const archived = courses.filter(c => c.status === "ARCHIVED").length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Course Management
        </h1>
      </div>

      {/* KPI SECTION */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KpiCard title="Total Courses" value={total} />
        <KpiCard title="Active" value={active} />
        <KpiCard title="Draft" value={draft} />
        <KpiCard title="Archived" value={archived} />
      </div>

      {/* FILTER SECTION */}
      <div className="bg-white p-4 rounded-xl shadow mb-4 flex justify-between">
        <input
          type="text"
          placeholder="Search by name or code..."
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
          <option value="DRAFT">DRAFT</option>
          <option value="INACTIVE">INACTIVE</option>
          <option value="ARCHIVED">ARCHIVED</option>
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
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Trainer</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Classes</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Passing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Action</TableHead>
              </tr>
            </thead>

            <tbody>
              {paginatedCourses.map((course) => (
                <tr key={course.id} className="border-t hover:bg-gray-50">
                  <TableCell>{course.code}</TableCell>
                  <TableCell className="font-medium">
                    {course.name}
                  </TableCell>
                  <TableCell>{course.trainerName || "N/A"}</TableCell>
                  <TableCell>{course.level}</TableCell>
                  <TableCell>
                    <span className="font-semibold text-blue-600">
                      {course.classCount || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-green-600">
                      {course.studentCount || 0}
                    </span>
                  </TableCell>
                  <TableCell>{course.durationHours}h</TableCell>
                  <TableCell>{course.passingScore}%</TableCell>
                  <TableCell>
                    <StatusBadge status={course.status} />
                  </TableCell>
                  <TableCell>
                    {course.createdAt 
                      ? new Date(course.createdAt).toLocaleDateString() 
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/admin/courses/${course.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </TableCell>
                </tr>
              ))}

              {paginatedCourses.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center p-6 text-gray-500">
                    No courses found.
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
    ACTIVE: "bg-green-100 text-green-700",
    INACTIVE: "bg-yellow-100 text-yellow-700",
    ARCHIVED: "bg-red-100 text-red-700",
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
