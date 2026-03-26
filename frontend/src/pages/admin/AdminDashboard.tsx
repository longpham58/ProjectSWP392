import { useState, useEffect } from "react";
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
import { adminApi, AdminDashboardStats, MonthlyCompletion, RecentActivity } from "../../api/admin.api";
import { Users, BookOpen, FolderKanban, Activity, TrendingUp, Shield, MessageSquare, Clock } from "lucide-react";

type ChartData = {
  month: string;
  completion: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminApi.getDashboardStats();
        if (res.data?.data) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Course Completion Trend from API
  const monthlyData: ChartData[] = stats?.monthlyCompletion
    ? stats.monthlyCompletion.map((item: MonthlyCompletion) => ({
        month: item.month,
        completion: item.completions,
      }))
    : [
        { month: "Jan", completion: 0 },
        { month: "Feb", completion: 0 },
        { month: "Mar", completion: 0 },
        { month: "Apr", completion: 0 },
        { month: "May", completion: 0 },
        { month: "Jun", completion: 0 },
      ];

  // Role distribution from API
  const roleData = stats?.roleDistribution
    ? Object.entries(stats.roleDistribution).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899"];

  // Recent activities from API (limited to 5)
  const activities = stats?.recentActivities
    ? stats.recentActivities.slice(0, 6).map((activity: RecentActivity) => ({
        description: activity.description,
        timeAgo: activity.timeAgo,
      }))
    : [];

  // Security alerts from API
  const securityAlerts = stats?.securityAlerts ?? 0;
  const failedLogins = stats?.failedLoginAttempts ?? 0;

  const kpiCards = [
    {
      title: "Tổng người dùng",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      gradient: "from-violet-500 to-purple-600",
      bgColor: "bg-violet-50",
      iconColor: "text-violet-600",
    },
    {
      title: "Người dùng hoạt động",
      value: stats?.activeUsers ?? 0,
      icon: Activity,
      gradient: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Tổng khóa học",
      value: stats?.totalCourses ?? 0,
      icon: BookOpen,
      gradient: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Tổng lớp học",
      value: stats?.totalClasses ?? 0,
      icon: FolderKanban,
      gradient: "from-orange-500 to-amber-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tổng quan Dashboard</h1>
        <p className="text-gray-500 mt-1">Chào mừng trở lại! Đây là những gì đang xảy ra với hệ thống đào tạo của bạn.</p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading ? (
          <div className="col-span-4 flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          kpiCards.map((kpi) => (
            <div
              key={kpi.title}
              className="relative overflow-hidden bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group"
            >
              {/* Gradient accent */}
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${kpi.gradient}`}></div>
              
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${kpi.bgColor}`}>
                    <kpi.icon className={`w-6 h-6 ${kpi.iconColor}`} />
                  </div>
                  <TrendingUp className="w-5 h-5 text-gray-300 group-hover:text-green-500 transition-colors" />
                </div>
                
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{kpi.value.toLocaleString()}</p>
                </div>
              </div>
              
              {/* Decorative circles */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gray-50 rounded-full opacity-50"></div>
            </div>
          ))
        )}
      </div>

      {/* COURSE COMPLETION TREND - FULL WIDTH */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Xu hướng hoàn thành khóa học          </h3>
        </div>
        <div className="p-6">
          <CompletionTrend monthlyData={monthlyData} />
        </div>
      </div>

      {/* RECENT ACTIVITY + ROLE DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Hoạt động hệ thống gần đây
            </h3>
          </div>
          <div className="p-6">
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-2 h-2 mt-2 bg-indigo-500 rounded-full flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 font-medium">
                        {activity.description}
                      </p>
                      <span className="text-xs text-gray-400 mt-1 block">
                        {activity.timeAgo}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Không có hoạt động gần đây</p>
              </div>
            )}
          </div>
        </div>

        {/* Role Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Phân bổ vai trò
            </h3>
          </div>
          <div className="p-6">
            {roleData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={roleData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    innerRadius={50}
                    paddingAngle={4}
                  >
                    {roleData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Không có dữ liệu vai trò</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECURITY + FEEDBACK */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              Trạng thái bảo mật
            </h3>
          </div>
          <div className="p-6">
            {securityAlerts > 0 || failedLogins > 0 ? (
              <div className="space-y-3">
                {securityAlerts > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                    <Shield className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-red-700 font-medium">
                      {securityAlerts} cảnh báo bảo mật cần xử lý
                    </span>
                  </div>
                )}
                {failedLogins > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                    <Activity className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-orange-700 font-medium">
                      {failedLogins} lần đăng nhập thất bại được phát hiện
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                <Shield className="w-6 h-6 text-green-500" />
                <span className="text-sm text-green-700 font-medium">
                  Tất cả hệ thống an toàn. Không có cảnh báo nào.
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              Phiếu phản hồi
            </h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <div>
                <p className="text-sm text-gray-600">Phản hồi hệ thống đang mở</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.openFeedback ?? 0}</p>
              </div>
              <MessageSquare className="w-10 h-10 text-indigo-400" />
            </div>
            <p className="text-sm text-gray-500 mt-3">
              phiếu phản hồi hệ thống đang chờ xem xét
            </p>
          </div>
        </div>
      </div>
      
      <div className="h-8"></div>
    </div>
  );
}
