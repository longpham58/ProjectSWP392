import { useParams, useNavigate } from "react-router-dom";
import { mockCourses } from "../../data/mockCourses";

export default function AdminCourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const courseId = Number(id);
  const course = mockCourses.find((c) => c.id === courseId);

  if (!course) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold text-red-600">
          Course not found
        </h2>
      </div>
    );
  }

  /* =========================
     CALCULATE AVG RATING
  ========================= */

  const averageRating =
    course.feedbacks.length > 0
      ? (
          course.feedbacks.reduce(
            (sum, fb) => sum + fb.rating,
            0
          ) / course.feedbacks.length
        ).toFixed(1)
      : "0.0";

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
          <InfoItem label="Trainer" value={course.trainer} />
          <InfoItem label="Level" value={course.level} />
          <InfoItem
            label="Duration"
            value={`${course.duration_hours} hours`}
          />
          <InfoItem
            label="Passing Score"
            value={`${course.passing_score}%`}
          />
          <InfoItem
            label="Total Materials"
            value={course.materials.length}
          />
          <InfoItem
            label="Created At"
            value={course.created_at}
          />
          <InfoItem
            label="Average Rating"
            value={`⭐ ${averageRating}`}
          />
        </div>
      </div>

      {/* =========================
          DESCRIPTION
      ========================= */}
      <SectionCard title="Description">
        <p className="text-gray-600">
          {course.description}
        </p>
      </SectionCard>

      {/* =========================
          OBJECTIVES
      ========================= */}
      <SectionCard title="Objectives">
        <p className="text-gray-600">
          {course.objectives}
        </p>
      </SectionCard>

      {/* =========================
          MATERIALS
      ========================= */}
      <SectionCard title={`Materials (${course.materials.length})`}>
        {course.materials.length === 0 ? (
          <p className="text-gray-500">
            No materials available.
          </p>
        ) : (
          <ul className="space-y-2">
            {course.materials.map((material) => (
              <li
                key={material.id}
                className="border rounded-lg p-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">
                    {material.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {material.type}
                  </p>
                </div>

                {material.is_required && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    Required
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {/* =========================
          FEEDBACK
      ========================= */}
      <SectionCard
        title={`Feedback (${course.feedbacks.length})`}
      >
        {course.feedbacks.length === 0 ? (
          <p className="text-gray-500">
            No feedback yet.
          </p>
        ) : (
          <div className="space-y-4">
            {course.feedbacks.map((fb) => (
              <div
                key={fb.id}
                className="border rounded-lg p-4"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {fb.user}
                  </span>
                  <span className="text-yellow-500">
                    {"⭐".repeat(fb.rating)}
                  </span>
                </div>

                <p className="text-gray-600 mt-2">
                  {fb.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
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
  status: "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED";
}) {
  const base =
    "px-3 py-1 text-xs font-semibold rounded-full";

  const styles = {
    DRAFT: "bg-gray-200 text-gray-700",
    ACTIVE: "bg-green-100 text-green-700",
    INACTIVE: "bg-yellow-100 text-yellow-700",
    ARCHIVED: "bg-red-100 text-red-700",
  };

  return (
    <span className={`${base} ${styles[status]}`}>
      {status}
    </span>
  );
}