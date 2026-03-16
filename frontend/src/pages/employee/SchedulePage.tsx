import { useState, useEffect, useMemo } from 'react';
import { useSessionStore } from '../../stores/session.store';
import type { CourseSchedule } from '../../api/session.api';

export default function SchedulePage() {
  const { schedule, scheduleLoading, scheduleError, fetchCourseSchedule } = useSessionStore();
  const [selectedWeek, setSelectedWeek] = useState(() => {
    // Initialize with current week in format "YYYY-Www"
    const now = new Date();
    const year = now.getFullYear();
    const week = getWeekNumber(now);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  });
  const [filterMode, setFilterMode] = useState<'week' | 'today'>('week');
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week');

  // Get week dates from selected week string
  const getWeekDates = (weekString: string): { start: Date; end: Date } | null => {
    const match = weekString.match(/^(\d{4})-W(\d{2})$/);
    if (!match) return null;
    
    const year = parseInt(match[1]);
    const weekNum = parseInt(match[2]);
    
    // Find the first day of the week (Monday)
    const jan1 = new Date(year, 0, 1);
    const days = (weekNum - 1) * 7;
    const weekStart = new Date(jan1);
    weekStart.setDate(jan1.getDate() + days - jan1.getDay() + 1);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return { start: weekStart, end: weekEnd };
  };

  // Helper function to get week number
  function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  // Navigate to previous week
  const goToPrevWeek = () => {
    const weekDates = getWeekDates(selectedWeek);
    if (!weekDates) return;
    
    const prevWeekStart = new Date(weekDates.start);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const year = prevWeekStart.getFullYear();
    const week = getWeekNumber(prevWeekStart);
    setSelectedWeek(`${year}-W${week.toString().padStart(2, '0')}`);
    setFilterMode('week');
  };

  // Navigate to next week
  const goToNextWeek = () => {
    const weekDates = getWeekDates(selectedWeek);
    if (!weekDates) return;
    
    const nextWeekStart = new Date(weekDates.start);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    const year = nextWeekStart.getFullYear();
    const week = getWeekNumber(nextWeekStart);
    setSelectedWeek(`${year}-W${week.toString().padStart(2, '0')}`);
    setFilterMode('week');
  };

  // Go to today's week
  const goToToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const week = getWeekNumber(now);
    setSelectedWeek(`${year}-W${week.toString().padStart(2, '0')}`);
    setFilterMode('today');
  };

  useEffect(() => {
    fetchCourseSchedule();
  }, [fetchCourseSchedule]);

  // Days of week
  const daysOfWeek = [
    { label: 'Thứ 2', value: 1 },
    { label: 'Thứ 3', value: 2 },
    { label: 'Thứ 4', value: 3 },
    { label: 'Thứ 5', value: 4 },
    { label: 'Thứ 6', value: 5 },
    { label: 'Thứ 7', value: 6 },
    { label: 'Chủ nhật', value: 0 },
  ];

  // Time slots - 2 hour blocks
  const timeSlots = [
    { slot: 1, label: 'Slot 1', time: '07:00 - 09:00' },
    { slot: 2, label: 'Slot 2', time: '09:00 - 11:00' },
    { slot: 3, label: 'Slot 3', time: '11:00 - 13:00' },
    { slot: 4, label: 'Slot 4', time: '13:00 - 15:00' },
  ];

  // Memoize schedule with filtering based on filterMode
  const filteredAndMemoizedSchedule = useMemo(() => {
    let filteredSchedule = schedule;
    
    // Apply filter based on filterMode
    if (filterMode === 'week') {
      const weekDates = getWeekDates(selectedWeek);
      if (weekDates) {
        filteredSchedule = schedule.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate >= weekDates.start && itemDate <= weekDates.end;
        });
      }
    } else if (filterMode === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      filteredSchedule = schedule.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= today && itemDate < tomorrow;
      });
    }
    
    return filteredSchedule.map((item, index) => {
      const dateObj = new Date(item.date);
      const dayOfWeek = Number.isNaN(dateObj.getTime()) ? 1 : dateObj.getDay();
      const time = item.time || '';
      let slot = 1;
      if (time === '07:00 - 09:00') slot = 1;
      else if (time === '09:00 - 11:00') slot = 2;
      else if (time === '11:00 - 13:00') slot = 3;
      else if (time === '13:00 - 15:00') slot = 4;

      return {
        ...item,
        id: item.id ?? index + 1,
        slot,
        dayOfWeek,
      } as CourseSchedule;
    });
  }, [schedule, filterMode, selectedWeek]);

  const getSessionForSlot = (dayOfWeek: number, slotNumber: number) => {
    return filteredAndMemoizedSchedule.find(
      s => s.dayOfWeek === dayOfWeek && s.slot === slotNumber
    );
  };

  const getStatusColor = (status: CourseSchedule['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'SCHEDULED':
      case 'ONGOING':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getStatusText = (status: CourseSchedule['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'Đã học';
      case 'SCHEDULED':
        return 'Sắp diễn ra';
      case 'ONGOING':
        return 'Đang diễn ra';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📅 Lịch học</h1>
              <p className="text-gray-600">Xem lịch học và quản lý thời gian của bạn</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'week'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border hover:bg-gray-50'
                }`}
              >
                📊 Tuần
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border hover:bg-gray-50'
                }`}
              >
                📋 Danh sách
              </button>
            </div>
          </div>

          {/* Week Selector */}
          <div className="flex items-center gap-4 bg-white rounded-lg p-4 shadow">
            <button onClick={goToPrevWeek} className="p-2 hover:bg-gray-100 rounded">
              ←
            </button>
            <input
              type="week"
              value={selectedWeek}
              onChange={(e) => {
                setSelectedWeek(e.target.value);
                setFilterMode('week');
              }}
              className="px-4 py-2 border rounded-lg"
            />
            <button onClick={goToNextWeek} className="p-2 hover:bg-gray-100 rounded">
              →
            </button>
            <button 
              onClick={goToToday} 
              className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Hôm nay
            </button>
          </div>
        </div>

        {/* Loading State */}
        {scheduleLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">Đang tải lịch học...</span>
          </div>
        )}

        {/* Error State */}
        {scheduleError && !scheduleLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{scheduleError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-700 underline"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Empty State */}
        {!scheduleLoading && !scheduleError && filteredAndMemoizedSchedule.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{filterMode === 'today' ? 'Hôm nay không có lịch học' : 'Không có lịch học trong tuần này'}</h3>
            <p className="text-gray-600">{filterMode === 'today' ? 'Bạn không có lịch học nào hôm nay.' : 'Bạn không có lịch học nào trong tuần này.'}</p>
          </div>
        )}

        {/* Week View */}
        {!scheduleLoading && !scheduleError && filteredAndMemoizedSchedule.length > 0 && viewMode === 'week' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <th className="p-4 text-left font-semibold border-r border-blue-500 min-w-[120px]">Khung giờ</th>
                    {daysOfWeek.map(day => (
                      <th key={day.value} className="p-4 text-center font-semibold border-r border-blue-500 last:border-r-0 min-w-[150px]">
                        {day.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((timeSlot, timeIndex) => (
                    <tr key={timeSlot.slot} className={timeIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="p-4 border-r border-gray-200">
                        <div className="font-medium text-gray-700">{timeSlot.label}</div>
                        <div className="text-xs text-gray-500">{timeSlot.time}</div>
                      </td>
                      {daysOfWeek.map(day => {
                        const session = getSessionForSlot(day.value, timeSlot.slot);
                        return (
                          <td key={day.value} className="p-2 border-r border-gray-200 last:border-r-0">
                            {session ? (
                              <div className={`p-3 rounded-lg border-2 ${getStatusColor(session.status)} hover:shadow-md transition-all cursor-pointer min-h-[100px]`}>
                                <div className="font-semibold text-sm mb-1">{session.title}</div>
                                <div className="text-xs opacity-75 mb-2">
                                  📍 {session.location}
                                </div>
                                <div className="text-xs font-medium">
                                  👨‍🏫 {session.instructor}
                                </div>
                              </div>
                            ) : (
                              <div className="h-[100px]"></div>
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
        )}

        {/* List View */}
        {!scheduleLoading && !scheduleError && filteredAndMemoizedSchedule.length > 0 && viewMode === 'list' && (
          <div className="space-y-4">
            {filteredAndMemoizedSchedule.map(session => (
              <div key={session.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">📚</span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{session.title}</h3>
                        <p className="text-sm text-gray-600">Buổi học #{session.sessionNumber}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">📅</span>
                        <span>{new Date(session.date).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">🕐</span>
                        <span>{session.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">📍</span>
                        <span>{session.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">👨‍🏫</span>
                        <span>{session.instructor}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`px-4 py-2 rounded-lg font-medium text-sm ${getStatusColor(session.status)}`}>
                    {getStatusText(session.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        {!scheduleLoading && !scheduleError && filteredAndMemoizedSchedule.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold mb-4">Chú thích:</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-300"></div>
                <span className="text-sm">Sắp diễn ra / Đang diễn ra</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-300"></div>
                <span className="text-sm">Đã học</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-100 border-2 border-red-300"></div>
                <span className="text-sm">Đã hủy</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
