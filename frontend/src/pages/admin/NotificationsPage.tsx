import { useState, useEffect } from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import { useAdminStore } from "../../stores/admin.store";
import { AdminNotificationDto } from "../../api/admin.api";

export default function AdminNotificationsPage() {
  const { 
    notifications, 
    loading, 
    error,
    fetchNotifications, 
    createNotification, 
    updateNotification, 
    sendNotification, 
    deleteNotification 
  } = useAdminStore();
  
  const [activeTab, setActiveTab] = useState<"Sent" | "Draft">("Sent");
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formType, setFormType] = useState<"ANNOUNCEMENT" | "SYSTEM" | "APPROVAL" | "REMINDER">("ANNOUNCEMENT");
  const [formPriority, setFormPriority] = useState<"LOW" | "NORMAL" | "HIGH" | "URGENT">("NORMAL");
  const [formTarget, setFormTarget] = useState<"ALL" | "EMPLOYEE" | "TRAINER" | "HR">("ALL");
  const [selectedNotification, setSelectedNotification] =
    useState<AdminNotificationDto | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "view" | "edit">("create");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Filter notifications by status (using targetRole to determine sent/draft)
  const filteredNotifications = notifications
    .filter((notif) => {
      // Check if status contains "SENT" to determine sent vs draft
      const isSent = notif.status && notif.status.includes("SENT");
      if (activeTab === "Sent") return isSent;
      return !isSent;
    })
    .sort((a, b) => {
      // Sort by sentDate descending (latest first)
      const dateA = a.sentDate ? new Date(a.sentDate).getTime() : 0;
      const dateB = b.sentDate ? new Date(b.sentDate).getTime() : 0;
      return dateB - dateA;
    });

  const sentCount = notifications.filter(n => n.status && n.status.includes("SENT")).length;
  const draftCount = notifications.filter(n => n.status && !n.status.includes("SENT")).length;

  const resetForm = () => {
    setFormTitle("");
    setFormMessage("");
    setFormType("ANNOUNCEMENT");
    setFormPriority("NORMAL");
    setFormTarget("ALL");
    setFormError(null);
    setModalMode("create");
  };

  const handleCreate = async (sendNow: boolean) => {
    if (!formTitle.trim()) {
      setFormError("Title is required");
      return;
    }
    
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      const notificationData: Partial<AdminNotificationDto> = {
        title: formTitle,
        content: formMessage,
        type: formType,
        priority: formPriority,
        targetRole: formTarget,
      };

      if (sendNow) {
        // Create and send directly
        const created = await createNotification(notificationData);
        if (created) {
          await sendNotification(created.id);
        }
      } else {
        // Just save as draft
        await createNotification(notificationData);
      }
      
      resetForm();
      setShowForm(false);
    } catch (err) {
      setFormError("Failed to create notification. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedNotification || !formTitle.trim()) {
      setFormError("Title is required");
      return;
    }
    
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      await updateNotification(selectedNotification.id, {
        title: formTitle,
        content: formMessage,
        type: formType,
        priority: formPriority,
        targetRole: formTarget,
      });
      
      resetForm();
      setShowForm(false);
      setSelectedNotification(null);
    } catch (err) {
      setFormError("Failed to update notification. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      try {
        await deleteNotification(id);
      } catch (err) {
        alert("Failed to delete notification");
      }
    }
  };

  const handleSendNow = async (id: number) => {
    try {
      await sendNotification(id);
    } catch (err) {
      alert("Failed to send notification");
    }
  };

  const viewNotification = (notif: AdminNotificationDto) => {
    setSelectedNotification(notif);
    setFormTitle(notif.title || "");
    setFormMessage(notif.content || "");
    setFormType(notif.type === "GENERAL" ? "ANNOUNCEMENT" : notif.type as any);
    setFormPriority(notif.priority as any);
    setFormTarget(notif.targetRole as any);
    setShowViewModal(true);
  };

  const editNotification = (notif: AdminNotificationDto) => {
    setSelectedNotification(notif);
    setFormTitle(notif.title || "");
    setFormMessage(notif.content || "");
    setFormType(notif.type === "GENERAL" ? "ANNOUNCEMENT" : notif.type as any);
    setFormPriority(notif.priority as any);
    setFormTarget(notif.targetRole as any);
    setModalMode("edit");
    setShowForm(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "bg-gray-100 text-gray-600";
      case "NORMAL":
        return "bg-blue-100 text-blue-600";
      case "HIGH":
        return "bg-orange-100 text-orange-600";
      case "URGENT":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getTargetLabel = (target: string) => {
    switch (target) {
      case "ALL": return "All Users";
      case "EMPLOYEE": return "Employees";
      case "TRAINER": return "Trainers";
      case "HR": return "HR";
      default: return target;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notification Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
        >
          <PlusCircle size={18} />
          Create Notification
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-lg"
            >
              ✕
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-bold">
                {modalMode === "edit" ? "Edit Notification" : "Create Notification"}
              </h2>
              <p className="text-sm text-gray-500">
                Send announcements or system alerts to users.
              </p>
            </div>

            {formError && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-5 mb-6">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Notification Type
                </label>
                <select
                  value={formType}
                  onChange={(e) =>
                    setFormType(e.target.value as any)
                  }
                  className="border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 border-gray-200 transition-all font-medium"
                  disabled={modalMode === "view"}
                >
                  <option value="ANNOUNCEMENT">Announcement</option>
                  <option value="SYSTEM">System Alert</option>
                  <option value="APPROVAL">Approval</option>
                  <option value="REMINDER">Reminder</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Priority Level
                </label>
                <select
                  value={formPriority}
                  onChange={(e) =>
                    setFormPriority(e.target.value as any)
                  }
                  className="border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 border-gray-200 transition-all font-medium"
                  disabled={modalMode === "view"}
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Target Audience
                </label>
                <select
                  value={formTarget}
                  onChange={(e) =>
                    setFormTarget(e.target.value as any)
                  }
                  className="border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 border-gray-200 transition-all font-medium"
                  disabled={modalMode === "view"}
                >
                  <option value="ALL">All Users</option>
                  <option value="EMPLOYEE">Employees (Students)</option>
                  <option value="TRAINER">Trainers</option>
                  <option value="HR">HR Managers</option>
                </select>
              </div>
            </div>

            <div className="mb-5">
              <label className="text-sm font-medium text-gray-600">
                Notification Title
              </label>
              <input
                type="text"
                value={formTitle}
                readOnly={modalMode === "view"}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Enter notification title..."
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="mb-6">
              <label className="text-sm font-medium text-gray-600">
                Message
              </label>
              <textarea
                rows={4}
                value={formMessage}
                readOnly={modalMode === "view"}
                onChange={(e) => setFormMessage(e.target.value)}
                placeholder="Write the notification message..."
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex justify-between items-center border-t pt-4">
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-black"
              >
                Cancel
              </button>

              {modalMode === "create" ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleCreate(false)}
                    disabled={isSubmitting}
                    className="bg-gray-200 px-4 py-2 rounded-xl hover:bg-gray-300 transition disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Save Draft"}
                  </button>
                  <button
                    onClick={() => handleCreate(true)}
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Send Notification"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEdit}
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Update Notification"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-6 border-b">
        <button
          onClick={() => setActiveTab("Sent")}
          className={`pb-2 px-2 font-medium transition ${
            activeTab === "Sent"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-blue-600"
          }`}
        >
          Sent ({sentCount})
        </button>

        <button
          onClick={() => setActiveTab("Draft")}
          className={`pb-2 px-2 font-medium transition ${
            activeTab === "Draft"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-blue-600"
          }`}
        >
          Draft ({draftCount})
        </button>
      </div>

      {loading && notifications.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No {activeTab.toLowerCase()} notifications found.
        </div>
      ) : (
        <div className="space-y-4 mt-6">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className="bg-white rounded-2xl shadow border-l-4 border-blue-500 p-6 hover:shadow-md transition"
            >
              <div className="flex justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">
                      {notif.title}
                    </h3>
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${getPriorityColor(
                        notif.priority || "NORMAL"
                      )}`}
                    >
                      {notif.priority || "NORMAL"}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mt-2">
                    {notif.content}
                  </p>

                  <p className="text-xs text-gray-400 mt-3">
                    Sent: {notif.sentDate || "Not sent"} • Target: {getTargetLabel(notif.targetRole || "ALL")}
                  </p>
                </div>

                <div className="flex flex-col gap-2 ml-6">
                  {activeTab === "Sent" && (
                    <>
                      <button
                        onClick={() => viewNotification(notif)}
                        className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleDelete(notif.id)}
                        className="bg-red-100 text-red-600 hover:bg-red-200 px-4 py-2 rounded-lg text-sm"
                      >
                        Delete
                      </button>
                    </>
                  )}

                  {activeTab === "Draft" && (
                    <>
                      <button
                        onClick={() => editNotification(notif)}
                        className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleSendNow(notif.id)}
                        className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"
                      >
                        Send Now
                      </button>
                      <button
                        onClick={() => handleDelete(notif.id)}
                        className="bg-red-100 text-red-600 hover:bg-red-200 px-4 py-2 rounded-lg text-sm"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedNotification && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 relative">
            <button
              onClick={() => setShowViewModal(false)}
              className="absolute top-4 right-4"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold">
              {selectedNotification.title}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Priority: {selectedNotification.priority}
            </p>

            <div className="mt-6 space-y-2 text-sm">
              <p>
                <b>Sent:</b> {selectedNotification.sentDate || "Not sent"}
              </p>
              <p>
                <b>Target:</b> {getTargetLabel(selectedNotification.targetRole || "ALL")}
              </p>
              <p>
                <b>Type:</b> {selectedNotification.type}
              </p>
              <p>
                <b>Recipients:</b> {selectedNotification.recipientCount || 0}
              </p>
              <p>
                <b>Read:</b> {selectedNotification.readCount || 0}
              </p>
              {selectedNotification.expiresAt && (
                <p>
                  <b>Expires:</b> {selectedNotification.expiresAt}
                </p>
              )}
            </div>

            <div className="mt-6">
              <p className="font-medium">Message</p>
              <p className="text-gray-600 mt-1">
                {selectedNotification.content}
              </p>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="bg-gray-200 px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
