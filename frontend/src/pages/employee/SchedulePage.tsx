import { useState, useEffect } from 'react';
import { employeeApi, type ScheduleDto } from '../../api/employee.api';
import { useAuthStore } from '../../stores/auth.store';
import { CalendarDays, LayoutGrid, List, MapPin, User, Video, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

const TIME_SLOTS = [
  { slot: 1, time: '07:00 - 09:00' },
  { slot: 2, time: '09:00 - 11:00' },
  { slot: 3, time: '11:00 - 13:00' },
  { slot: 4, time: '13:00 - 15:00' },
];

const DAYS = [
  { label: 'Thứ 2', value: 1 },
  { label: 'Thứ 3', value: 2 },
  { label: 'Thứ 4', value: 3 },
  { label: 'Thứ 5', value: 4 },
  { label: 'Thứ 6', value: 5 },
  { label: 'Thứ 7', value: 6 },
  { label: 'Chủ nhật', value: 0 },
];

function getSlot(timeStart: string): number {
  const h = parseInt(timeStart.split(':')[0]);
  if (h < 9) return 1;
  if (h < 11) return 2;
  if (h < 13) return 3;
  return 4;
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

export default function SchedulePage() {
  const { user } = useAuthStore();
  const [schedule, setSchedule] = useState<ScheduleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(toWeekStr(new Date()));
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week');

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    employeeApi.getSchedule(user.id)
      .then(res => setSchedule(res.data))
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

  function getSessionForSlot(dayOfWeek: number, slot: number) {
    return weekSessions.find(s =>
      new Date(s.date).getDay() === dayOfWeek && getSlot(s.timeStart) === slot
    );
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
                    <th className="p-4 text-left font-semibold border-r border-blue-500 min-w-[130px]">Khung gio</th>
                    {DAYS.map(d => (
                      <th key={d.value} className="p-4 text-center font-semibold border-r border-blue-500 last:border-r-0 min-w-[150px]">
                        {d.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map((ts, i) => (
                    <tr key={ts.slot} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="p-4 border-r border-gray-200">
                        <div className="font-medium text-gray-700">{ts.time}</div>
                      </td>
                      {DAYS.map(d => {
                        const s = getSessionForSlot(d.value, ts.slot);
                        return (
                          <td key={d.value} className="p-2 border-r border-gray-200 last:border-r-0">
                            {s ? (
                              <div className={`p-3 rounded-lg border-2 ${statusCls(s.status)} hover:shadow-md transition-all cursor-pointer min-h-[100px]`}>
                                <div className="font-semibold text-sm mb-1">{s.courseName}</div>
                                <div className="text-xs opacity-75 mb-2 flex items-center gap-1">
                                  <MapPin size={11} /> {s.courseCode}
                                </div>
                                <div className="text-xs font-medium flex items-center gap-1">
                                  <User size={11} /> {s.trainerName}
                                </div>
                              </div>
                            ) : (
                              <div className="h-[100px]" />
                            )}
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
              <div key={s.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CalendarDays size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{s.courseName}</h3>
                        <p className="text-sm text-gray-600">Buổi học · {new Date(s.date).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={14} className="text-gray-400" />
                        <span>{new Date(s.date).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays size={14} className="text-gray-400" />
                        <span>{s.timeStart?.slice(0, 5)} - {s.timeEnd?.slice(0, 5)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {s.locationType === 'ONLINE' ? <Video size={14} className="text-gray-400" /> : <MapPin size={14} className="text-gray-400" />}
                        <span>{s.location || s.courseCode}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-400" />
                        <span>{s.trainerName}</span>
                      </div>
                    </div>
                    {s.locationType === 'ONLINE' && s.meetingLink && (
                      <div className="mt-3">
                        <a href={s.meetingLink} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                          <ExternalLink size={13} /> Tham gia online
                        </a>
                      </div>
                    )}
                  </div>
                  <div className={`px-4 py-2 rounded-lg font-medium text-sm ${statusCls(s.status)}`}>
                    {statusLabel(s.status)}
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
          </div>
        </div>
      </div>
    </div>
  );
}
