import { useState } from 'react';
import { mockCourseSchedule, type CourseSchedule } from '../../data/mockSchedule';

export default function SchedulePage() {
  const [schedule] = useState(mockCourseSchedule);
  const [selectedWeek, setSelectedWeek] = useState('2026-W10');
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week');

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

  const getSessionForSlot = (dayOfWeek: number, slotNumber: number) => {
    return schedule.find(
      s => s.dayOfWeek === dayOfWeek && s.slot === slotNumber
    );
  };

  const getStatusColor = (status: CourseSchedule['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getStatusText = (status: CourseSchedule['status']) => {
    switch (status) {
      case 'completed':
        return 'Đã học';
      case 'upcoming':
        return 'Sắp diễn ra';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
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
            <button className="p-2 hover:bg-gray-100 rounded">
              ←
            </button>
            <input
              type="week"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            />
            <button className="p-2 hover:bg-gray-100 rounded">
              →
            </button>
            <button className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Hôm nay
            </button>
          </div>
        </div>

        {/* Week View */}
        {viewMode === 'week' && (
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
        {viewMode === 'list' && (
          <div className="space-y-4">
            {schedule.map(session => (
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
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold mb-4">Chú thích:</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-300"></div>
              <span className="text-sm">Sắp diễn ra</span>
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
      </div>
    </div>
  );
}
