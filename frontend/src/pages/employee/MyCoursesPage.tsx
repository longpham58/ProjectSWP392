import { useState, useEffect } from "react";
import { useAuthStore } from "../../stores/auth.store";
import { employeeApi } from "../../api/employee.api";
import type { CourseSummary } from "../../api/employee.api";
import { useNavigate } from "react-router-dom";
import { CourseCardSkeleton } from "../../components/common/LoadingSpinner";
import { NoCoursesFound } from "../../components/common/EmptyState";
import { LayoutGrid, List, BookOpen, Clock, Users, ChevronRight } from "lucide-react";

type SortOption = "name" | "progress" | "duration";
type ViewMode = "grid" | "list";

function statusLabel(status: string | null) {
  if (status === "COMPLETED") return { text: "Hoàn thành", bg: "#F5F3FF", color: "#7C3AED" };
  if (status === "CANCELLED") return { text: "Đã hủy", bg: "#FEF2F2", color: "#DC2626" };
  if (status === "ACTIVE" || status === "APPROVED" || status === "REGISTERED" || status === "WAITLIST")
    return { text: "Đang học", bg: "#ECFDF5", color: "#16A34A" };
  return { text: "Chưa tham gia", bg: "#F3F4F6", color: "#6B7280" };
}

function CourseCard({ course, viewMode }: { course: CourseSummary; viewMode: ViewMode }) {
  const navigate = useNavigate();
  const badge = statusLabel(course.enrollmentStatus);
  if (viewMode === "list") {
    return (
      <div onClick={() => navigate("/employee/course/" + course.id)}
        style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", transition: "box-shadow 0.2s" }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)")}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)")}>
        <div style={{ width: "44px", height: "44px", background: "#EFF6FF", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <BookOpen size={20} style={{ color: "#2563EB" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827", marginBottom: "4px" }}>{course.title}</div>
          <div style={{ fontSize: "12px", color: "#6B7280" }}>{course.trainerName} - {course.category} - {course.durationHours}h</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
          <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "99px", background: badge.bg, color: badge.color }}>{badge.text}</span>
          <ChevronRight size={16} style={{ color: "#9CA3AF" }} />
        </div>
      </div>
    );
  }
  return (
    <div onClick={() => navigate("/employee/course/" + course.id)}
      style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "20px", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", transition: "box-shadow 0.2s, transform 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div style={{ width: "40px", height: "40px", background: "#EFF6FF", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BookOpen size={18} style={{ color: "#2563EB" }} />
        </div>
        <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "99px", background: badge.bg, color: badge.color }}>{badge.text}</span>
      </div>
      <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827", marginBottom: "6px" }}>{course.title}</div>
      <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "14px" }}>{course.trainerName}</div>
      <div style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
        <span style={{ fontSize: "11px", color: "#6B7280", display: "flex", alignItems: "center", gap: "4px" }}><Clock size={11} /> {course.durationHours}h</span>
        <span style={{ fontSize: "11px", color: "#6B7280", display: "flex", alignItems: "center", gap: "4px" }}><Users size={11} /> {course.enrolledStudents}</span>
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
          <span style={{ fontSize: "11px", color: "#6B7280" }}>Tien do</span>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#2563EB" }}>{course.progress}%</span>
        </div>
        <div style={{ background: "#E5E7EB", borderRadius: "99px", height: "5px" }}>
          <div style={{ background: "#2563EB", height: "5px", borderRadius: "99px", width: course.progress + "%" }} />
        </div>
      </div>
    </div>
  );
}

export default function MyCoursesPage() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [filter, setFilter] = useState<"all" | "APPROVED" | "REGISTERED" | "COMPLETED">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    if (!user?.id) return;
    setIsLoading(true);
    employeeApi.getMyLearning(user.id).then(res => setCourses(res.data)).catch(() => {}).finally(() => setIsLoading(false));
  }, [user?.id]);

  let filtered = courses.filter(c => {
    const matchFilter = filter === "all"
      || (filter === "APPROVED" && (c.enrollmentStatus === "ACTIVE" || c.enrollmentStatus === "APPROVED" || c.enrollmentStatus === "REGISTERED" || c.enrollmentStatus === "WAITLIST"))
      || (filter === "COMPLETED" && c.enrollmentStatus === "COMPLETED");
    const matchSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || (c.category || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "progress") return b.progress - a.progress;
    if (sortBy === "duration") return b.durationHours - a.durationHours;
    return a.title.localeCompare(b.title);
  });

  const approved = courses.filter(c => c.enrollmentStatus === "ACTIVE" || c.enrollmentStatus === "APPROVED" || c.enrollmentStatus === "REGISTERED" || c.enrollmentStatus === "WAITLIST").length;
  const completed = courses.filter(c => c.enrollmentStatus === "COMPLETED").length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Khóa học của tôi</h1>
        <p className="text-gray-500 text-sm">Các khóa học trong hệ thống đào tạo</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng số", value: courses.length, color: "#2563EB", bg: "#EFF6FF" },
          { label: "Đang học", value: approved, color: "#16A34A", bg: "#ECFDF5" },
          { label: "Hoàn thành", value: completed, color: "#7C3AED", bg: "#F5F3FF" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} style={{ background: bg, border: "1px solid #E5E7EB", borderRadius: "10px", padding: "16px" }}>
            <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "4px" }}>{label}</div>
            <div style={{ fontSize: "28px", fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>
      <div className="mb-5 space-y-3">
        <input type="text" placeholder="Tìm kiếm khóa học..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {(["all", "APPROVED", "COMPLETED"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={"px-3 py-1.5 rounded-lg text-sm transition-colors " + (filter === f ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200")}>
                {f === "all" ? "Tất cả" : f === "APPROVED" ? "Đang học" : "Hoàn thành"}
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)}
              className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="name">Tên A-Z</option>
              <option value="progress">Tiến độ</option>
              <option value="duration">Thời lượng</option>
            </select>
            <div className="flex border rounded-lg overflow-hidden">
              <button onClick={() => setViewMode("grid")} className={"px-3 py-1.5 text-sm " + (viewMode === "grid" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100")}><LayoutGrid size={15} /></button>
              <button onClick={() => setViewMode("list")} className={"px-3 py-1.5 text-sm " + (viewMode === "list" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100")}><List size={15} /></button>
            </div>
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{[1,2,3].map(i => <CourseCardSkeleton key={i} />)}</div>
      ) : filtered.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{filtered.map(c => <CourseCard key={c.id} course={c} viewMode="grid" />)}</div>
        ) : (
          <div className="space-y-3">{filtered.map(c => <CourseCard key={c.id} course={c} viewMode="list" />)}</div>
        )
      ) : (
        <NoCoursesFound />
      )}
    </div>
  );
}