import { useState, useMemo, useEffect } from "react";
import { useAdminStore } from "../../stores/admin.store";

// Type for recent activity from backend
interface RecentActivity {
  description: string;
  timeAgo: string;
  count?: number;
}

type ActionType = "All" | "notification" | "enrollment" | "course" | "user" | "certificate" | "quiz" | "session";

const ITEMS_PER_PAGE = 6;

export default function AuditLogsPage() {
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

  // Get color based on activity type
  const getActivityColor = (description: string): string => {
    const type = getActivityType(description);
    switch (type) {
      case "notification":
        return "bg-blue-500";
      case "enrollment":
        return "bg-green-500";
      case "course":
        return "bg-purple-500";
      case "user":
        return "bg-orange-500";
      case "certificate":
        return "bg-yellow-500";
      case "quiz":
        return "bg-red-500";
      case "session":
        return "bg-indigo-500";
      default:
        return "bg-gray-500";
    }
  };

  // Get icon based on activity type
  const getActivityIcon = (description: string): string => {
    const type = getActivityType(description);
    switch (type) {
      case "notification":
        return "📢";
      case "enrollment":
        return "📝";
      case "course":
        return "📚";
      case "user":
        return "👤";
      case "certificate":
        return "🏆";
      case "quiz":
        return "📋";
      case "session":
        return "🗓️";
      default:
        return "📌";
    }
  };

  // Filtering Logic
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesSearch =
        search === "" ||
        activity.description.toLowerCase().includes(search.toLowerCase());

      const matchesAction =
        actionFilter === "All" || getActivityType(activity.description) === actionFilter;

      const matchesDate = (() => {
        if (dateFilter === "All") return true;
        
        // Parse timeAgo to determine if it's within the date range
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
  }, [activities, search, actionFilter, dateFilter]);

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
    <div>
      <h2 className="text-2xl font-bold mb-6">System Activities</h2>

      {/* Filters Section */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        {/* Search */}
        <input
          type="text"
          placeholder="Search activities..."
          className="border rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Action Type Filter */}
        <select
          className="border rounded-lg px-4 py-2"
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

        {/* Date Filter */}
        <select
          className="border rounded-lg px-4 py-2"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value as "All" | "7days" | "30days")}
        >
          <option value="All">All Dates</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
        </select>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="border rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {loading ? "Loading..." : "🔄 Refresh"}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-semibold mb-6">
            Recent Activity ({filteredActivities.length})
          </h3>

          <div className="space-y-4">
            {paginatedActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Icon */}
                <div className="text-2xl">{getActivityIcon(activity.description)}</div>

                {/* Timeline Dot */}
                <div
                  className={`w-3 h-3 rounded-full ${getActivityColor(activity.description)} mt-2`}
                />

                {/* Content */}
                <div className="flex-1">
                  <p className="text-sm text-gray-800 font-medium">
                    {activity.description}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500">{activity.timeAgo}</p>
                    {activity.count && activity.count > 1 && (
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                        {activity.count} events
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {paginatedActivities.length === 0 && (
              <div className="text-center text-gray-500 py-6">
                No activities found.
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>

              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
