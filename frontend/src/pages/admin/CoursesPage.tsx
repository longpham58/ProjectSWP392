import { useState, useMemo, useEffect, ReactNode } from "react";
import { Link } from "react-router-dom";
import { useCourseStore } from "../../stores/course.store";
import { Search, BookOpen, Users, Clock, Award, ChevronLeft, ChevronRight, Eye, FileText } from "lucide-react";

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

  const kpis = [
    { title: "Tổng khóa học", value: total, icon: BookOpen, gradient: "from-indigo-500 to-purple-400", bgGradient: "from-indigo-50 to-purple-50" },
    { title: "Đang hoạt động", value: active, icon: Award, gradient: "from-green-500 to-emerald-400", bgGradient: "from-green-50 to-emerald-50" },
    { title: "Nháp", value: draft, icon: FileText, gradient: "from-amber-500 to-orange-400", bgGradient: "from-amber-50 to-orange-50" },
    { title: "Đã lưu trữ", value: archived, icon: BookOpen, gradient: "from-gray-500 to-slate-400", bgGradient: "from-gray-50 to-slate-50" },
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-slate-100 min-h-screen">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Quản lý khóa học
        </h1>
        <p className="text-gray-500 mt-1">Quản lý và tổ chức các khóa đào tạo</p>
      </div>

      {/* KPI SECTION */}
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

      {/* FILTER SECTION */}
      <div className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 mb-6 flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mã..."
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
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="DRAFT">DRAFT</option>
          <option value="INACTIVE">INACTIVE</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow-sm rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Đang tải...</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gradient-to-r from-gray-50 to-slate-50 text-left">
              <tr>
                <TableHead>Mã</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Giảng viên</TableHead>
                <TableHead>Cấp độ</TableHead>
                <TableHead>Lớp học</TableHead>
                <TableHead>Học viên</TableHead>
                <TableHead>Thời lượng</TableHead>
                <TableHead>Điểm đạt</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Hành động</TableHead>
              </tr>
            </thead>

            <tbody>
              {paginatedCourses.map((course) => (
                <tr key={course.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <TableCell className="font-mono text-indigo-600">{course.code}</TableCell>
                  <TableCell className="font-medium text-gray-900">
                    {course.name}
                  </TableCell>
                  <TableCell>{course.trainerName || "N/A"}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                      {course.level}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-indigo-600 flex items-center gap-1">
                      <BookOpen size={14} />
                      {course.classCount || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-green-600 flex items-center gap-1">
                      <Users size={14} />
                      {course.studentCount || 0}
                    </span>
                  </TableCell>
                  <TableCell className="flex items-center gap-1 text-gray-600">
                    <Clock size={14} />
                    {course.durationHours}h
                  </TableCell>
                  <TableCell>
                    <span className="text-amber-600 font-medium">{course.passingScore}%</span>
                  </TableCell>
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
                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                    >
                      <Eye size={14} />
                      Xem
                    </Link>
                  </TableCell>
                </tr>
              ))}

              {paginatedCourses.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center p-12 text-gray-500">
                    <div className="flex flex-col items-center">
                      <BookOpen size={48} className="text-gray-300 mb-2" />
                      <p>Không tìm thấy khóa học nào.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-xl shadow-sm">
        <p className="text-sm text-gray-600">
          Hiển thị {((currentPage - 1) * itemsPerPage) + 1} đến {Math.min(currentPage * itemsPerPage, filteredCourses.length)} trong {filteredCourses.length} kết quả
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
    </div>
  );
}

/* =========================
   SMALL COMPONENTS
 ========================= */

function TableHead({ children }: { children: ReactNode }) {
  return <th className="p-4 font-semibold text-gray-700">{children}</th>;
}

function TableCell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <td className={`p-4 ${className}`}>
      {children}
    </td>
  );
}

function StatusBadge({ status }: { status: string }) {
  const base = "px-3 py-1.5 text-xs font-semibold rounded-full";

  const styles: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
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
