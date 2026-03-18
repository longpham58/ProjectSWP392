import { useState, useMemo, useEffect } from "react";
import { useAdminStore } from "../../stores/admin.store";

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
    if (rating >= 5) return "bg-green-500";
    if (rating >= 4) return "bg-blue-500";
    if (rating >= 3) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "POSITIVE":
        return "bg-green-100 text-green-800";
      case "NEUTRAL":
        return "bg-yellow-100 text-yellow-800";
      case "NEGATIVE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">System Feedback</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        {/* Search */}
        <input
          type="text"
          placeholder="Search feedback..."
          className="border rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Rating Filter */}
        <select
          className="border rounded-lg px-4 py-2"
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

        {/* Refresh Button */}
        <button
          onClick={() => fetchAllFeedback()}
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
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Suggestions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedFeedback.map((fb) => {
                  const status = getStatus(fb.overallRating);
                  return (
                    <tr key={fb.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span
                            className={`w-8 h-8 rounded-full ${getRatingColor(
                              fb.overallRating
                            )} flex items-center justify-center text-white text-sm font-bold`}
                          >
                            {fb.overallRating || "-"}
                          </span>
                          <div className="text-xs text-gray-500">
                            <div>Course: {fb.courseRating || "-"}</div>
                            <div>Trainer: {fb.trainerRating || "-"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {fb.isAnonymous ? (
                          <span className="text-gray-500 italic">Anonymous</span>
                        ) : (
                          <div>
                            <div className="font-medium">{fb.userName || "Unknown"}</div>
                            <div className="text-xs text-gray-500">{fb.userEmail}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {fb.comments || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {fb.suggestions || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                        {fb.wouldRecommend !== undefined && (
                          <div className="text-xs text-gray-500 mt-1">
                            {fb.wouldRecommend ? "✓ Would recommend" : "✗ Would not recommend"}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {fb.submittedAt
                          ? new Date(fb.submittedAt).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {paginatedFeedback.length === 0 && (
            <div className="text-center text-gray-500 py-8">No feedback found.</div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 py-4 border-t">
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
