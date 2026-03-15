import React, { useEffect } from 'react';
import { useTrainerScheduleStore } from '../../../stores/trainerSchedule.store';

const SimpleScheduleSection: React.FC = () => {
  const { schedule, loading, error, fetchSchedule } = useTrainerScheduleStore();

  const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const [currentWeekStart, setCurrentWeekStart] = React.useState(getWeekStart(new Date()));

  const timeSlots = [];
  for (let hour = 7; hour <= 22; hour++) {
    timeSlots.push({
      start: `${hour.toString().padStart(2, '0')}:00`,
      end: `${(hour + 1).toString().padStart(2, '0')}:00`,
      display: `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`
    });
  }

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const goToToday = () => setCurrentWeekStart(getWeekStart(new Date()));

  const getWeekDates = (): Date[] => {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const isToday = (date: Date): boolean =>
    date.toDateString() === new Date().toDateString();

  // Get sessions for a specific date and time slot
  const getSessionsForDateAndTime = (date: Date, timeSlot: { start: string; end: string }) => {
    const dateStr = date.toISOString().split('T')[0];
    return schedule.filter(s => {
      if (!s.date) return false;
      const sessionDate = s.date.split('T')[0];
      if (sessionDate !== dateStr) return false;
      const start = s.timeStart?.substring(0, 5) ?? '';
      return start >= timeSlot.start && start < timeSlot.end;
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white text-xl font-bold">
            T
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lịch Giảng Dạy</h1>
            <p className="text-sm text-gray-600">Quản lý lịch giảng dạy của bạn</p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
          <button onClick={fetchSchedule} className="ml-4 px-3 py-1 bg-red-500 text-white rounded text-sm">
            Thử lại
          </button>
        </div>
      )}

      {/* Week Navigation */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={goToPreviousWeek} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition font-medium">
              ← Tuần trước
            </button>
            <button onClick={goToToday} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium">
              Hôm nay
            </button>
            <button onClick={goToNextWeek} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition font-medium">
              Tuần sau →
            </button>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {weekDates[0].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} -{' '}
            {weekDates[6].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Đang tải lịch giảng dạy...
        </div>
      )}

      {/* Schedule Grid */}
      {!loading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[1200px]">
              {/* Header */}
              <div className="grid grid-cols-8 bg-blue-500 text-white">
                <div className="p-4 border-r border-blue-400 font-semibold">Thời gian</div>
                {weekDates.map((date, index) => (
                  <div
                    key={index}
                    className={`p-4 border-r border-blue-400 font-semibold text-center ${isToday(date) ? 'bg-blue-600' : ''}`}
                  >
                    <div>{daysOfWeek[index]}</div>
                    <div className="text-sm font-normal mt-1">{date.getDate()}/{date.getMonth() + 1}</div>
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              {timeSlots.map((timeSlot, timeIndex) => (
                <div key={timeIndex} className="grid grid-cols-8 border-b border-gray-200">
                  <div className="border-r border-gray-200 bg-gray-50 p-3 text-center">
                    <div className="text-sm font-medium text-gray-700">{timeSlot.display}</div>
                  </div>
                  {weekDates.map((date, dayIndex) => {
                    const sessions = getSessionsForDateAndTime(date, timeSlot);
                    return (
                      <div
                        key={dayIndex}
                        className={`border-r border-gray-200 p-2 min-h-[80px] ${isToday(date) ? 'bg-blue-50' : ''}`}
                      >
                        {sessions.length === 0 ? (
                          <div className="h-full flex items-center justify-center">
                            <div className="text-gray-300 text-xs">-</div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {sessions.map((session, i) => (
                              <div
                                key={i}
                                className="bg-cyan-400 rounded-lg p-2 shadow-md hover:shadow-lg hover:bg-cyan-500 transition cursor-pointer"
                                title={`${session.courseName} - Buổi ${session.sessionNumber}`}
                              >
                                <div className="text-xs font-bold text-gray-900">{session.courseCode}</div>
                                <div className="text-xs text-gray-800">{session.classCode}</div>
                                <div className="text-xs text-gray-700">
                                  {session.timeStart?.substring(0, 5)} - {session.timeEnd?.substring(0, 5)}
                                </div>
                                <div className="text-xs text-gray-700 truncate">{session.location}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-cyan-400 rounded"></div>
            <span className="text-sm text-gray-700">Lớp học đã lên lịch</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-50 border-2 border-blue-500 rounded"></div>
            <span className="text-sm text-gray-700">Hôm nay</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleScheduleSection;
