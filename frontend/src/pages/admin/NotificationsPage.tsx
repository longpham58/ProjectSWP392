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
  },
];

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] =
    useState<AdminNotification[]>(dummyNotifications);

  const [showForm, setShowForm] = useState(false);

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
        <div className="bg-white shadow rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Create New Notification</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <select className="border rounded-lg px-3 py-2">
              <option value="ANNOUNCEMENT">Announcement</option>
              <option value="SYSTEM">System</option>
            </select>

            <select className="border rounded-lg px-3 py-2">
              <option value="LOW">Low Priority</option>
              <option value="NORMAL">Normal Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="URGENT">Urgent Priority</option>
            </select>

            <select className="border rounded-lg px-3 py-2">
              <option value="ALL">All Users</option>
              <option value="EMPLOYEE">Employees</option>
              <option value="TRAINER">Trainers</option>
              <option value="HR">HR</option>
            </select>

            <input
              type="date"
              className="border rounded-lg px-3 py-2"
              placeholder="Expiration Date"
            />
          </div>

          <input
            type="text"
            placeholder="Notification Title"
            className="w-full border rounded-lg px-3 py-2"
          />

          <textarea
            placeholder="Notification Message"
            rows={4}
            className="w-full border rounded-lg px-3 py-2"
          />

          <button className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition">
            Send Notification
          </button>
        </div>
      )}
      {/* Tabs */}
<div className="flex gap-6 border-b pb-2">
  {["Inbox", "Sent", "Draft"].map((tab, index) => (
    <button
      key={index}
      className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1"
    >
      {tab}
    </button>
  ))}
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
  {notifications.map((notif) => (
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

        {/* Right Actions */}
        <div className="flex flex-col gap-2 ml-6">
          <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm">
            View Details
          </button>
          <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm">
            Mark as Read
          </button>
          <button className="bg-red-100 text-red-600 hover:bg-red-200 px-4 py-2 rounded-lg text-sm">
            Delete
          </button>
        </div>
      </div>
    </div>
  ))}
</div>
    </div>
  );
}