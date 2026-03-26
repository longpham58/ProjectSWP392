import { useState, useEffect } from "react";
import { PlusCircle, Loader2, Bell, Send, Edit, Trash2, Eye, X } from "lucide-react";
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
  
  const [activeTab, setActiveTab] = useState<"Sent" | "Draft">("Draft");
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
  const draftCount = notifications.filter(n => !n.status || !n.status.includes("SENT")).length;

  const resetForm = () => {
    setFormTitle("");
    setFormMessage("");
    setFormType("ANNOUNCEMENT");
    setFormPriority("NORMAL");
    setFormTarget("ALL");
    setFormError(null);
    setSelectedNotification(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formMessage.trim()) {
      setFormError("Tiêu đề và nội dung là bắt buộc");
      return;
    }

    setIsSubmitting(true);
    try {
      if (modalMode === "edit" && selectedNotification) {
        await updateNotification(selectedNotification.id, {
          title: formTitle,
          content: formMessage,
          type: formType,
          priority: formPriority,
          targetRole: formTarget
        });
      } else {
        await createNotification({
          title: formTitle,
          content: formMessage,
          type: formType,
          priority: formPriority,
          targetRole: formTarget,
          status: "DRAFT"
        });
      }
      resetForm();
      setShowForm(false);
      await fetchNotifications();
    } catch (err) {
      setFormError("Failed to save notification");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendNow = async (id: number) => {
    try {
      await sendNotification(id);
      await fetchNotifications();
    } catch (err) {
      console.error("Failed to send notification", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc muốn xóa thông báo này không?")) {
      try {
        await deleteNotification(id);
        await fetchNotifications();
      } catch (err) {
        console.error("Failed to delete notification", err);
      }
    }
  };

  const viewNotification = (notif: AdminNotificationDto) => {
    setSelectedNotification(notif);
    setShowViewModal(true);
  };

  const editNotification = (notif: AdminNotificationDto) => {
    setSelectedNotification(notif);
    setFormTitle(notif.title);
    setFormMessage(notif.content);
    setFormType(notif.type as any);
    setFormPriority(notif.priority as any);
    setFormTarget((notif.targetRole as any) || "ALL");
    setModalMode("edit");
    setShowForm(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT": return "bg-red-100 text-red-700";
      case "HIGH": return "bg-orange-100 text-orange-700";
      case "NORMAL": return "bg-blue-100 text-blue-700";
      case "LOW": return "bg-gray-100 text-gray-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getTargetLabel = (target: string) => {
    switch (target) {
      case "ALL": return "Tất cả người dùng";
      case "EMPLOYEE": return "Nhân viên";
      case "TRAINER": return "Giảng viên";
      case "HR": return "Nhân sự";
      default: return target;
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý thông báo</h1>
          <p className="text-gray-500 mt-1">Gửi thông báo và cảnh báo đến người dùng</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setModalMode("create");
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <PlusCircle size={18} />
          Tạo thông báo
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {modalMode === "edit" ? "Chỉnh sửa thông báo" : "Tạo thông báo mới"}
            </h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Nhập tiêu đề thông báo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
              <textarea
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Nhập nội dung thông báo"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="ANNOUNCEMENT">Thông báo</option>
                  <option value="SYSTEM">Hệ thống</option>
                  <option value="APPROVAL">Phê duyệt</option>
                  <option value="REMINDER">Nhắc nhở</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Độ ưu tiên</label>
                <select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="LOW">Thấp</option>
                  <option value="NORMAL">Bình thường</option>
                  <option value="HIGH">Cao</option>
                  <option value="URGENT">Khẩn cấp</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đối tượng</label>
                <select
                  value={formTarget}
                  onChange={(e) => setFormTarget(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="ALL">Tất cả người dùng</option>
                  <option value="EMPLOYEE">Nhân viên</option>
                  <option value="TRAINER">Giảng viên</option>
                  <option value="HR">Nhân sự</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="px-5 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={16} />
                    Đang lưu...
                  </span>
                ) : modalMode === "edit" ? "Cập nhật" : "Lưu nháp"
                }
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("Draft")}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
            activeTab === "Draft"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-gray-600 hover:bg-white"
          }`}
        >
          <span className="flex items-center gap-2">
            <Edit size={16} />
            Nháp ({draftCount})
          </span>
        </button>
        <button
          onClick={() => setActiveTab("Sent")}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
            activeTab === "Sent"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-gray-600 hover:bg-white"
          }`}
        >
          <span className="flex items-center gap-2">
            <Send size={16} />
            Đã gửi ({sentCount})
          </span>
        </button>
      </div>

      {/* Notifications List */}
      {loading && notifications.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <Bell className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 text-lg">Không tìm thấy thông báo {activeTab === "Sent" ? "đã gửi" : "nháp"}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden"
            >
              <div className="flex">
                {/* Color indicator */}
                <div className={`w-1.5 ${activeTab === 'Sent' ? 'bg-gradient-to-b from-indigo-500 to-purple-600' : 'bg-gradient-to-b from-amber-500 to-orange-600'}`}></div>
                
                <div className="flex-1 p-5">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {notif.title}
                        </h3>
                        <span
                          className={`px-3 py-1 text-xs rounded-full font-medium ${getPriorityColor(
                            notif.priority || "NORMAL"
                          )}`}
                        >
                          {notif.priority || "NORMAL"}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                        {notif.content}
                      </p>

                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Bell size={14} />
                          {notif.sentDate || "Chưa gửi"}
                        </span>
                        <span className="flex items-center gap-1">
                          Đối tượng: {getTargetLabel(notif.targetRole || "ALL")}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-6">
                      {activeTab === "Sent" && (
                        <>
                          <button
                            onClick={() => viewNotification(notif)}
                            className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm"
                          >
                            <Eye size={14} />
                            Xem
                          </button>
                          <button
                            onClick={() => handleDelete(notif.id)}
                            className="flex items-center gap-1 bg-red-100 text-red-600 hover:bg-red-200 px-4 py-2 rounded-lg text-sm"
                          >
                            <Trash2 size={14} />
                            Xóa
                          </button>
                        </>
                      )}

                      {activeTab === "Draft" && (
                        <>
                          <button
                            onClick={() => editNotification(notif)}
                            className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm"
                          >
                            <Edit size={14} />
                            Chỉnh sửa
                          </button>
                          <button
                            onClick={() => handleSendNow(notif.id)}
                            className="flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"
                          >
                            <Send size={14} />
                            Gửi
                          </button>
                          <button
                            onClick={() => handleDelete(notif.id)}
                            className="flex items-center gap-1 bg-red-100 text-red-600 hover:bg-red-200 px-4 py-2 rounded-lg text-sm"
                          >
                            <Trash2 size={14} />
                            Xóa
                          </button>
                        </>
                      )}
                    </div>
                  </div>
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
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-gray-900">
              {selectedNotification.title}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Độ ưu tiên: <span className={getPriorityColor(selectedNotification.priority || "NORMAL")}>{selectedNotification.priority}</span>
            </p>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Bell size={16} />
                <span><strong>Đã gửi:</strong> {selectedNotification.sentDate || "Chưa gửi"}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span><strong>Đối tượng:</strong> {getTargetLabel(selectedNotification.targetRole || "ALL")}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span><strong>Loại:</strong> {selectedNotification.type}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span><strong>Người nhận:</strong> {selectedNotification.recipientCount || 0}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span><strong>Đã đọc:</strong> {selectedNotification.readCount || 0}</span>
              </div>
              {selectedNotification.expiresAt && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span><strong>Hết hạn:</strong> {selectedNotification.expiresAt}</span>
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-gray-800 mb-2">Nội dung</h3>
              <p className="text-gray-600 text-sm whitespace-pre-wrap">{selectedNotification.content}</p>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="bg-gray-200 hover:bg-gray-300 px-5 py-2 rounded-xl transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
