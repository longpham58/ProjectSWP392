import { useState, useMemo, useEffect } from "react";
import { useAdminStore } from "../../stores/admin.store";
import { Search, RefreshCw, Star, MessageSquare, AlertTriangle, User, Mail, Calendar, Loader2, FileText } from "lucide-react";

type RatingFilter = "ALL" | "5" | "4" | "3" | "2" | "1";

export default function AdminSystemFeedbackPage() {
  const { feedbackList, fetchAllFeedback, loading, error } = useAdminStore();
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("ALL");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Fetch feedback on mount
  useEffect(() => {
    fetchAllFeedback();
  }, [fetchAllFeedback]);

  // Determine status based on overall rating
  const getStatus = (rating?: number): string => {
    if (!rating) return "NEW";
    if (rating >= 4) return "POSITIVE";
    if (rating >= 3) return "NEUTRAL";
    return "NEGATIVE";
  };

  // Filter feedback
  const filteredFeedback = useMemo(() => {
    return feedbackList.filter((fb) => {
      const matchesRating =
        ratingFilter === "ALL" ||
        (fb.overallRating && fb.overallRating.toString() === ratingFilter);

      const matchesSearch =
        search === "" ||
        (fb.comments?.toLowerCase().includes(search.toLowerCase())) ||
        (fb.suggestions?.toLowerCase().includes(search.toLowerCase())) ||
        (fb.userName?.toLowerCase().includes(search.toLowerCase()));

      return matchesRating && matchesSearch;
    });
  }, [feedbackList, ratingFilter, search]);

  // Pagination
  const totalPages = Math.ceil(filteredFeedback.length / ITEMS_PER_PAGE);
  const paginatedFeedback = filteredFeedback.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [ratingFilter, search]);

  // Get rating color
  const getRatingColor = (rating?: number): string => {
    if (!rating) return "bg-gray-400";
    if (rating >= 5) return "bg-gradient-to-br from-green-400 to-green-500";
    if (rating >= 4) return "bg-gradient-to-br from-blue-400 to-blue-500";
    if (rating >= 3) return "bg-gradient-to-br from-yellow-400 to-yellow-500";
    return "bg-gradient-to-br from-red-400 to-red-500";
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "POSITIVE":
        return "bg-green-100 text-green-700";
      case "NEUTRAL":
        return "bg-yellow-100 text-yellow-700";
      case "NEGATIVE":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // KPI stats
  const total = feedbackList.length;
  const positive = feedbackList.filter(fb => fb.overallRating && fb.overallRating >= 4).length;
  const neutral = feedbackList.filter(fb => fb.overallRating && fb.overallRating === 3).length;
  const negative = feedbackList.filter(fb => fb.overallRating && fb.overallRating < 3).length;

  const kpis = [
    { title: "Total Feedback", value: total, icon: MessageSquare, gradient: "from-indigo-500 to-purple-400", bgGradient: "from-indigo-50 to-purple-50" },
    { title: "Positive", value: positive, icon: Star, gradient: "from-green-500 to-emerald-400", bgGradient: "from-green-50 to-emerald-50" },
    { title: "Neutral", value: neutral, icon: MessageSquare, gradient: "from-yellow-500 to-amber-400", bgGradient: "from-yellow-50 to-amber-50" },
    { title: "Negative", value: negative, icon: AlertTriangle, gradient: "from-red-500 to-rose-400", bgGradient: "from-red-50 to-rose-50" },
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-slate-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">System Feedback</h2>
      <p className="text-gray-500 mb-8">View and manage user feedback</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              <h2 className="text-3xl font-bold text-gray-900">{kpi.value}</h2>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 mb-6 flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search feedback..."
            className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value as RatingFilter)}
        >
          <option value="ALL">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>

        <button
          onClick={() => fetchAllFeedback()}
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

      {/* Content */}
      {!loading && !error && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Comments
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedFeedback.map((fb) => {
                  const status = getStatus(fb.overallRating);
                  return (
                    <tr key={fb.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-10 h-10 rounded-full ${getRatingColor(
                              fb.overallRating
                            )} flex items-center justify-center text-white text-sm font-bold shadow-sm`}
                          >
                            {fb.overallRating || "-"}
                          </span>
                          <div className="text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Star size={10} className="text-yellow-500" />
                              Course: {fb.courseRating || "-"}
                            </div>
                            <div className="flex items-center gap-1">
                              <User size={10} />
                              Trainer: {fb.trainerRating || "-"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-gray-900">
                            {fb.type?.replace(/_/g, ' ') || 'COURSE FEEDBACK'}
                          </span>
                          {fb.isViolation && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] rounded uppercase font-bold w-fit flex items-center gap-1">
                              <AlertTriangle size={10} />
                              Report
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {fb.isAnonymous ? (
                          <span className="text-gray-500 italic flex items-center gap-1">
                            <User size={14} />
                            Anonymous
                          </span>
                        ) : (
                          <div>
                            <div className="font-medium text-sm text-gray-900 flex items-center gap-1">
                              <User size={14} className="text-gray-400" />
                              {fb.userName || "Unknown"}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail size={10} />
                              {fb.userEmail}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate" title={fb.comments}>
                          {fb.comments || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1.5 text-xs font-medium rounded-full ${getStatusColor(
                            fb.status || status
                          )}`}
                        >
                          {fb.status || status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-1">
                        <Calendar size={14} />
                        {fb.submittedAt
                          ? new Date(fb.submittedAt).toLocaleDateString('vi-VN')
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {paginatedFeedback.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              <FileText size={48} className="mx-auto text-gray-300 mb-2" />
              <p>No feedback found.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredFeedback.length)} of {filteredFeedback.length} results
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
      )}
    </div>
  );
}
