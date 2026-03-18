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

  // Admin-focused KPIs (Training System)
  const kpis = stats
    ? [
        { title: "Total Users", value: stats.totalUsers },
        { title: "Active Users", value: stats.activeUsers },
        { title: "Total Courses", value: stats.totalCourses },
        { title: "Active Courses", value: stats.activeCourses },
      ]
    : [
        { title: "Total Users", value: 0 },
        { title: "Active Users", value: 0 },
        { title: "Total Courses", value: 0 },
        { title: "Active Courses", value: 0 },
      ];

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

  const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#9333ea"];

  // Recent activities from API
  const activities = stats?.recentActivities
    ? stats.recentActivities.map((activity: RecentActivity) => ({
        description: activity.description,
        timeAgo: activity.timeAgo,
      }))
    : [];

  // Security alerts from API
  const securityAlerts = stats?.securityAlerts ?? 0;
  const failedLogins = stats?.failedLoginAttempts ?? 0;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      {/* KPI CARDS */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {loading ? (
          <div className="col-span-4 text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          kpis.map((kpi) => (
            <div key={kpi.title} className="bg-white p-6 rounded-2xl shadow">
              <p className="text-gray-500 text-sm">{kpi.title}</p>
              <h3 className="text-2xl font-bold mt-2">{kpi.value}</h3>
            </div>
          ))
        )}
      </div>
{/* COURSE COMPLETION TREND - FULL WIDTH */}
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
      {activities.length > 0 ? (
        activities.map((activity, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="w-3 h-3 bg-gray-400 rounded-full" />
            <p className="text-sm text-gray-700 flex-1">
              {activity.description}
            </p>
            <span className="text-xs text-gray-400">
              {activity.timeAgo}
            </span>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-500">No recent activities</p>
      )}
    </div>
  </div>

  {/* Role Distribution (Right Side) */}
  <div className="bg-white p-6 rounded-2xl shadow">
    <h3 className="text-lg font-semibold mb-4">
      Role Distribution
    </h3>

    {roleData.length > 0 ? (
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
    ) : (
      <p className="text-sm text-gray-500 text-center py-8">No role data available</p>
    )}
  </div>
</div>

      {/* SECURITY + FEEDBACK */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-lg font-semibold mb-4">
            Security Alerts
          </h3>
          <p className="text-sm text-gray-600">
            {securityAlerts > 0
              ? `${securityAlerts} security alert(s) requiring attention.`
              : "No security alerts at this time."}
          </p>
          {failedLogins > 0 && (
            <p className="text-sm text-red-600 mt-2">
              {failedLogins} failed login attempt(s) detected.
            </p>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="text-lg font-semibold mb-4">
            Open System Feedback Tickets
          </h3>
          <p className="text-sm text-gray-600">
            {stats?.openFeedback ?? 0} pending system feedback tickets awaiting review.
          </p>
        </div>
      </div>
      <div style={{ height: "100px" }}></div>
    </div>
  );
}