import React, { useEffect, useState } from 'react';
import { certificateApi, type CourseCompletion } from '../../../api/certificate.api';

export const HrCertificatePage: React.FC = () => {
  const [courses, setCourses] = useState<CourseCompletion[]>([]);
  const [loading, setLoading] = useState(false);
  const [issuing, setIssuing] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await certificateApi.getCompletedCourses();
      setCourses(res.data?.data ?? []);
    } catch {
      showToast('Không thể tải danh sách khóa học', false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleIssue = async (courseId: number, courseName: string) => {
    if (!confirm(`Cấp chứng chỉ cho tất cả học viên đủ điều kiện của khóa "${courseName}"?`)) return;
    setIssuing(courseId);
    try {
      const res = await certificateApi.issueCertificates(courseId);
      const issued = res.data?.data?.issued ?? 0;
      showToast(issued > 0 ? `Đã cấp ${issued} chứng chỉ thành công` : 'Không có học viên mới đủ điều kiện', issued >= 0);
      load();
    } catch {
      showToast('Cấp chứng chỉ thất bại', false);
    } finally {
      setIssuing(null);
    }
  };

  const gradeColor = (rate: number) =>
    rate >= 90 ? 'text-purple-600' : rate >= 75 ? 'text-blue-600' : rate >= 70 ? 'text-green-600' : 'text-red-500';

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      INACTIVE: 'bg-gray-100 text-gray-700',
      ARCHIVED: 'bg-yellow-100 text-yellow-700',
      ACTIVE: 'bg-green-100 text-green-700',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="p-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${toast.ok ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cấp chứng chỉ</h1>
            <p className="text-gray-500 mt-1">Danh sách khóa học đã kết thúc — cấp chứng chỉ cho học viên đủ điều kiện</p>
          </div>
          <button onClick={load} disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm disabled:opacity-50">
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>
      </div>

      {/* Stats */}
      {!loading && courses.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-gray-800">{courses.length}</div>
            <div className="text-sm text-gray-500 mt-1">Khóa học đã kết thúc</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {courses.reduce((s, c) => s + c.eligibleStudents, 0)}
            </div>
            <div className="text-sm text-gray-500 mt-1">Học viên đủ điều kiện</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {courses.reduce((s, c) => s + c.alreadyCertified, 0)}
            </div>
            <div className="text-sm text-gray-500 mt-1">Đã được cấp chứng chỉ</div>
          </div>
        </div>
      )}

      {/* Course list */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">Đang tải...</div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          Chưa có khóa học nào kết thúc
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map(course => {
            const pending = course.eligibleStudents - course.alreadyCertified;
            const isOpen = expanded === course.courseId;
            return (
              <div key={course.courseId} className="bg-white rounded-lg shadow overflow-hidden">
                {/* Course row */}
                <div className="p-5 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-gray-900">{course.courseName}</span>
                      <span className="text-xs text-gray-500 font-mono">{course.courseCode}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(course.status)}`}>
                        {course.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-5 mt-2 text-sm text-gray-500 flex-wrap">
                      <span>{course.courseCategory}</span>
                      {course.endDate && <span>Kết thúc: {course.endDate}</span>}
                      <span>{course.totalStudents} học viên</span>
                      <span className="text-green-600 font-medium">{course.eligibleStudents} đủ điều kiện</span>
                      <span className="text-blue-600 font-medium">{course.alreadyCertified} đã cấp</span>
                      {pending > 0 && <span className="text-orange-500 font-medium">{pending} chờ cấp</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setExpanded(isOpen ? null : course.courseId)}
                      className="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm transition">
                      {isOpen ? 'Thu gọn' : 'Xem học viên'}
                    </button>
                    <button
                      onClick={() => handleIssue(course.courseId, course.courseName)}
                      disabled={issuing === course.courseId || pending === 0}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed">
                      {issuing === course.courseId ? 'Đang cấp...' : pending === 0 ? 'Đã cấp hết' : `Cấp ${pending} chứng chỉ`}
                    </button>
                  </div>
                </div>

                {/* Student table */}
                {isOpen && (
                  <div className="border-t border-gray-100">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                        <tr>
                          <th className="px-5 py-3 text-left">Học viên</th>
                          <th className="px-5 py-3 text-left">Email</th>
                          <th className="px-5 py-3 text-center">Điểm danh</th>
                          <th className="px-5 py-3 text-center">Tỷ lệ</th>
                          <th className="px-5 py-3 text-center">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {course.students.map(s => (
                          <tr key={s.userId} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="px-5 py-3">
                              <div className="font-medium text-gray-900">{s.fullName}</div>
                              <div className="text-xs text-gray-400">@{s.username}</div>
                            </td>
                            <td className="px-5 py-3 text-gray-600">{s.email}</td>
                            <td className="px-5 py-3 text-center text-gray-700">
                              {s.attendedSessions}/{s.totalSessions}
                            </td>
                            <td className={`px-5 py-3 text-center font-semibold ${gradeColor(s.attendanceRate)}`}>
                              {s.attendanceRate}%
                            </td>
                            <td className="px-5 py-3 text-center">
                              {s.hasCertificate ? (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Đã cấp</span>
                              ) : s.eligible ? (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Đủ điều kiện</span>
                              ) : (
                                <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">Chưa đủ</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
