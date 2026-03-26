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
import { Loader2, TrendingUp, Users, BookOpen, Award, AlertTriangle } from "lucide-react";

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
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  // Error state
  if (error && !analytics) {
    return (
      <div className="p-6 bg-white rounded-2xl shadow-sm border border-red-100">
        <p className="text-red-500">Failed to load analytics data: {error}</p>
        <button
          onClick={() => fetchAnalytics()}
          className="mt-4 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  // KPI Values from analytics API
  const kpis = [
    { 
      title: "Người dùng hoạt động (7 ngày)", 
      value: analytics?.activeUsers7d || 0,
      icon: Users,
      gradient: "from-blue-500 to-cyan-400",
      bgGradient: "from-blue-50 to-cyan-50"
    },
    { 
      title: "Tăng trưởng đăng ký", 
      value: (analytics?.enrollmentGrowth || 0) + "%",
      icon: TrendingUp,
      gradient: "from-green-500 to-emerald-400",
      bgGradient: "from-green-50 to-emerald-50"
    },
    { 
      title: "Tỷ lệ hoàn thành", 
      value: (analytics?.completionRate || 0) + "%",
      icon: Award,
      gradient: "from-purple-500 to-pink-400",
      bgGradient: "from-purple-50 to-pink-50"
    },
    { 
      title: "Tổng đăng ký", 
      value: analytics?.totalEnrollments || 0,
      icon: BookOpen,
      gradient: "from-amber-500 to-orange-400",
      bgGradient: "from-amber-50 to-orange-50"
    },
    { 
      title: "Cảnh báo bảo mật", 
      value: analytics?.securityAlerts || 0,
      icon: AlertTriangle,
      gradient: "from-red-500 to-rose-400",
      bgGradient: "from-red-50 to-rose-50"
    },
  ];

  // Training trend data from analytics API
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

  // Department Completion from analytics API
  const departmentData: DepartmentData[] = analytics?.departmentCompletion?.map((dept) => ({
    name: dept.name,
    completion: dept.completionRate,
  })) || [];

  // Course Completion from analytics API (top 10)
  const courseData: CourseData[] = analytics?.courseCompletion?.map((course) => ({
    name: course.name,
    completion: course.completionRate,
  })) || [];

  // Training Hours from analytics API
  const trainingHoursData = analytics?.trainingHours?.map((item) => ({
    month: item.month,
    totalHours: item.totalHours || 0,
    avgHours: item.avgHoursPerUser || 0,
  })) || [];

  // Employee Performance Distribution from analytics API
  const performanceData = analytics?.employeePerformance?.map((item) => ({
    level: item.level,
    value: item.value,
  })) || [
    { level: "High (80-100%)", value: 0 },
    { level: "Medium (60-79%)", value: 0 },
    { level: "Low (<60%)", value: 0 },
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Tổng quan phân tích</h2>
        <p className="text-gray-500 mt-1">Theo dõi hiệu suất đào tạo và các chỉ số tương tác</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={kpi.title} 
              className={`bg-gradient-to-br ${kpi.bgGradient} p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-white/50`}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-600 text-sm font-medium">{kpi.title}</p>
                <div className={`p-2 rounded-xl bg-gradient-to-br ${kpi.gradient}`}>
                  <Icon className="text-white" size={18} />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{kpi.value}</h3>
            </div>
          );
        })}
      </div>

      {/* Completion Trend */}
      <div className="mb-8">
        <TrainingPerformanceTrend
          trendData={trendData}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
      
      {/* Department & Course Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Hoàn thành theo phòng ban
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                }} 
              />
              <Bar
                dataKey="completion"
                fill="url(#barGradient)"
                radius={[6, 6, 0, 0]}
                barSize={35}
              />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
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
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 h-[320px]">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Xu hướng giờ đào tạo (6 tháng gần đây)
          </h3>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={trainingHoursData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                }} 
              />
              <Legend />

              <Line
                type="monotone"
                dataKey="totalHours"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                name="Tổng giờ"
              />

              <Line
                type="monotone"
                dataKey="avgHours"
                stroke="#16a34a"
                strokeWidth={3}
                dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                name="Giờ TB / Nhân viên"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
