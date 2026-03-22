import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useCourseStore } from "../../stores/course.store";
import { ArrowLeft, BookOpen, User, Clock, Award, Users, Calendar, Loader2, FileText, Video, Link as LinkIcon, Image, Music, Folder } from "lucide-react";

export default function AdminCourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentCourse, loading, error, fetchCourseById, clearCurrentCourse } = useCourseStore();

  const courseId = Number(id);

  useEffect(() => {
    console.log("CourseDetailPage mounted with ID:", courseId);
    if (courseId) {
      fetchCourseById(courseId);
    }
    
    // Cleanup on unmount
    return () => {
      clearCurrentCourse();
    };
  }, [courseId, fetchCourseById, clearCurrentCourse]);

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-slate-100 min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (error || !currentCourse) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-slate-100 min-h-screen">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="text-red-500" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Course not found
          </h2>
          <p className="text-gray-500 mb-6">The course you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate("/admin/courses")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const course = currentCourse as any;

  // KPI stats
  const kpis = [
    { label: "Students", value: course.studentCount || 0, icon: Users, gradient: "from-green-500 to-emerald-400" },
    { label: "Classes", value: course.classCount || 0, icon: BookOpen, gradient: "from-indigo-500 to-purple-400" },
    { label: "Duration", value: `${course.durationHours || 0}h`, icon: Clock, gradient: "from-amber-500 to-orange-400" },
    { label: "Passing", value: `${course.passingScore || 0}%`, icon: Award, gradient: "from-blue-500 to-cyan-400" },
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-slate-100 min-h-screen">
      {/* =========================
          BREADCRUMB
      ========================= */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/courses")}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back to Courses
        </button>
      </div>

      {/* =========================
          HEADER CARD
      ========================= */}
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                <BookOpen className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {course.name}
              </h1>
            </div>
            <p className="text-gray-500 flex items-center gap-2">
              <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{course.code}</span>
              {course.category && <span className="text-gray-300">|</span>}
              {course.category && <span>{course.category}</span>}
            </p>
          </div>

          <StatusBadge status={course.status} />
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-sm">{kpi.label}</span>
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br ${kpi.gradient}`}>
                    <Icon className="text-white" size={14} />
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
              </div>
            );
          })}
        </div>

        {/* INFO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-100 text-sm">
          <InfoItem icon={User} label="Trainer" value={course.trainerName || "Not assigned"} />
          <InfoItem icon={Calendar} label="Created At" value={course.createdAt ? new Date(course.createdAt).toLocaleDateString() : "N/A"} />
          <InfoItem icon={Award} label="Level" value={course.level || "N/A"} />
        </div>
      </div>

      {/* =========================
          DESCRIPTION
      ========================= */}
      <SectionCard title="Description" icon={FileText}>
        <p className="text-gray-600 leading-relaxed">
          {course.description || "No description available."}
        </p>
      </SectionCard>

      {/* =========================
          ADDITIONAL INFO
      ========================= */}
      <SectionCard title="Course Details" icon={BookOpen}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-500 text-sm mb-1">Max Attempts</p>
            <p className="font-semibold text-gray-900">{course.maxAttempts || "Unlimited"}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-gray-500 text-sm mb-1">Prerequisites</p>
            <p className="font-semibold text-gray-900">{(course as any).prerequisites || "None"}</p>
          </div>
        </div>
      </SectionCard>

      {/* =========================
          OBJECTIVES
      ========================= */}
      {course.objectives && (
        <SectionCard title="Learning Objectives" icon={Award}>
          <p className="text-gray-600 whitespace-pre-line leading-relaxed">
            {(course as any).objectives}
          </p>
        </SectionCard>
      )}

      {/* =========================
          MATERIALS
      ========================= */}
      {course.materials && course.materials.length > 0 && (
        <SectionCard title="Course Materials" icon={Folder}>
          <div className="space-y-3">
            {course.materials.map((material: any) => (
              <div 
                key={material.id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <MaterialTypeIcon type={material.type} />
                  <div>
                    <p className="font-medium text-gray-900">{material.title}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      {material.type}
                      {material.fileSize && <span>• {formatFileSize(material.fileSize)}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {material.isRequired && (
                    <span className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full font-medium">
                      Required
                    </span>
                  )}
                  {material.fileUrl && (
                    <a 
                      href={material.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      View
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

/* =========================
   REUSABLE COMPONENTS
 ========================= */

function SectionCard({
  title,
  children,
  icon: Icon,
}: {
  title: string;
  children: React.ReactNode;
  icon?: any;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        {Icon && (
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
            <Icon className="text-white" size={16} />
          </div>
        )}
        <h2 className="text-lg font-semibold text-gray-900">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function InfoItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon?: any;
}) {
  return (
    <div className="flex items-center gap-3">
      {Icon && <Icon className="text-gray-400" size={18} />}
      <div>
        <p className="text-gray-500 text-xs">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const base = "px-4 py-2 text-sm font-semibold rounded-full";

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

function MaterialTypeIcon({ type }: { type: string }) {
  const getIcon = () => {
    switch (type?.toUpperCase()) {
      case "PDF":
        return <FileText className="text-red-500" size={20} />;
      case "VIDEO":
        return <Video className="text-purple-500" size={20} />;
      case "DOCUMENT":
        return <FileText className="text-blue-500" size={20} />;
      case "LINK":
        return <LinkIcon className="text-green-500" size={20} />;
      case "IMAGE":
        return <Image className="text-pink-500" size={20} />;
      case "AUDIO":
        return <Music className="text-yellow-500" size={20} />;
      default:
        return <Folder className="text-gray-500" size={20} />;
    }
  };

  const getBgColor = () => {
    switch (type?.toUpperCase()) {
      case "PDF":
        return "bg-red-100";
      case "VIDEO":
        return "bg-purple-100";
      case "DOCUMENT":
        return "bg-blue-100";
      case "LINK":
        return "bg-green-100";
      case "IMAGE":
        return "bg-pink-100";
      case "AUDIO":
        return "bg-yellow-100";
      default:
        return "bg-gray-100";
    }
  };
  
  return (
    <div className={`w-10 h-10 ${getBgColor()} rounded-lg flex items-center justify-center`}>
      {getIcon()}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
