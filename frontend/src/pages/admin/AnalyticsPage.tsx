import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { useAdminStore } from "../../stores/admin.store";
import TrainingPerformanceTrend from "./components/TrainingPerformanceTrend";
import TopCoursesChart from "./components/TopCoursesChart";
import EmployeePerformanceChart from "./components/EmployeePerformanceChart";

type DepartmentData = {
  name: string;
  completion: number;
};

type CourseData = {
  name: string;
  completion: number;
};

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<
    "completion" | "attendance" | "enrollment"
  >("completion");

  const { analytics, loading, error, fetchAnalytics } = useAdminStore();

  // Fetch analytics on mount
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Loading state
  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Error state
  if (error && !analytics) {
    return (
      <div className="p-6">
        <p className="text-red-500">Failed to load analytics data: {error}</p>
        <button
          onClick={() => fetchAnalytics()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // KPI Values from analytics API
  const kpis = [
    { title: "Total Employees", value: analytics?.totalEmployees || 0 },
    { title: "Locked Accounts", value: analytics?.lockedAccounts || 0 },
    { title: "Total Classes", value: analytics?.totalClasses || 0 },
    { title: "Total Enrollments", value: analytics?.totalEnrollments || 0 },
    { title: "Security Alerts", value: analytics?.securityAlerts || 0 },
  ];

  // 📊 Training trend data from analytics API
  const trendData = analytics?.monthlyCompletion?.map((item) => ({
    month: item.month,
    completion: item.completions || 0,
    attendance: Math.floor(Math.random() * 20) + 80, // Placeholder - not available in backend
    enrollment: Math.floor(Math.random() * 50) + 100, // Placeholder - not available in backend
  })) || [
    { month: "Jan", completion: 70, attendance: 82, enrollment: 120 },
    { month: "Feb", completion: 75, attendance: 85, enrollment: 140 },
    { month: "Mar", completion: 72, attendance: 80, enrollment: 135 },
    { month: "Apr", completion: 78, attendance: 88, enrollment: 160 },
    { month: "May", completion: 80, attendance: 90, enrollment: 170 },
    { month: "Jun", completion: 85, attendance: 92, enrollment: 180 },
  ];

  // 🔹 Department Completion from analytics API
  const departmentData: DepartmentData[] = analytics?.departmentCompletion?.map((dept) => ({
    name: dept.name,
    completion: dept.completionRate,
  })) || [
    { name: "IT", completion: 92 },
    { name: "HR", completion: 88 },
    { name: "Sales", completion: 61 },
    { name: "Marketing", completion: 74 },
  ];

  // 🔹 Course Completion from analytics API (top 10)
  const courseData: CourseData[] = analytics?.courseCompletion?.map((course) => ({
    name: course.name,
    completion: course.completionRate,
  })) || [
    { name: "Workplace Compliance 2026", completion: 96 },
    { name: "Data Security & GDPR", completion: 92 },
    { name: "Health & Safety Training", completion: 89 },
    { name: "Leadership Fundamentals", completion: 84 },
    { name: "Advanced React Development", completion: 78 },
  ];

  // 🔹 Training Hours from analytics API
  const trainingHoursData = analytics?.trainingHours?.map((item) => ({
    month: item.month,
    totalHours: item.totalHours,
    avgHours: item.avgHoursPerUser,
  })) || [
    { month: "Jan", totalHours: 420, avgHours: 3.2 },
    { month: "Feb", totalHours: 510, avgHours: 4.1 },
    { month: "Mar", totalHours: 610, avgHours: 5.0 },
    { month: "Apr", totalHours: 580, avgHours: 4.8 },
    { month: "May", totalHours: 640, avgHours: 5.3 },
    { month: "Jun", totalHours: 720, avgHours: 6.0 },
  ];

  // 🔹 Employee Performance Distribution (placeholder - not available)
  const performanceData = [
    { level: "High (80-100%)", value: 72 },
    { level: "Medium (60-79%)", value: 38 },
    { level: "Low (<60%)", value: 18 },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Analytics Overview</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.title} className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-500 text-sm">{kpi.title}</p>
            <h3 className="text-2xl font-bold mt-2">{kpi.value}</h3>
          </div>
        ))}
      </div>

      {/* Completion Trend */}
      <TrainingPerformanceTrend
        trendData={trendData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      {/* Department & Course Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-lg font-semibold mb-4">
            Completion by Department
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar
                dataKey="completion"
                fill="#3B82F6"
                radius={[6, 6, 0, 0]}
                barSize={35}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <TopCoursesChart courseData={courseData} />
      </div>
      
      {/* Employee Performance Distribution */}
      <div className="mb-8">
        <EmployeePerformanceChart data={performanceData} />
      </div>
      
      {/* Training Hours Trend from API */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow h-[320px]">
          <h3 className="text-lg font-semibold mb-4">
            Training Hours Trend (Last 6 Months)
          </h3>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={trainingHoursData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Line
                type="monotone"
                dataKey="totalHours"
                stroke="#2563eb"
                strokeWidth={3}
                name="Total Hours"
              />

              <Line
                type="monotone"
                dataKey="avgHours"
                stroke="#16a34a"
                strokeWidth={3}
                name="Avg Hours / Employee"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
