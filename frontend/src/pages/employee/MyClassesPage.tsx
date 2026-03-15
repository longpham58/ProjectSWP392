import { useState, useEffect } from 'react';
import { coursesApi, EmployeeClass } from '../../api/courses.api';

export default function MyClassesPage() {
  const [classes, setClasses] = useState<EmployeeClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await coursesApi.getMyClasses();
      if (response.data.data) {
        setClasses(response.data.data);
      }
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch classes:', err);
      setError(err?.response?.data?.message || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter(cls => 
    cls.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.classCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeClasses = classes.filter(c => c.status === 'ACTIVE');
  const inactiveClasses = classes.filter(c => c.status !== 'ACTIVE');

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg h-48 border"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Lớp học của tôi</h1>
        <p className="text-gray-600">Các lớp học bạn đã được phân công tham gia</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-gray-600 text-sm font-medium mb-1">Tổng số lớp</div>
          <div className="text-3xl font-bold text-blue-700">{classes.length}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-green-600 text-sm font-medium mb-1">Đang hoạt động</div>
          <div className="text-3xl font-bold text-green-700">{activeClasses.length}</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-gray-600 text-sm font-medium mb-1">Không hoạt động</div>
          <div className="text-3xl font-bold text-gray-700">{inactiveClasses.length}</div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm lớp học..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Classes List */}
      {filteredClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map(cls => (
            <div key={cls.classId} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    cls.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {cls.status === 'ACTIVE' ? 'Hoạt động' : cls.status}
                  </span>
                  <span className="text-xs text-gray-500">{cls.classCode}</span>
                </div>
                
                <h3 className="font-semibold text-lg mb-1">{cls.className}</h3>
                <p className="text-sm text-gray-600 mb-3">{cls.courseName}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">👨‍🏫 Giảng viên:</span>
                    <span className="font-medium">{cls.trainerName || 'Chưa phân công'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">👥 Học viên:</span>
                    <span className="font-medium">{cls.currentStudents}/{cls.maxStudents}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">📅 Tham gia:</span>
                    <span className="font-medium">
                      {cls.joinedAt ? new Date(cls.joinedAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </span>
                  </div>
                </div>

                {cls.notes && (
                  <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                    <p className="line-clamp-2">{cls.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Chưa có lớp học nào</h3>
          <p className="text-gray-500">Bạn chưa được phân công vào lớp học nào.</p>
        </div>
      )}
    </div>
  );
}
