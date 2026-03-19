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
    { title: "Active Users (7d)", value: analytics?.activeUsers7d || 0 },
    { title: "Enrollment Growth", value: (analytics?.enrollmentGrowth || 0) + "%" },
    { title: "Completion Rate", value: (analytics?.completionRate || 0) + "%" },
    { title: "Total Enrollments", value: analytics?.totalEnrollments || 0 },
    { title: "Security Alerts", value: analytics?.securityAlerts || 0 },
  ];

  // 📊 Training trend data from analytics API
  const getTrendData = () => {
    if (!analytics?.monthlyCompletion) {
      return [
        { month: "Jan", completion: 0, attendance: 0, enrollment: 0 },
        { month: "Feb", completion: 0, attendance: 0, enrollment: 0 },
        { month: "Mar", completion: 0, attendance: 0, enrollment: 0 },
        { month: "Apr", completion: 0, attendance: 0, enrollment: 0 },
        { month: "May", completion: 0, attendance: 0, enrollment: 0 },
        { month: "Jun", completion: 0, attendance: 0, enrollment: 0 },
      ];
    }
    
    return analytics.monthlyCompletion.map((item, index) => ({
      month: item.month,
      completion: item.completions || 0,
      attendance: analytics.monthlyAttendance?.[index]?.completions || 0,
      enrollment: analytics.monthlyEnrollment?.[index]?.completions || 0,
    }));
  };
  
  const trendData = getTrendData();

  // 🔹 Department Completion from analytics API
  const departmentData: DepartmentData[] = analytics?.departmentCompletion?.map((dept) => ({
    name: dept.name,
    completion: dept.completionRate,
  })) || [];

  // 🔹 Course Completion from analytics API (top 10)
  const courseData: CourseData[] = analytics?.courseCompletion?.map((course) => ({
    name: course.name,
    completion: course.completionRate,
  })) || [];

  // 🔹 Training Hours from analytics API
  const trainingHoursData = analytics?.trainingHours?.map((item) => ({
    month: item.month,
    totalHours: item.totalHours || 0,
    avgHours: item.avgHoursPerUser || 0,
  })) || [];

  // 🔹 Employee Performance Distribution from analytics API
  const performanceData = analytics?.employeePerformance?.map((item) => ({
    level: item.level,
    value: item.value,
  })) || [
    { level: "High (80-100%)", value: 0 },
    { level: "Medium (60-79%)", value: 0 },
    { level: "Low (<60%)", value: 0 },
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

