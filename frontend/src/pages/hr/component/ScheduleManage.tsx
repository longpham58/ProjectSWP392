import React, { useEffect, useState } from 'react';
import { hrScheduleService, hrClassService } from '../../../services/api/hr';
import courseApi from '../../../api/course.api.wrapper';
import type { HRSchedule } from '../../../types/hr.types';
import type { CourseDto } from '../../../api/course.api';
import '@/assets/styles/SchedulePage.css';

type ScheduleManagePageProps = {
  onSchedulesChanged?: () => void;
};

export const ScheduleManagePage: React.FC<ScheduleManagePageProps> = ({ onSchedulesChanged }) => {
  const [schedules, setSchedules] = useState<HRSchedule[]>([]);
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [trainers, setTrainers] = useState<Array<{ username: string; fullName: string }>>([]);
  const [classes, setClasses] = useState<Array<{ classCode: string; className: string }>>([]);
  
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Form fields
  const [formData, setFormData] = useState({
    trainerUsername: '',
    courseCode: '',
    classCode: '',
    date: '',
    startTime: '',
    endTime: '',
    locationType: 'OFFLINE' as 'ONLINE' | 'OFFLINE' | 'HYBRID',
    room: '',
    meetingLink: '',
    meetingPassword: '',
    maxCapacity: 30,
    status: 'SCHEDULED',
    notes: ''
  });

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    trainer: '',
    course: '',
    class: '',
    date: '',
    status: ''
  });

  const loadSchedules = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Use the correct API endpoint
      const response = await fetch('/api/hr/schedules', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setSchedules(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to load schedules');
      }
    } catch (err: any) {
      console.error('Error loading schedules:', err);
      setError('Không thể tải danh sách lịch học: ' + err.message);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const res = await courseApi.getMyCourses();
      if (res?.success) setCourses(res.data);
    } catch (err) {
      console.error('Error loading courses:', err);
    }
  };

  const loadTrainers = async () => {
    try {
      const list = await courseApi.getTrainers();
      setTrainers(list);
    } catch (err) {
      console.error('Error loading trainers:', err);
    }
  };

  const loadClasses = async (courseId?: number) => {
    if (!courseId) { setClasses([]); return; }
    try {
      const res = await hrClassService.listByCourse(courseId);
      setClasses((res.data.data ?? []).map(c => ({ classCode: c.classCode, className: c.className ?? '' })));
    } catch (err) {
      console.error('Error loading classes:', err);
      setClasses([]);
    }
  };

  useEffect(() => {
    loadSchedules();
    loadCourses();
    loadTrainers();
  }, []);

  const resetForm = () => {
    setFormData({
      trainerUsername: '',
      courseCode: '',
      classCode: '',
      date: '',
      startTime: '',
      endTime: '',
      locationType: 'OFFLINE',
      room: '',
      meetingLink: '',
      meetingPassword: '',
      maxCapacity: 30,
      status: 'SCHEDULED',
      notes: ''
    });
    setEditingId(null);
    setError('');
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (schedule: HRSchedule) => {
    setFormData({
      trainerUsername: schedule.trainerUsername,
      courseCode: schedule.courseCode,
      classCode: schedule.classCode || '',
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      locationType: schedule.locationType || 'OFFLINE',
      room: schedule.room,
      meetingLink: schedule.meetingLink || '',
      meetingPassword: schedule.meetingPassword || '',
      maxCapacity: schedule.maxCapacity || 30,
      status: schedule.status || 'SCHEDULED',
      notes: schedule.notes || ''
    });
    const course = courses.find(c => c.code === schedule.courseCode);
    loadClasses(course?.id);
    setEditingId(String(schedule.id));
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        courseName: courses.find(c => c.code === formData.courseCode)?.name || formData.courseCode
      };

      const url = editingId ? `/api/hr/schedules/${editingId}` : '/api/hr/schedules';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Operation failed');
      }

      setModalOpen(false);
      await loadSchedules();
      onSchedulesChanged?.();
      resetForm();
    } catch (err: any) {
      console.error('Error submitting schedule:', err);
      setError(err.message || 'Không thể lưu lịch học');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lịch học này?')) return;

    try {
      const response = await fetch(`/api/hr/schedules/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Delete failed');
      }

      await loadSchedules();
      onSchedulesChanged?.();
    } catch (err: any) {
      console.error('Error deleting schedule:', err);
      setError(err.message || 'Không thể xóa lịch học');
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    if (filters.search && !schedule.courseName.toLowerCase().includes(filters.search.toLowerCase()) &&
        !schedule.courseCode.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.trainer && schedule.trainerUsername !== filters.trainer) return false;
    if (filters.course && schedule.courseCode !== filters.course) return false;
    if (filters.class && schedule.classCode !== filters.class) return false;
    if (filters.date && schedule.date !== filters.date) return false;
    if (filters.status && schedule.status !== filters.status) return false;
    return true;
  });

  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'ONGOING': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý lịch học</h1>
            <p className="text-gray-600">Tạo và quản lý lịch học cho các khóa đào tạo</p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + Tạo lịch học
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{schedules.length}</div>
            <div className="text-sm text-gray-600">Tổng lịch học</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {schedules.filter(s => s.status === 'SCHEDULED').length}
            </div>
            <div className="text-sm text-gray-600">Đã lên lịch</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">
              {schedules.filter(s => s.status === 'ONGOING').length}
            </div>
            <div className="text-sm text-gray-600">Đang diễn ra</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-gray-600">
              {schedules.filter(s => s.status === 'COMPLETED').length}
            </div>
            <div className="text-sm text-gray-600">Hoàn thành</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={filters.trainer}
              onChange={(e) => setFilters(prev => ({ ...prev, trainer: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả trainer</option>
              {trainers.map(trainer => (
                <option key={trainer.username} value={trainer.username}>
                  {trainer.fullName}
                </option>
              ))}
            </select>
            <select
              value={filters.course}
              onChange={(e) => setFilters(prev => ({ ...prev, course: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả khóa học</option>
              {courses.map(course => (
                <option key={course.id} value={course.code}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
            <select
              value={filters.class}
              onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả lớp</option>
              {classes.map(cls => (
                <option key={cls.classCode} value={cls.classCode}>
                  {cls.classCode}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="SCHEDULED">Đã lên lịch</option>
              <option value="ONGOING">Đang diễn ra</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Schedule Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khóa học
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trainer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lớp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày & Giờ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Địa điểm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sức chứa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    Đang tải...
                  </td>
                </tr>
              ) : filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                filteredSchedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {schedule.courseCode}
                        </div>
                        <div className="text-sm text-gray-500">
                          {schedule.courseName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {schedule.trainerUsername}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {schedule.classCode || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{schedule.date}</div>
                      <div className="text-sm text-gray-500">
                        {schedule.startTime} - {schedule.endTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {schedule.locationType === 'ONLINE' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Online
                          </span>
                        ) : schedule.locationType === 'HYBRID' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Hybrid
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {schedule.room || 'Offline'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {schedule.currentEnrolled || 0}/{schedule.maxCapacity || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                        {schedule.status || 'SCHEDULED'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openEditModal(schedule)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(schedule.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingId ? 'Chỉnh sửa lịch học' : 'Tạo lịch học mới'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trainer *
                    </label>
                    <select
                      value={formData.trainerUsername}
                      onChange={(e) => setFormData(prev => ({ ...prev, trainerUsername: e.target.value }))}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Chọn trainer</option>
                      {trainers.map(trainer => (
                        <option key={trainer.username} value={trainer.username}>
                          {trainer.fullName} ({trainer.username})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Khóa học *
                    </label>
                    <select
                      value={formData.courseCode}
                      onChange={(e) => {
                        const code = e.target.value;
                        const course = courses.find(c => c.code === code);
                        setFormData(prev => ({ ...prev, courseCode: code, classCode: '' }));
                        loadClasses(course?.id);
                      }}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Chọn khóa học</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.code}>
                          {course.code} - {course.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lớp học *
                    </label>
                    <select
                      value={formData.classCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, classCode: e.target.value }))}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Chọn lớp</option>
                      {classes.map(cls => (
                        <option key={cls.classCode} value={cls.classCode}>
                          {cls.classCode} - {cls.className}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày học *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giờ bắt đầu *
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giờ kết thúc *
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hình thức
                    </label>
                    <select
                      value={formData.locationType}
                      onChange={(e) => setFormData(prev => ({ ...prev, locationType: e.target.value as 'ONLINE' | 'OFFLINE' | 'HYBRID' }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="OFFLINE">Offline</option>
                      <option value="ONLINE">Online</option>
                      <option value="HYBRID">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sức chứa
                    </label>
                    <input
                      type="number"
                      value={formData.maxCapacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxCapacity: parseInt(e.target.value) }))}
                      min="1"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {formData.locationType === 'OFFLINE' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phòng học
                    </label>
                    <input
                      type="text"
                      value={formData.room}
                      onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
                      placeholder="Nhập phòng học"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ) : formData.locationType === 'ONLINE' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Link meeting
                      </label>
                      <input
                        type="url"
                        value={formData.meetingLink}
                        onChange={(e) => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
                        placeholder="https://meet.google.com/xxx-xxxx-xxx"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mật khẩu meeting
                      </label>
                      <input
                        type="text"
                        value={formData.meetingPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, meetingPassword: e.target.value }))}
                        placeholder="Mật khẩu (nếu có)"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phòng học
                      </label>
                      <input
                        type="text"
                        value={formData.room}
                        onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
                        placeholder="Nhập phòng học"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Link meeting
                      </label>
                      <input
                        type="url"
                        value={formData.meetingLink}
                        onChange={(e) => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
                        placeholder="https://meet.google.com/xxx-xxxx-xxx"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mật khẩu meeting
                      </label>
                      <input
                        type="text"
                        value={formData.meetingPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, meetingPassword: e.target.value }))}
                        placeholder="Mật khẩu (nếu có)"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    placeholder="Ghi chú về buổi học..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm">{error}</div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Tạo mới')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};