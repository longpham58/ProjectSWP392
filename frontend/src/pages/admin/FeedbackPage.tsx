import { useState } from "react";

/* =========================
   MOCK SYSTEM FEEDBACK ONLY
========================= */

const mockSystemFeedbacks = [
  {
    id: 1,
    subject: "Video buffering issue",
    message: "Training videos are buffering during peak hours.",
    employeeName: "",
    isAnonymous: true,
    status: "NEW",
    createdAt: "2026-02-20",
  },
  {
    id: 2,
    subject: "Login bug",
    message: "Sometimes login redirects to wrong page.",
    employeeName: "John Doe",
    isAnonymous: false,
    status: "REVIEWED",
    createdAt: "2026-02-22",
  },
  {
    id: 3,
    subject: "Slow dashboard loading",
    message: "Dashboard takes 10+ seconds to load statistics.",
    employeeName: "",
    isAnonymous: true,
    status: "RESOLVED",
    createdAt: "2026-02-24",
  },
];

type StatusType = "ALL" | "NEW" | "REVIEWED" | "RESOLVED";

export default function AdminSystemFeedbackPage() {
  const [statusFilter, setStatusFilter] =
    useState<StatusType>("ALL");

  /* =========================
     FILTER BY STATUS
  ========================= */

  const filteredFeedbacks =
    statusFilter === "ALL"
      ? mockSystemFeedbacks
      : mockSystemFeedbacks.filter(
          (fb) => fb.status === statusFilter
        );

  /* =========================
     UPDATE STATUS (MOCK)
  ========================= */

  const updateStatus = (id: number, newStatus: string) => {
    alert(`Mock update feedback ${id} → ${newStatus}`);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        System Feedback Management
      </h2>

      {/* =========================
          STATUS FILTER
      ========================= */}
      <div className="flex gap-3 mb-6">
        {["ALL", "NEW", "REVIEWED", "RESOLVED"].map(
          (status) => (
            <button
              key={status}
              onClick={() =>
                setStatusFilter(status as StatusType)
              }
              className={`px-4 py-2 rounded-full text-sm font-medium transition 
              ${
                statusFilter === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {status}
            </button>
          )
        )}
      </div>

      {/* =========================
          FEEDBACK LIST
      ========================= */}
      <div className="space-y-5">
        {filteredFeedbacks.length === 0 && (
          <p className="text-gray-500">
            No feedback found.
          </p>
        )}

        {filteredFeedbacks.map((fb) => (
          <div
            key={fb.id}
            className="border rounded-xl p-5 shadow-sm bg-white"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-lg">
                {fb.subject}
              </h3>

              <StatusBadge status={fb.status} />
            </div>

            {/* MESSAGE */}
            <p className="text-gray-600 mb-3">
              {fb.message}
            </p>

            {/* FOOTER */}
            <div className="text-xs text-gray-500 flex justify-between items-center">
              <span>
                {fb.isAnonymous
                  ? "Anonymous"
                  : `Submitted by: ${fb.employeeName}`}
                {" | "}
                {new Date(
                  fb.createdAt
                ).toLocaleDateString()}
              </span>

              {/* ACTION BUTTONS */}
              <div className="flex gap-2">
                {fb.status !== "REVIEWED" && (
                  <button
                    onClick={() =>
                      updateStatus(fb.id, "REVIEWED")
                    }
                    className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded"
                  >
                    Mark Reviewed
                  </button>
                )}

                {fb.status !== "RESOLVED" && (
                  <button
                    onClick={() =>
                      updateStatus(fb.id, "RESOLVED")
                    }
                    className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================
   STATUS BADGE
========================= */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const base =
    "px-3 py-1 text-xs font-semibold rounded-full";

  const styles: Record<string, string> = {
    NEW: "bg-red-100 text-red-600",
    REVIEWED: "bg-yellow-100 text-yellow-700",
    RESOLVED: "bg-green-100 text-green-700",
  };

  return (
    <span className={`${base} ${styles[status]}`}>
      {status}
    </span>
  );
}