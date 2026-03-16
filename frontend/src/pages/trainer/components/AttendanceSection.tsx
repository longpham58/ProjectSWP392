import React, { useState, useEffect } from 'react';
import * as api from '../../../api/trainerAttendance.api';
import type { StudentAttendanceDto, ClassAttendanceDto } from '../../../api/trainerAttendance.api';

const today = new Date().toISOString().split('T')[0];

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
  });

const AttendanceSection: React.FC = () => {
  const [todayClasses, setTodayClasses] = useState<ClassAttendanceDto[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState<StudentAttendanceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load today's classes on mount
  useEffect(() => {
    api.getTodayClasses()
      .then(data => {
        setTodayClasses(data);
        if (data.length > 0) setSelectedClass(data[0].classCode);
      })
      .catch(() => setError('Không thể tải danh sách lớp học hôm nay'))
      .finally(() => setLoading(false));
  }, []);

  // Load attendance when class changes
  useEffect(() => {
    if (!selectedClass) return;
    loadAttendance();
  }, [selectedClass]);

  const loadAttendance = async () => {
    setLoading(true);
    setError(null);
    setHasChanges(false);
    setSaved(false);
    try {
      const data = await api.getClassAttendance(selectedClass, today);
      setStudents(data.students.map(s => ({ ...s, attended: s.attended ?? false })));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Không thể tải dữ liệu điểm danh');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (userId: number, attended: boolean) => {
    setStudents(prev => prev.map(s => s.userId === userId ? { ...s, attended } : s));
    setHasChanges(true);
    setSaved(false);
  };

  const markAll = (attended: boolean) => {
    setStudents(prev => prev.map(s => ({ ...s, attended })));
    setHasChanges(true);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.saveClassAttendance(selectedClass, today, students);
      setHasChanges(false);
      setSaved(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Lưu điểm danh thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter(s => s.attended).length;
  const absentCount = students.filter(s => !s.attended).length;
  const attendanceRate = students.length > 0
    ? ((presentCount / students.length) * 100).toFixed(1)
    : '0.0';

  // No classes today
  if (!loading && todayClasses.length === 0) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white text-xl font-bold">T</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Điểm Danh</h1>
              <p className="text-sm text-gray-600">{formatDate(today)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-5xl text-gray-300 mb-4">📅</div>
          <p className="text-gray-600 text-lg font-medium">Hôm nay không có lớp học nào</p>
          <p className="text-gray-400 text-sm mt-2">Điểm danh chỉ khả dụng vào ngày có lịch học</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white text-xl font-bold">T</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Điểm Danh</h1>
              <p className="text-sm text-gray-600">{formatDate(today)}</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            Hôm nay
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 font-bold">✕</button>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Lớp học:</label>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {todayClasses.map(c => (
                <option key={c.classCode} value={c.classCode}>
                  {c.classCode} - {c.className}
                </option>
              ))}
            </select>
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{presentCount}</div>
              <div className="text-xs text-gray-600">Có mặt</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{absentCount}</div>
              <div className="text-xs text-gray-600">Vắng</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{attendanceRate}%</div>
              <div className="text-xs text-gray-600">Tỷ lệ</div>
            </div>
          </div>
        </div>

        {students.length > 0 && (
          <div className="flex gap-2 mt-4">
            <button onClick={() => markAll(true)} className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm">
              Điểm danh tất cả
            </button>
            <button onClick={() => markAll(false)} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm">
              Vắng tất cả
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Đang tải dữ liệu điểm danh...
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-5xl text-gray-300 mb-4">📋</div>
          <p className="text-gray-500">Không có học viên trong lớp này</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">STT</th>
                <th className="px-6 py-4 text-left font-semibold">Họ tên</th>
                <th className="px-6 py-4 text-left font-semibold">Email</th>
                <th className="px-6 py-4 text-center font-semibold">Điểm danh</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.userId} className={`border-b border-gray-200 hover:bg-gray-50 ${student.attended ? 'bg-green-50' : ''}`}>
                  <td className="px-6 py-4 text-gray-600">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {student.fullName?.charAt(0) ?? '?'}
                      </div>
                      <span className="font-medium text-gray-900">{student.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{student.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`att-${student.userId}`}
                          checked={student.attended === true}
                          onChange={() => handleAttendanceChange(student.userId, true)}
                          className="w-4 h-4 accent-green-600"
                        />
                        <span className="text-sm text-green-700 font-medium">Có mặt</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`att-${student.userId}`}
                          checked={student.attended === false}
                          onChange={() => handleAttendanceChange(student.userId, false)}
                          className="w-4 h-4 accent-red-600"
                        />
                        <span className="text-sm text-red-700 font-medium">Vắng</span>
                      </label>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      {students.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <div>
            {hasChanges && !saved && <span className="text-orange-600 text-sm">Có thay đổi chưa lưu</span>}
            {saved && <span className="text-green-600 text-sm">✓ Đã lưu thành công</span>}
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadAttendance}
              disabled={!hasChanges || saving}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Hủy thay đổi
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 font-medium"
            >
              {saving ? 'Đang lưu...' : 'Lưu điểm danh'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceSection;
