import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import CompletionTrend from "./components/CompletionTrend";
type MonthlyData = {
  month: string;
  completion: number;
};

export default function AdminDashboard() {
  

  
 // 🔹 Completion Trend
  const monthlyData: MonthlyData[] = [
    { month: "Jan", completion: 65 },
    { month: "Feb", completion: 70 },
    { month: "Mar", completion: 72 },
    { month: "Apr", completion: 75 },
    { month: "May", completion: 78 },
    { month: "Jun", completion: 82 },
  ];

  // 🥧 Role distribution mock
  const roleData = [
    { name: "Admin", value: 3 },
    { name: "HR", value: 5 },
    { name: "Trainer", value: 12 },
    { name: "Employee", value: 108 },
  ];

  const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#9333ea"];

  const kpis = [
    { title: "Total Users", value: 128 },
    { title: "Active Users", value: 110 },
    { title: "Locked Accounts", value: 5 },
    { title: "Open Feedback", value: 12 },
  ];

  const activities = [
    "HR created 'Advanced React' course",
    "12 employees enrolled in Compliance",
    "5 certificates issued",
    "3 feedback reports submitted",
    "Trainer uploaded new materials",
    "2 users marked inactive",
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      {/* KPI CARDS */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.title} className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-500 text-sm">{kpi.title}</p>
            <h3 className="text-2xl font-bold mt-2">{kpi.value}</h3>
          </div>
        ))}
      </div>
{/* TRAINING TREND - FULL WIDTH */}
<div className="bg-white p-6 rounded-2xl shadow mb-8">
  <CompletionTrend monthlyData={monthlyData} />
</div>


{/* RECENT ACTIVITY + ROLE DISTRIBUTION */}
<div className="grid grid-cols-3 gap-6 mb-8">
  
  {/* Recent Activity (2 columns) */}
  <div className="col-span-2 bg-white p-6 rounded-2xl shadow">
    <h3 className="text-lg font-semibold mb-4">
      Recent System Activity
    </h3>

    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-center gap-4">
          <div className="w-3 h-3 bg-gray-400 rounded-full" />
          <p className="text-sm text-gray-700 flex-1">
            {activity}
          </p>
          <span className="text-xs text-gray-400">
            2 hours ago
          </span>
        </div>
      ))}
    </div>
  </div>

  {/* Role Distribution (Right Side) */}
  <div className="bg-white p-6 rounded-2xl shadow">
    <h3 className="text-lg font-semibold mb-4">
      Role Distribution
    </h3>

    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={roleData}
          dataKey="value"
          nameKey="name"
          outerRadius={90}
          label
        >
          {roleData.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
</div>

      {/* ALERTS + FEEDBACK */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-lg font-semibold mb-4">
            Security Alerts
          </h3>
          <p className="text-sm text-gray-600">
            2 accounts locked due to failed login attempts.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-lg font-semibold mb-4">
            Open Feedback Tickets
          </h3>
          <p className="text-sm text-gray-600">
            12 pending feedback reports awaiting review.
          </p>
        </div>
      </div>
      <div style={{ height: "100px" }}></div>
    </div>
  );
}