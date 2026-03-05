import { useState } from "react";
import { PlusCircle } from "lucide-react";

type AdminNotification = {
  id: number;
  title: string;
  message: string;
  type: "ANNOUNCEMENT" | "SYSTEM";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  target: "ALL" | "EMPLOYEE" | "TRAINER" | "HR";
  sentDate: string;
  expiresAt?: string;
  recipients: number;
  readCount: number;
  status: "SENT" | "DRAFT";
};

const dummyNotifications: AdminNotification[] = [
  {
    id: 1,
    title: "System Maintenance Tonight",
    message: "The system will be unavailable from 10PM–12AM.",
    type: "SYSTEM",
    priority: "HIGH",
    target: "ALL",
    sentDate: "2026-02-26",
    expiresAt: "2026-02-27",
    recipients: 350,
    readCount: 280,
    status: "SENT", 
  },
  {
    id: 2,
    title: "New Compliance Training Released",
    message: "Mandatory compliance training is now available.",
    type: "ANNOUNCEMENT",
    priority: "NORMAL",
    target: "EMPLOYEE",
    sentDate: "2026-02-20",
    recipients: 300,
    readCount: 250,
    status: "DRAFT",
  },
];

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] =
    useState<AdminNotification[]>(dummyNotifications);
const [activeTab, setActiveTab] = useState<"Sent" | "Draft">("Sent");
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
const [formMessage, setFormMessage] = useState("");
const [formType, setFormType] = useState<"ANNOUNCEMENT" | "SYSTEM">("ANNOUNCEMENT");
const [formPriority, setFormPriority] = useState<"LOW" | "NORMAL" | "HIGH" | "URGENT">("NORMAL");
const [formTarget, setFormTarget] = useState<"ALL" | "EMPLOYEE" | "TRAINER" | "HR">("ALL");
const [formExpiresAt, setFormExpiresAt] = useState("");
const [selectedNotification, setSelectedNotification] =
  useState<AdminNotification | null>(null);

const [modalMode, setModalMode] =
  useState<"create" | "view" | "edit">("create");
  const [showViewModal, setShowViewModal] = useState(false);
const viewNotification = (notif: AdminNotification) => {
  setSelectedNotification(notif);

  setFormTitle(notif.title);
  setFormMessage(notif.message);
  setFormType(notif.type);
  setFormPriority(notif.priority);
  setFormTarget(notif.target);
  setFormExpiresAt(notif.expiresAt || "");

  setShowViewModal(true);
};
const editNotification = (notif: AdminNotification) => {
  setSelectedNotification(notif);

  setFormTitle(notif.title);
  setFormMessage(notif.message);
  setFormType(notif.type);
  setFormPriority(notif.priority);
  setFormTarget(notif.target);
  setFormExpiresAt(notif.expiresAt || "");

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
      return "";
  }
};

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const filteredNotifications = notifications.filter((notif) => {
  if (activeTab === "Sent") return notif.status === "SENT";
  return notif.status === "DRAFT";
});
const addNotification = (status: "SENT" | "DRAFT") => {
  const newNotif: AdminNotification = {
    id: Date.now(),
    title: formTitle || "Untitled Notification",
    message: formMessage || "No message provided",
    type: formType,
    priority: formPriority,
    target: formTarget,
    sentDate: new Date().toISOString().split("T")[0],
    expiresAt: formExpiresAt || undefined,
    recipients: 0,
    readCount: 0,
    status,
  };

  setNotifications((prev) => [newNotif, ...prev]);

  // reset form
  setFormTitle("");
  setFormMessage("");
  setFormType("ANNOUNCEMENT");
  setFormPriority("NORMAL");
  setFormTarget("ALL");
  setFormExpiresAt("");
};
const deleteNotification = (id: number) => {
  setNotifications((prev) => prev.filter((n) => n.id !== id));
};
const sentCount = notifications.filter(n => n.status === "SENT").length;
const draftCount = notifications.filter(n => n.status === "DRAFT").length;

const sendNow = (id: number) => {
  setNotifications(prev =>
    prev.map(n =>
      n.id === id
        ? { ...n, status: "SENT", sentDate: new Date().toISOString().split("T")[0] }
        : n
    )
  );
};
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notification Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
        >
          <PlusCircle size={18} />
          Create Notification
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
  <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 relative">

    {/* Close Button */}
    <button
      onClick={() => setShowForm(false)}
      className="absolute top-4 right-4 text-gray-500 hover:text-black text-lg"
    >
      ✕
    </button>

    {/* Header */}
    <div className="mb-6">
      <h2 className="text-xl font-bold">Create Notification</h2>
      <p className="text-sm text-gray-500">
        Send announcements or system alerts to users.
      </p>
    </div>

   {/* Notification Settings */}
<div className="grid grid-cols-2 gap-5 mb-6">

  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-600">
      Notification Type
    </label>
    <select
      value={formType}
      onChange={(e) =>
        setFormType(e.target.value as "ANNOUNCEMENT" | "SYSTEM")
      }
      className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
    >
      <option value="ANNOUNCEMENT">Announcement</option>
      <option value="SYSTEM">System</option>
    </select>
  </div>

  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-600">
      Priority Level
    </label>
    <select
      value={formPriority}
      onChange={(e) =>
        setFormPriority(
          e.target.value as "LOW" | "NORMAL" | "HIGH" | "URGENT"
        )
      }
      className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
    >
      <option value="LOW">Low</option>
      <option value="NORMAL">Normal</option>
      <option value="HIGH">High</option>
      <option value="URGENT">Urgent</option>
    </select>
  </div>

  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-600">
      Target Audience
    </label>
    <select
      value={formTarget}
      onChange={(e) =>
        setFormTarget(
          e.target.value as "ALL" | "EMPLOYEE" | "TRAINER" | "HR"
        )
      }
      className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
    >
      <option value="ALL">All Users</option>
      <option value="EMPLOYEE">Employees</option>
      <option value="TRAINER">Trainers</option>
      <option value="HR">HR</option>
    </select>
  </div>

  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-600">
      Expiration Date
    </label>
    <input
      type="date"
      value={formExpiresAt}
      onChange={(e) => setFormExpiresAt(e.target.value)}
      className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
    />
  </div>

</div>

{/* Title */}
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

{/* Message */}
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

{/* Actions */}
<div className="flex justify-between items-center border-t pt-4">

  <button
    onClick={() => setShowForm(false)}
    className="text-gray-500 hover:text-black"
  >
    Cancel
  </button>

  <div className="flex gap-3">
    <button
      onClick={() => {
        addNotification("DRAFT");
        setShowForm(false);
      }}
      className="bg-gray-200 px-4 py-2 rounded-xl hover:bg-gray-300 transition"
    >
      Save Draft
    </button>

    <button
      onClick={() => {
        addNotification("SENT");
        setShowForm(false);
      }}
      className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition"
    >
      Send Notification
    </button>
  </div>

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

{/* Search */}
<div className="mt-4">
  <input
    type="text"
    placeholder="Search notifications..."
    className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
  />
</div>

      <div className="space-y-4 mt-6">
  {filteredNotifications.map((notif) => (
    <div
      key={notif.id}
      className="bg-white rounded-2xl shadow border-l-4 border-blue-500 p-6 hover:shadow-md transition"
    >
      <div className="flex justify-between">
        {/* Left Content */}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">
              {notif.title}
            </h3>

            {/* Priority Badge */}
            <span
              className={`px-3 py-1 text-xs rounded-full ${getPriorityColor(
                notif.priority
              )}`}
            >
              {notif.priority}
            </span>
          </div>

          <p className="text-gray-600 text-sm mt-2">
            {notif.message}
          </p>

          <p className="text-xs text-gray-400 mt-3">
            Sent: {notif.sentDate} • Target: {notif.target}
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
        onClick={() => deleteNotification(notif.id)}
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
        onClick={() => sendNow(notif.id)}
        className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"
      >
        Send Now
      </button>

      <button
        onClick={() => deleteNotification(notif.id)}
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
          <b>Sent:</b> {selectedNotification.sentDate}
        </p>

        <p>
          <b>Target:</b> {selectedNotification.target}
        </p>

        <p>
          <b>Type:</b> {selectedNotification.type}
        </p>

        <p>
          <b>Recipients:</b> {selectedNotification.recipients}
        </p>

        <p>
          <b>Read:</b> {selectedNotification.readCount}
        </p>

      </div>

      <div className="mt-6">
        <p className="font-medium">Message</p>
        <p className="text-gray-600 mt-1">
          {selectedNotification.message}
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