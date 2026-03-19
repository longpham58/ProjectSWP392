import React, { useState, useEffect } from 'react';
import { getTrainerSchedule, TrainerScheduleDto } from '../../../api/trainerSchedule.api';

const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  return d;
}

function formatTime(time: string): string {
  return time ? time.substring(0, 5) : '';
}

function isToday(date: Date): boolean {
  return date.toDateString() === new Date().toDateString();
}

function getStatusColor(status: string): string {
  switch (status?.toUpperCase()) {
    case 'SCHEDULED': return 'bg-blue-400 border-blue-500 text-blue-900';
    case 'ONGOING':   return 'bg-yellow-400 border-yellow-500 text-yellow-900';
    case 'COMPLETED': return 'bg-green-400 border-green-500 text-green-900';
    case 'CANCELLED': return 'bg-red-400 border-red-500 text-red-900';
    default:          return 'bg-cyan-400 border-cyan-500 text-cyan-900';
  }
}

function statusLabel(status: string): string {
  switch (status?.toUpperCase()) {
    case 'SCHEDULED': return 'Đã lên lịch';
    case 'ONGOING':   return 'Đang diễn ra';
    case 'COMPLETED': return 'Đã hoàn thành';
    case 'CANCELLED': return 'Đã hủy';
    default:          return status;
  }
}

function toDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Group sessions by courseCode -> classCode
type CourseGroup = {
  courseId: number;
  courseCode: string;
  courseName: string;
  classes: { classCode: string; sessions: TrainerScheduleDto[] }[];
};

function groupByCourse(sessions: TrainerScheduleDto[]): CourseGroup[] {
  const map = new Map<string, CourseGroup>();
  for (const s of sessions) {
    if (!map.has(s.courseCode)) {
      map.set(s.courseCode, { courseId: s.courseId, courseCode: s.courseCode, courseName: s.courseName, classes: [] });
    }
    const cg = map.get(s.courseCode)!;
    let cls = cg.classes.find(c => c.classCode === s.classCode);
    if (!cls) { cls = { classCode: s.classCode, sessions: [] }; cg.classes.push(cls); }
    cls.sessions.push(s);
  }
  return Array.from(map.values());
}

const ScheduleSection: React.FC = () => {
  const [tab, setTab] = useState<'calendar' | 'list'>('calendar');
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()));
  const [schedule, setSchedule] = useState<TrainerScheduleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [viewing, setViewing] = useState<TrainerScheduleDto | null>(null);

  useEffect(() => { loadSchedule(); }, []);

  const loadSchedule = async () => {
    setLoading(true); setError(null);
    try {
      const data = await getTrainerSchedule();
      setSchedule(data ?? []);
    } catch {
      setError('Không thể tải lịch học. Vui lòng thử lại.');
      setSchedule([]);
    } finally { setLoading(false); }
  };

  const weekDates: Date[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(d.getDate() + i); return d;
  });

  const filteredSchedule = selectedCourse === 'ALL' ? schedule : schedule.filter(s => s.courseCode === selectedCourse);

  const getClassesForDate = (date: Date) => {
    const ds = toDateStr(date);
    return filteredSchedule.filter(s => s.date === ds);
  };

  const courseGroups = groupByCourse(schedule);
  const uniqueCourses = courseGroups.map(g => ({ code: g.courseCode, name: g.courseName }));

  const totalSessions = schedule.length;
  const completedSessions = schedule.filter(s => s.status?.toUpperCase() === 'COMPLETED').length;
  const ongoingSessions = schedule.filter(s => s.status?.toUpperCase() === 'ONGOING').length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">T</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lịch Giảng Dạy</h1>
              <p className="text-sm text-gray-600">Quản lý lịch giảng dạy của bạn</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="text-center"><div className="text-2xl font-bold text-blue-600">{totalSessions}</div><div className="text-xs text-gray-600">Tổng buổi học</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-green-600">{completedSessions}</div><div className="text-xs text-gray-600">Đã hoàn thành</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-yellow-600">{ongoingSessions}</div><div className="text-xs text-gray-600">Đang diễn ra</div></div>
            <button onClick={loadSchedule} disabled={loading} className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Tải lại">
              <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b border-gray-200">
          <button onClick={() => setTab('calendar')} className={`px-6 py-3 font-medium text-sm transition ${tab === 'calendar' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
            📅 Lịch theo tuần
          </button>
          <button onClick={() => setTab('list')} className={`px-6 py-3 font-medium text-sm transition ${tab === 'list' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
            📋 Tất cả khóa học & lớp học ({courseGroups.length} khóa)
          </button>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-600">Đang tải lịch học...</div>
        </div>
      )}
      {!loading && error && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={loadSchedule} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition">Thử lại</button>
        </div>
      )}
      {!loading && !error && schedule.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Chưa có lịch học nào được phân công.</p>
        </div>
      )}

      {/* ===== CALENDAR TAB ===== */}
      {!loading && !error && tab === 'calendar' && (
        <>
          {/* Navigation & Filter */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); }} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition font-medium">← Tuần trước</button>
                <button onClick={() => setWeekStart(getWeekStart(new Date()))} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium">Hôm nay</button>
                <button onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); }} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition font-medium">Tuần sau →</button>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {weekDates[0].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} – {weekDates[6].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Lọc theo khóa học</label>
              <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="ALL">Tất cả khóa học</option>
                {uniqueCourses.map(c => <option key={c.code} value={c.code}>{c.code} – {c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                <div className="grid grid-cols-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <div className="p-4 border-r border-blue-400 font-semibold text-sm">Thời gian</div>
                  {weekDates.map((date, i) => (
                    <div key={i} className={`p-4 border-r border-blue-400 font-semibold text-center ${isToday(date) ? 'bg-blue-700 ring-2 ring-yellow-300' : ''}`}>
                      <div>{daysOfWeek[i]}</div>
                      <div className="text-sm font-normal mt-1 opacity-90">{date.getDate()}/{date.getMonth() + 1}</div>
                      {isToday(date) && <div className="text-xs bg-yellow-300 text-blue-900 px-2 py-0.5 rounded-full mt-1">Hôm nay</div>}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-8 min-h-[400px]">
                  <div className="border-r border-gray-200 bg-gray-50 p-3 text-sm text-gray-500 text-center">Các buổi học</div>
                  {weekDates.map((date, di) => {
                    const classes = getClassesForDate(date);
                    return (
                      <div key={di} className={`border-r border-gray-200 p-2 space-y-2 ${isToday(date) ? 'bg-blue-50' : ''}`}>
                        {classes.length === 0
                          ? <div className="text-center text-gray-400 text-xs py-4">Không có lịch</div>
                          : [...classes].sort((a, b) => (a.timeStart ?? '').localeCompare(b.timeStart ?? '')).map((item, idx) => (
                            <div key={idx} onClick={() => setViewing(item)} className={`rounded-lg p-2 shadow cursor-pointer hover:shadow-md transition border-l-4 ${getStatusColor(item.status)}`}>
                              <div className="text-xs font-bold truncate">{item.courseCode}</div>
                              <div className="text-xs opacity-80 truncate">{item.classCode}</div>
                              <div className="text-xs font-semibold mt-1 bg-white bg-opacity-30 px-1 rounded">{formatTime(item.timeStart)} – {formatTime(item.timeEnd)}</div>
                              <div className="text-xs opacity-80 truncate mt-1">{item.location}</div>
                            </div>
                          ))
                        }
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 bg-white rounded-lg shadow p-4">
            <div className="flex flex-wrap gap-4">
              {[['bg-blue-400 border-blue-500', 'Đã lên lịch'], ['bg-yellow-400 border-yellow-500', 'Đang diễn ra'], ['bg-green-400 border-green-500', 'Đã hoàn thành'], ['bg-red-400 border-red-500', 'Đã hủy']].map(([cls, label]) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded border-l-4 ${cls}`}></div>
                  <span className="text-sm text-gray-700">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ===== LIST TAB ===== */}
      {!loading && !error && tab === 'list' && (
        <div className="space-y-6">
          {courseGroups.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">Chưa có khóa học nào.</div>
          )}
          {courseGroups.map(cg => (
            <div key={cg.courseCode} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Course header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="text-white font-bold text-lg">{cg.courseCode}</div>
                  <div className="text-blue-100 text-sm">{cg.courseName}</div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm">{cg.classes.length} lớp học</div>
                  <div className="text-blue-100 text-xs">{cg.classes.reduce((a, c) => a + c.sessions.length, 0)} buổi học</div>
                </div>
              </div>

              {/* Classes */}
              {cg.classes.map(cls => (
                <div key={cls.classCode} className="border-t border-gray-100">
                  <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
                    <div className="font-semibold text-gray-800 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full inline-block"></span>
                      Lớp: {cls.classCode}
                    </div>
                    <span className="text-xs text-gray-500">{cls.sessions.length} buổi</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100 text-gray-600 text-xs uppercase">
                          <th className="px-4 py-2 text-left">Ngày</th>
                          <th className="px-4 py-2 text-left">Thứ</th>
                          <th className="px-4 py-2 text-left">Giờ</th>
                          <th className="px-4 py-2 text-left">Phòng</th>
                          <th className="px-4 py-2 text-left">Hình thức</th>
                          <th className="px-4 py-2 text-left">Trạng thái</th>
                          <th className="px-4 py-2 text-left">Sĩ số</th>
                          <th className="px-4 py-2 text-left"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {cls.sessions.map((s, idx) => {
                          const d = new Date(s.date);
                          const dow = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()];
                          return (
                            <tr key={s.sessionId} className={`border-t border-gray-100 hover:bg-blue-50 transition ${idx % 2 === 0 ? '' : 'bg-gray-50'}`}>
                              <td className="px-4 py-3 font-medium text-gray-900">{d.toLocaleDateString('vi-VN')}</td>
                              <td className="px-4 py-3 text-gray-600">{dow}</td>
                              <td className="px-4 py-3 text-gray-700">{formatTime(s.timeStart)} – {formatTime(s.timeEnd)}</td>
                              <td className="px-4 py-3 text-gray-700">{s.location || '—'}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.locationType === 'ONLINE' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                  {s.locationType === 'ONLINE' ? 'Online' : 'Offline'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  s.status?.toUpperCase() === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                  s.status?.toUpperCase() === 'ONGOING' ? 'bg-yellow-100 text-yellow-700' :
                                  s.status?.toUpperCase() === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>{statusLabel(s.status)}</span>
                              </td>
                              <td className="px-4 py-3 text-gray-600">{s.currentEnrolled}/{s.maxCapacity}</td>
                              <td className="px-4 py-3">
                                <button onClick={() => setViewing(s)} className="text-blue-500 hover:text-blue-700 text-xs font-medium">Chi tiết</button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {viewing && <SessionDetailModal session={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
};

const SessionDetailModal: React.FC<{ session: TrainerScheduleDto; onClose: () => void }> = ({ session, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-6 rounded-t-2xl flex justify-between items-start">
        <div className="text-white">
          <h2 className="text-xl font-bold">{session.courseCode}</h2>
          <p className="text-cyan-100 text-sm mt-1">{session.courseName}</p>
        </div>
        <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition text-xl leading-none">×</button>
      </div>
      <div className="p-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Info label="Mã lớp" value={session.classCode} />
          <Info label="Phòng học" value={session.location} />
          <Info label="Ngày học" value={new Date(session.date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })} />
          <Info label="Buổi số" value={`Buổi ${session.sessionNumber}`} />
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-blue-600 mb-1">Thời gian</div>
          <div className="font-semibold text-blue-900 text-lg">{formatTime(session.timeStart)} – {formatTime(session.timeEnd)}</div>
        </div>
        {session.locationType === 'ONLINE' && session.meetingLink && (
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-green-600 mb-1">Link học online</div>
            <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all text-sm">{session.meetingLink}</a>
          </div>
        )}
        <div className="border-t pt-3 space-y-2 text-sm">
          <Row label="Giảng viên" value={session.trainerName} />
          <Row label="Sĩ số" value={`${session.currentEnrolled} / ${session.maxCapacity}`} />
          <Row label="Trạng thái" value={statusLabel(session.status)} colored={session.status} />
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition font-medium">Đóng</button>
          <button onClick={() => { window.location.href = `/trainer/attendance?sessionId=${session.sessionId}`; }} className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium">Điểm danh</button>
        </div>
      </div>
    </div>
  </div>
);

const Info: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-gray-50 rounded-lg p-3">
    <div className="text-xs text-gray-500 mb-1">{label}</div>
    <div className="font-semibold text-gray-900 text-sm">{value}</div>
  </div>
);

const Row: React.FC<{ label: string; value: string; colored?: string }> = ({ label, value, colored }) => (
  <div className="flex justify-between">
    <span className="text-gray-600">{label}:</span>
    <span className={`font-medium ${colored?.toUpperCase() === 'COMPLETED' ? 'text-green-600' : colored?.toUpperCase() === 'ONGOING' ? 'text-yellow-600' : colored?.toUpperCase() === 'CANCELLED' ? 'text-red-600' : 'text-gray-900'}`}>{value}</span>
  </div>
);

export default ScheduleSection;
