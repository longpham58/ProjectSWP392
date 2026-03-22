import { useState, useMemo, useEffect } from "react";
import { useAdminStore } from "../../stores/admin.store";
import { Search, RefreshCw, Bell, UserPlus, BookOpen, Award, ClipboardCheck, Calendar, Clock, Loader2, Activity } from "lucide-react";

// Type for recent activity from backend
interface RecentActivity {
  description: string;
  timeAgo: string;
  count?: number;
  timestamp?: number; // Unix timestamp for sorting
}

type ActionType = "All" | "notification" | "enrollment" | "course" | "user" | "certificate" | "quiz" | "session";

const ITEMS_PER_PAGE = 6;

export default function SystemActivitiesPage() {
  const { dashboardStats, fetchDashboardStats, loading, error } = useAdminStore();
  
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("All");
  const [dateFilter, setDateFilter] = useState<"All" | "7days" | "30days">("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch data on mount
  useEffect(() => {
    if (!dashboardStats) {
      fetchDashboardStats();
    }
  }, [dashboardStats, fetchDashboardStats]);

  const activities: RecentActivity[] = dashboardStats?.recentActivities || [];

  // Determine activity type from description for filtering and color coding
  const getActivityType = (description: string): string => {
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes("notification") || lowerDesc.includes("sent")) {
      return "notification";
    }
    if (lowerDesc.includes("enrollment") || lowerDesc.includes("enrolled")) {
      return "enrollment";
    }
    if (lowerDesc.includes("course")) {
      return "course";
    }
    if (lowerDesc.includes("user") || lowerDesc.includes("register")) {
      return "user";
    }
    if (lowerDesc.includes("certificate")) {
      return "certificate";
    }
    if (lowerDesc.includes("quiz") || lowerDesc.includes("attempt")) {
      return "quiz";
    }
    if (lowerDesc.includes("session") || lowerDesc.includes("class")) {
      return "session";
    }
    return "default";
  };

  // Get icon based on activity type
  const getActivityIcon = (description: string) => {
    const type = getActivityType(description);
    switch (type) {
      case "notification":
        return Bell;
      case "enrollment":
        return UserPlus;
      case "course":
        return BookOpen;
      case "user":
        return UserPlus;
      case "certificate":
        return Award;
      case "quiz":
        return ClipboardCheck;
      case "session":
        return Calendar;
      default:
        return Activity;
    }
  };

  // Get color based on activity type
  const getActivityColor = (description: string): string => {
    const type = getActivityType(description);
    switch (type) {
      case "notification":
        return "from-blue-500 to-cyan-400";
      case "enrollment":
        return "from-green-500 to-emerald-400";
      case "course":
        return "from-purple-500 to-pink-400";
      case "user":
        return "from-orange-500 to-amber-400";
      case "certificate":
        return "from-yellow-500 to-amber-400";
      case "quiz":
        return "from-red-500 to-rose-400";
      case "session":
        return "from-indigo-500 to-purple-400";
      default:
        return "from-gray-500 to-slate-400";
    }
  };

  // Add timestamp to activities
  const activitiesWithTimestamp: RecentActivity[] = useMemo(() => {
    return activities.map((activity, index) => ({
      ...activity,
      timestamp: activity.timestamp || Date.now() - index * 60000,
    }));
  }, [activities]);

  // Filtering Logic
  const filteredActivities = useMemo(() => {
    const filtered = activitiesWithTimestamp.filter((activity) => {
      const matchesSearch =
        search === "" ||
        activity.description.toLowerCase().includes(search.toLowerCase());

      const matchesAction =
        actionFilter === "All" || getActivityType(activity.description) === actionFilter;

      const matchesDate = (() => {
        if (dateFilter === "All") return true;
        
        const timeAgo = activity.timeAgo.toLowerCase();
        
        if (dateFilter === "7days") {
          if (timeAgo.includes("hour") || timeAgo.includes("minute")) return true;
          if (timeAgo.includes("day") && !timeAgo.includes("week")) {
            const days = parseInt(timeAgo.match(/\d+/)?.[0] || "0");
            return days <= 7;
          }
          return false;
        }
        
        if (dateFilter === "30days") {
          if (timeAgo.includes("hour") || timeAgo.includes("minute")) return true;
          if (timeAgo.includes("day")) {
            const days = parseInt(timeAgo.match(/\d+/)?.[0] || "0");
            return days <= 30;
          }
          if (timeAgo.includes("week")) return true;
          return false;
        }
        
        return true;
      })();

      return matchesSearch && matchesAction && matchesDate;
    });
    
    return filtered.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [activitiesWithTimestamp, search, actionFilter, dateFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE);

  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, actionFilter, dateFilter]);

  // Handle refresh
  const handleRefresh = () => {
    fetchDashboardStats();
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-slate-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">System Activities</h2>
      <p className="text-gray-500 mb-8">Track recent system activities and events</p>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 mb-6 flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search activities..."
            className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        >
          <option value="All">All Types</option>
          <option value="notification">Notifications</option>
          <option value="enrollment">Enrollments</option>
          <option value="course">Courses</option>
          <option value="user">Users</option>
          <option value="certificate">Certificates</option>
          <option value="quiz">Quizzes</option>
          <option value="session">Sessions</option>
        </select>

        <select
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value as "All" | "7days" | "30days")}
        >
          <option value="All">All Time</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
        </select>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      {/* Activities Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedActivities.map((activity, index) => {
            const Icon = getActivityIcon(activity.description);
            const colorClass = getActivityColor(activity.description);
            
            return (
              <div 
                key={index}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 p-5"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClass} flex-shrink-0`}>
                    <Icon className="text-white" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <Clock size={12} />
                      <span>{activity.timeAgo}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && paginatedActivities.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <Activity size={48} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500">No activities found</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-xl shadow-sm">
          <p className="text-sm text-gray-600">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredActivities.length)} of {filteredActivities.length} activities
          </p>

          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
