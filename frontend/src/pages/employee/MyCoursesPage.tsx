import { useState, useEffect } from 'react';
import CourseCard from '../../components/employee/CourseCard';
import { CourseCardSkeleton } from '../../components/common/LoadingSpinner';
import { NoCoursesFound } from '../../components/common/EmptyState';
import { useCourseStore } from '../../stores/course.store';
import { useAuthStore } from '../../stores/auth.store';

type SortOption = 'newest' | 'oldest' | 'progress' | 'name';
type ViewMode = 'grid' | 'list';

export default function MyCoursesPage() {
  const { courses, fetchMyCourses, loading } = useCourseStore();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<'all' | 'ACTIVE' | 'DRAFT' | 'ARCHIVED'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Fetch courses from API
  useEffect(() => {
    fetchMyCourses(user?.id);
  }, [fetchMyCourses, user]);

  // Filter courses
  let filteredCourses = courses.filter(course => {
    const matchesFilter = filter === 'all' || course.status === filter;
    const matchesSearch = (course.title || course.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Sort courses
  filteredCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.startDate || b.created_at).getTime() - new Date(a.startDate || a.created_at).getTime();
      case 'oldest':
        return new Date(a.startDate || a.created_at).getTime() - new Date(b.startDate || b.created_at).getTime();
      case 'progress':
        return (b.progress || 0) - (a.progress || 0);
      case 'name':
        return (a.title || a.name).localeCompare(b.title || b.name);
      default:
        return 0;
    }
  });

  // Statistics
  const activeCourses = courses.filter(c => c.status === 'ACTIVE');
  const draftCourses = courses.filter(c => c.status === 'DRAFT');
  const archivedCourses = courses.filter(c => c.status === 'ARCHIVED');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Khóa học của tôi</h1>
        <p className="text-gray-600">Các khóa học được phân công bởi cấp trên</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-gray-600 text-sm font-medium mb-1">Tổng số khóa</div>
          <div className="text-3xl font-bold text-blue-700">{courses.length}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-green-600 text-sm font-medium mb-1">Đang hoạt động</div>
          <div className="text-3xl font-bold text-green-700">{activeCourses.length}</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-blue-600 text-sm font-medium mb-1">Nháp</div>
          <div className="text-3xl font-bold text-blue-700">{draftCourses.length}</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-gray-600 text-sm font-medium mb-1">Đã lưu trữ</div>
          <div className="text-3xl font-bold text-gray-700">{archivedCourses.length}</div>
        </div>
      </div>

      {/* Search, Filter, Sort, and View Toggle */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Tìm kiếm khóa học..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Status Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter('ACTIVE')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'ACTIVE' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Đang hoạt động
            </button>
            <button
              onClick={() => setFilter('DRAFT')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'DRAFT' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Nháp
            </button>
            <button
              onClick={() => setFilter('ARCHIVED')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'ARCHIVED' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Đã lưu trữ
            </button>
          </div>

          {/* Sort and View Controls */}
          <div className="flex gap-2 items-center">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="progress">Tiến độ</option>
              <option value="name">Tên A-Z</option>
            </select>

            {/* View Toggle */}
            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                title="Grid view"
              >
                ⊞
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                title="List view"
              >
                ☰
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Course Grid/List */}
      {loading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          <CourseCardSkeleton />
          <CourseCardSkeleton />
          <CourseCardSkeleton />
          <CourseCardSkeleton />
          <CourseCardSkeleton />
          <CourseCardSkeleton />
        </div>
      ) : filteredCourses.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCourses.map(course => (
              <CourseCard key={course.id} course={course} viewMode="list" />
            ))}
          </div>
        )
      ) : (
        <NoCoursesFound />
      )}
    </div>
  );
}
