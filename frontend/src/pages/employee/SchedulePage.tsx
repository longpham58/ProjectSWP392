import { useState, useEffect } from 'react';
import { employeeApi, type ScheduleDto } from '../../api/employee.api';
import { useAuthStore } from '../../stores/auth.store';
import {
  CalendarDays, LayoutGrid, List, MapPin, User, Video, ExternalLink,
  ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, X, BookOpen
} from 'lucide-react';

// Khung giờ từ 07:00 đến 21:00, mỗi khung 1 tiếng
const TIME_SLOTS = Array.from({ length: 15 }, (_, i) => {
  const h = 7 + i;
  const label = `${String(h).padStart(2, '0')}:00`;
  return { hour: h, label };
});

const DAYS = [
  { label: 'Thứ 2', value: 1 },
  { label: 'Thứ 3', value: 2 },
  { label: 'Thứ 4', value: 3 },
  { label: 'Thứ 5', value: 4 },
  { label: 'Thứ 6', value: 5 },
  { label: 'Thứ 7', value: 6 },
  { label: 'Chủ nhật', value: 0 },
];

function getStartHour(timeStart: string): number {
  return parseInt(timeStart.split(':')[0]);
}

// Tính số hàng mà session chiếm (dựa vào timeStart và timeEnd)
function getSessionSpan(timeStart: string, timeEnd: string): number {
  const start = parseInt(timeStart.split(':')[0]);
  const endH = parseInt(timeEnd.split(':')[0]);
  const endM = parseInt(timeEnd.split(':')[1] ?? '0');
  return Math.max(1, endH - start + (endM > 0 ? 1 : 0));
}

function toWeekStr(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

function getWeekStart(weekStr: string): Date {
  const [year, week] = weekStr.split('-W').map(Number);
  const jan4 = new Date(year, 0, 4);
  const s = new Date(jan4);
  s.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
  const result = new Date(s);
  result.setDate(s.getDate() + (week - 1) * 7);
  return result;
}

function statusCls(status: string) {
  if (status === 'completed') return 'bg-green-100 border-green-300 text-green-800';
  if (status === 'cancelled') return 'bg-red-100 border-red-300 text-red-800';
  return 'bg-blue-100 border-blue-300 text-blue-800';
}

function statusLabel(status: string) {
  if (status === 'completed') return 'Đã học';
  if (status === 'cancelled') return 'Đã hủy';
  return 'Sắp diễn ra';
}

function AttendanceBadge({ attended, attendanceStatus }: { attended: boolean | null; attendanceStatus: string | null }) {
  if (attendanceStatus === null && attended === null) return null;
  if (attended === true || attendanceStatus === 'COMPLETED') {
    return (
      <span className="flex items-center gap-0.5 text-[10px] font-semibold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full mt-1">
        <CheckCircle2 size={10} /> Có mặt
      </span>
    );
  }
  if (attendanceStatus === 'ABSENT') {
    return (
      <span className="flex items-center gap-0.5 text-[10px] font-semibold text-red-700 bg-red-100 px-1.5 py-0.5 rounded-full mt-1">
        <XCircle size={10} /> Vắng mặt
      </span>
    );
  }
  if (attendanceStatus === 'IN_PROGRESS') {
    return (
      <span className="flex items-center gap-0.5 text-[10px] font-semibold text-yellow-700 bg-yellow-100 px-1.5 py-0.5 rounded-full mt-1">
        <Clock size={10} /> Đang học
      </span>
    );
  }
  return null;
}

// ─── Session Detail Modal ─────────────────────────────────────────────────────
function SessionModal({ session, onClose }: { session: ScheduleDto; onClose: () => void }) {
  const dateStr = new Date(session.date).toLocaleDateString('vi-VN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={`p-5 rounded-t-2xl border-b ${statusCls(session.status)}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/60 rounded-xl flex items-center justify-center">
                <BookOpen size={20} />
              </div>
              <div>
                <h2 className="font-bold text-base leading-tight">{session.courseName}</h2>
                <span className="text-xs font-medium opacity-80">{statusLabel(session.status)}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-black/10 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          <Row icon={<CalendarDays size={15} className="text-blue-500" />} label="Ngày học" value={dateStr} />
          <Row
            icon={<Clock size={15} className="text-purple-500" />}
            label="Thời gian"
            value={`${session.timeStart?.slice(0, 5)} – ${session.timeEnd?.slice(0, 5)}`}
          />
          {session.className && (
            <Row icon={<BookOpen size={15} className="text-indigo-500" />} label="Lớp học" value={session.className} />
          )}
          {session.location && (
            <Row
              icon={<MapPin size={15} className="text-orange-500" />}
              label="Phòng học"
              value={session.location}
            />
          )}
          {session.trainerName && (
            <Row icon={<User size={15} className="text-green-500" />} label="Giảng viên" value={session.trainerName} />
          )}
          {session.locationType && (
            <Row
              icon={<Video size={15} className="text-sky-500" />}
              label="Hình thức"
              value={session.locationType === 'ONLINE' ? 'Trực tuyến' : 'Trực tiếp'}
            />
          )}

          {/* Attendance status */}
          {(session.attendanceStatus !== null || session.attended !== null) && (
            <div className="flex items-center justify-between py-2 border-t">
              <span className="text-sm text-gray-500 font-medium">Điểm danh</span>
              <AttendanceBadge attended={session.attended} attendanceStatus={session.attendanceStatus} />
            </div>
          )}

          {/* Meeting link */}
          {session.locationType === 'ONLINE' && session.meetingLink && (
            <div className="pt-2 border-t">
              <a
                href={session.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium transition-colors"
              >
                <ExternalLink size={14} /> Tham gia buổi học online
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">{icon}</div>
      <div className="flex-1 flex items-center justify-between">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="text-sm font-medium text-gray-800 text-right max-w-[60%]">{value}</span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SchedulePage() {
  const { user } = useAuthStore();
  const [schedule, setSchedule] = useState<ScheduleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(toWeekStr(new Date()));
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week');
  const [selectedSession, setSelectedSession] = useState<ScheduleDto | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    employeeApi.getSchedule(user.id)
      .then(res => setSchedule((res.data as any).data ?? res.data))
      .catch(() => setSchedule([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const weekStart = getWeekStart(selectedWeek);

  const weekSessions = schedule.filter(s => {
    const d = new Date(s.date);
    const end = new Date(weekStart);
    end.setDate(weekStart.getDate() + 6);
    return d >= weekStart && d <= end;
  });

  function getSessionForSlot(dayOfWeek: number, hour: number) {
    return weekSessions.find(s =>
      new Date(s.date).getDay() === dayOfWeek && getStartHour(s.timeStart) === hour
    );
  }

  // Check if an hour is "covered" by a session that started earlier (for rowspan)
  function isCoveredByPrevious(dayOfWeek: number, hour: number) {
    return weekSessions.some(s => {
      if (new Date(s.date).getDay() !== dayOfWeek) return false;
      const start = getStartHour(s.timeStart);
      const span = getSessionSpan(s.timeStart, s.timeEnd);
      return start < hour && hour < start + span;
    });
  }

  function prevWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setSelectedWeek(toWeekStr(d));
  }

  function nextWeek() {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setSelectedWeek(toWeekStr(d));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {selectedSession && (
        <SessionModal session={selectedSession} onClose={() => setSelectedSession(null)} />
      )}

      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <CalendarDays size={28} className="text-blue-600" /> Lịch học
              </h1>
              <p className="text-gray-600">Xem lịch học và quản lý thời gian của bạn</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}>
                <LayoutGrid size={15} className="inline mr-1" /> Tuần
              </button>
              <button onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}>
                <List size={15} className="inline mr-1" /> Danh sách
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white rounded-lg p-4 shadow">
            <button onClick={prevWeek} className="p-2 hover:bg-gray-100 rounded"><ChevronLeft size={18} /></button>
            <input type="week" value={selectedWeek} onChange={e => setSelectedWeek(e.target.value)}
              className="px-4 py-2 border rounded-lg" />
            <button onClick={nextWeek} className="p-2 hover:bg-gray-100 rounded"><ChevronRight size={18} /></button>
            <button onClick={() => setSelectedWeek(toWeekStr(new Date()))}
              className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Hôm nay</button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Đang tải lịch học...</div>
        ) : viewMode === 'week' ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <th className="p-4 text-left font-semibold border-r border-blue-500 min-w-[130px]">Khung giờ</th>
                    {DAYS.map(d => (
                      <th key={d.value} className="p-4 text-center font-semibold border-r border-blue-500 last:border-r-0 min-w-[150px]">
                        {d.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map((ts, i) => (
                    <tr key={ts.hour} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="p-3 border-r border-gray-200 text-center align-top">
                        <div className="font-medium text-gray-700 text-sm">{ts.label}</div>
                      </td>
                      {DAYS.map(d => {
                        if (isCoveredByPrevious(d.value, ts.hour)) return null;
                        const s = getSessionForSlot(d.value, ts.hour);
                        const span = s ? getSessionSpan(s.timeStart, s.timeEnd) : 1;
                        return (
                          <td key={d.value} rowSpan={span} className="p-2 border-r border-gray-200 last:border-r-0 align-top">
                            {s ? (
                              <div
                                className={`p-3 rounded-lg border-2 ${statusCls(s.status)} hover:shadow-md transition-all cursor-pointer h-full`}
                                style={{ minHeight: `${span * 52}px` }}
                                onClick={() => setSelectedSession(s)}
                              >
                                <div className="font-semibold text-sm mb-1 leading-tight">{s.courseName}</div>
                                <div className="text-xs opacity-75 mb-1">
                                  {s.timeStart?.slice(0, 5)} – {s.timeEnd?.slice(0, 5)}
                                </div>
                                {s.className && (
                                  <div className="text-xs opacity-75 mb-1 flex items-center gap-1">
                                    <MapPin size={11} /> {s.className}
                                  </div>
                                )}
                                {s.location && (
                                  <div className="text-xs opacity-75 mb-1 flex items-center gap-1">
                                    <MapPin size={11} /> {s.location}
                                  </div>
                                )}
                                <div className="text-xs font-medium flex items-center gap-1 mb-1">
                                  <User size={11} /> {s.trainerName}
                                </div>
                                <AttendanceBadge attended={s.attended} attendanceStatus={s.attendanceStatus} />
                              </div>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {schedule.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
                <p>Chưa có lịch học nào</p>
              </div>
            ) : schedule.map(s => (
              <div
                key={s.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer"
                onClick={() => setSelectedSession(s)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CalendarDays size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{s.courseName}</h3>
                        <p className="text-sm text-gray-600">
                          {s.className ? `Lớp: ${s.className} · ` : ''}Buổi học · {new Date(s.date).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={14} className="text-gray-400" />
                        <span>{new Date(s.date).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gray-400" />
                        <span>{s.timeStart?.slice(0, 5)} - {s.timeEnd?.slice(0, 5)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {s.locationType === 'ONLINE' ? <Video size={14} className="text-gray-400" /> : <MapPin size={14} className="text-gray-400" />}
                        <span>{s.location || s.className || s.courseCode}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-400" />
                        <span>{s.trainerName}</span>
                      </div>
                    </div>
                    {s.locationType === 'ONLINE' && s.meetingLink && (
                      <div className="mt-3" onClick={e => e.stopPropagation()}>
                        <a href={s.meetingLink} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                          <ExternalLink size={13} /> Tham gia online
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`px-4 py-2 rounded-lg font-medium text-sm ${statusCls(s.status)}`}>
                      {statusLabel(s.status)}
                    </div>
                    <AttendanceBadge attended={s.attended} attendanceStatus={s.attendanceStatus} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold mb-4">Chú thích:</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-300" /><span className="text-sm">Sắp diễn ra</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-green-100 border-2 border-green-300" /><span className="text-sm">Đã học</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-100 border-2 border-red-300" /><span className="text-sm">Đã hủy</span></div>
            <div className="flex items-center gap-2"><span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full"><CheckCircle2 size={11} /> Có mặt</span><span className="text-sm">Điểm danh có mặt</span></div>
            <div className="flex items-center gap-2"><span className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full"><XCircle size={11} /> Vắng mặt</span><span className="text-sm">Điểm danh vắng</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
