import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useCourseStore } from "../../stores/course.store";

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
      <div className="p-6">
        <p className="text-gray-500">Loading course...</p>
      </div>
    );
  }

  if (error || !currentCourse) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold text-red-600">
          Course not found
        </h2>
        <button 
          onClick={() => navigate("/admin/courses")}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  const course = currentCourse;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* =========================
          BREADCRUMB
      ========================= */}
      <div className="mb-4 text-sm text-gray-500">
        <span
          className="cursor-pointer hover:underline"
          onClick={() => navigate("/admin/courses")}
        >
          Courses
        </span>
        {" > "}
        <span className="text-gray-700 font-medium">
          {course.name}
        </span>
      </div>

      {/* =========================
          HEADER CARD
      ========================= */}
      <div className="bg-white shadow rounded-xl p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              {course.name}
            </h1>
            <p className="text-gray-500">
              Code: {course.code}
            </p>
          </div>

          <StatusBadge status={course.status} />
        </div>

        {/* INFO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 text-sm">
          <InfoItem label="Trainer" value={course.trainerName || "Not assigned"} />
          <InfoItem label="Level" value={course.level || "N/A"} />
          <InfoItem
            label="Duration"
            value={`${course.durationHours || 0} hours`}
          />
          <InfoItem
            label="Passing Score"
            value={`${course.passingScore || 0}%`}
          />
          <InfoItem
            label="Classes"
            value={course.classCount || 0}
          />
          <InfoItem
            label="Students"
            value={course.studentCount || 0}
          />
          <InfoItem
            label="Category"
            value={course.category || "N/A"}
          />
          <InfoItem
            label="Created At"
            value={course.createdAt 
              ? new Date(course.createdAt).toLocaleDateString() 
              : "N/A"}
          />
        </div>
      </div>

      {/* =========================
          DESCRIPTION
      ========================= */}
      <SectionCard title="Description">
        <p className="text-gray-600">
          {course.description || "No description available."}
        </p>
      </SectionCard>

      {/* =========================
          ADDITIONAL INFO
      ========================= */}
      <SectionCard title="Course Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 text-sm">Max Attempts</p>
            <p className="font-medium">{course.maxAttempts || "Unlimited"}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Prerequisites</p>
            <p className="font-medium">{(course as any).prerequisites || "None"}</p>
          </div>
        </div>
      </SectionCard>

      {/* =========================
          OBJECTIVES
      ========================= */}
      {(course as any).objectives && (
        <SectionCard title="Learning Objectives">
          <p className="text-gray-600 whitespace-pre-line">
            {(course as any).objectives}
          </p>
        </SectionCard>
      )}

      {/* =========================
          MATERIALS
      ========================= */}
      {(course as any).materials && (course as any).materials.length > 0 && (
        <SectionCard title="Course Materials">
          <div className="space-y-3">
            {(course as any).materials.map((material: any) => (
              <div 
                key={material.id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MaterialTypeIcon type={material.type} />
                  <div>
                    <p className="font-medium text-gray-900">{material.title}</p>
                    <p className="text-sm text-gray-500">
                      {material.type} {material.fileSize ? `• ${formatFileSize(material.fileSize)}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {material.isRequired && (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                      Required
                    </span>
                  )}
                  {material.fileUrl && (
                    <a 
                      href={material.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
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
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white shadow rounded-xl p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const base =
    "px-3 py-1 text-xs font-semibold rounded-full";

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

function MaterialTypeIcon({ type }: { type: string }) {
  const iconClass = "w-8 h-8 p-1.5 rounded-lg";
  
  const styles: Record<string, { bg: string; color: string; icon: string }> = {
    PDF: { bg: "bg-red-100", color: "text-red-600", icon: "📄" },
    VIDEO: { bg: "bg-purple-100", color: "text-purple-600", icon: "🎬" },
    DOCUMENT: { bg: "bg-blue-100", color: "text-blue-600", icon: "📝" },
    LINK: { bg: "bg-green-100", color: "text-green-600", icon: "🔗" },
    IMAGE: { bg: "bg-pink-100", color: "text-pink-600", icon: "🖼️" },
    AUDIO: { bg: "bg-yellow-100", color: "text-yellow-600", icon: "🎵" },
  };
  
  const style = styles[type] || { bg: "bg-gray-100", color: "text-gray-600", icon: "📁" };
  
  return (
    <div className={`${iconClass} ${style.bg} ${style.color} flex items-center justify-center text-lg`}>
      {style.icon}
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
