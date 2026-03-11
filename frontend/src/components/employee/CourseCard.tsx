import { useNavigate } from 'react-router-dom';
import type { Course } from '../../data/mockCourses';

interface CourseCardProps {
  course: Course;
  viewMode?: 'grid' | 'list';
}

export default function CourseCard({ course, viewMode = 'grid' }: CourseCardProps) {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Sắp diễn ra';
      case 'ongoing': return 'Đang diễn ra';
      case 'completed': return 'Đã hoàn thành';
      default: return status;
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="border rounded-lg p-4 hover:shadow-lg transition-all duration-300 bg-white animate-fade-in flex gap-4">
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg">{course.title}</h3>
            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(course.status)}`}>
              {getStatusText(course.status)}
            </span>
          </div>
          
          <p className="text-gray-600 text-sm mb-3">{course.description}</p>
          
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-700 mb-3">
            <div className="flex items-center gap-2">
              <span className="font-medium">Giảng viên:</span>
              <span>{course.instructor}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Thời lượng:</span>
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Thời gian:</span>
              <span>{course.startDate ? new Date(course.startDate).toLocaleDateString('vi-VN') : 'N/A'} - {course.endDate ? new Date(course.endDate).toLocaleDateString('vi-VN') : 'N/A'}</span>
            </div>
          </div>

          {course.progress !== undefined && (
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>Tiến độ</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
              <button
                onClick={() => navigate(`/employee/course/${course.id}`)}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors whitespace-nowrap"
              >
                Xem chi tiết
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition-all duration-300 bg-white transform hover:-translate-y-1 animate-fade-in">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg">{course.title}</h3>
        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(course.status)}`}>
          {getStatusText(course.status)}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mb-3">{course.description}</p>
      
      <div className="space-y-2 text-sm text-gray-700 mb-4">
        <div className="flex items-center gap-2">
          <span className="font-medium">Giảng viên:</span>
          <span>{course.instructor}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">Thời lượng:</span>
          <span>{course.duration}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">Thời gian:</span>
          <span>{course.startDate ? new Date(course.startDate).toLocaleDateString('vi-VN') : 'N/A'} - {course.endDate ? new Date(course.endDate).toLocaleDateString('vi-VN') : 'N/A'}</span>

        </div>
      </div>

      {course.progress !== undefined && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Tiến độ</span>
            <span>{course.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>
      )}

      <button
        onClick={() => navigate(`/employee/course/${course.id}`)}
        className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
      >
        Xem chi tiết
      </button>
    </div>
  );
}
