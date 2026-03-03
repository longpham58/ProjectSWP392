import { useState } from 'react';
import { mockCourseSchedule } from '../../mocks/course.mock';

export default function SchedulePage() {
  const [schedule] = useState(mockCourseSchedule);
  const [selectedWeek, setSelectedWeek] = useState('2026-W10'); // Week 10 of 2026

  // Time slots from 7:00 to 15:00
  const timeSlots = [
    { label: '7:00', value: '07:00' },
    { label: '8:00', value: '08:00' },
    { label: '9:00', value: '09:00' },
    { label: '10:00', value: '10:00' },
    { label: '11:00', value: '11:00' },
    { label: '12:00', value: '12:00' },
    { label: '13:00', value: '13:00' },
    { label: '14:00', value: '14:00' },
    { label: '15:00', value: '15:00' },
  ];

  // Days of week with dates
  const daysOfWeek = [
    { label: 'MON', fullLabel: 'Thứ 2', value: 1, date: '02/03' },
    { label: 'TUE', fullLabel: 'Thứ 3', value: 2, date: '03/03' },
    { label: 'WED', fullLabel: 'Thứ 4', value: 3, date: '04/03' },
    { label: 'THU', fullLabel: 'Thứ 5', value: 4, date: '05/03' },
    { label: 'FRI', fullLabel: 'Thứ 6', value: 5, date: '06/03' },
    { label: 'SAT', fullLabel: 'Thứ 7', value: 6, date: '07/03' },
    { label: 'SUN', fullLabel: 'Chủ Nhật', value: 0, date: '08/03' },
  ];

  // Slots (periods in a day)
  const slots = [
    { id: 1, label: 'Slot 1' },
    { id: 2, label: 'Slot 2' },
    { id: 3, label: 'Slot 3' },
    { id: 4, label: 'Slot 4' },
  ];

  // Get session for specific slot and day
  const getSessionForSlot = (slotId: number, dayOfWeek: number) => {
    // Map slots to time ranges
    const slotTimeMap: Record<number, string[]> = {
      1: ['07:00', '08:00'],
      2: ['09:00', '10:00'],
      3: ['12:00', '13:00'],
      4: ['14:00', '15:00'],
    };

    const times = slotTimeMap[slotId];
    if (!times) return null;

    return schedule.find(s => 
      times.includes(s.startTime) && s.dayOfWeek === dayOfWeek
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Activities for (Nguyễn Văn Employee)</h1>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">Chú thích:</span>
            <span className="text-gray-600">
              Các hoạt động này không bao gồm hoạt động ngoại khóa, ví dụ như hoạt động câu lạc bộ
            </span>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          <span className="font-medium">Cảnh báo:</span> Các hoạt động đồng thời không được khuyến khích hoặc cấm hoạt động ngoại khóa, ví dụ như hoạt động câu lạc bộ
        </div>
      </div>

      {/* Week Selector */}
      <div className="mb-6 flex items-center gap-4">
        <label className="font-medium">Tuần:</label>
        <select
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="2026-W09">02/03 to 08/03</option>
          <option value="2026-W10">09/03 to 15/03</option>
          <option value="2026-W11">16/03 to 22/03</option>
        </select>
      </div>

      {/* Schedule Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[1200px]">
            {/* Header Row */}
            <thead>
              <tr>
                <th className="bg-blue-600 text-white border border-gray-300 p-3 text-sm font-semibold w-24">
                  WEEK
                </th>
                {daysOfWeek.map(day => (
                  <th 
                    key={day.value} 
                    className={`border border-gray-300 p-3 text-sm font-semibold ${
                      day.value === 0 ? 'bg-yellow-500 text-white' : 
                      day.value === 6 ? 'bg-blue-500 text-white' : 
                      'bg-blue-600 text-white'
                    }`}
                  >
                    <div>{day.label}</div>
                    <div className="text-xs font-normal mt-1">{day.date}</div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {slots.map((slot, slotIndex) => (
                <tr key={slot.id} className={slotIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {/* Slot Label */}
                  <td className="bg-blue-400 text-white border border-gray-300 p-3 text-center font-semibold text-sm">
                    {slot.label}
                  </td>

                  {/* Days */}
                  {daysOfWeek.map(day => {
                    const session = getSessionForSlot(slot.id, day.value);
                    
                    return (
                      <td 
                        key={`${slot.id}-${day.value}`} 
                        className="border border-gray-300 p-2 align-top"
                      >
                        {session ? (
                          <div className="bg-teal-400 rounded-lg p-3 h-full min-h-[120px] text-white shadow-md hover:shadow-lg transition-shadow">
                            <div className="space-y-2">
                              {/* Course Code */}
                              <div className="flex items-center gap-2">
                                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded font-medium">
                                  View materials
                                </span>
                              </div>
                              
                              {/* Course Title */}
                              <div className="font-bold text-sm">
                                {session.title}
                              </div>

                              {/* Location */}
                              <div className="text-xs">
                                at {session.location}
                              </div>

                              {/* Status Badge */}
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  session.status === 'completed' ? 'bg-green-600' :
                                  session.status === 'ongoing' ? 'bg-blue-600' :
                                  'bg-red-600'
                                } text-white`}>
                                  {session.status === 'completed' ? 'attended' :
                                   session.status === 'ongoing' ? 'ongoing' :
                                   'Not yet'}
                                </span>
                              </div>

                              {/* Time */}
                              <div className="text-xs opacity-90">
                                ({session.time})
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-1 mt-2">
                                <button className="bg-gray-700 hover:bg-gray-800 text-white text-xs px-2 py-1 rounded transition-colors">
                                  Meet URL
                                </button>
                                <button className="bg-blue-700 hover:bg-blue-800 text-white text-xs px-2 py-1 rounded transition-colors">
                                  Eoutlet
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full min-h-[120px]"></div>
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

      {/* Legend */}
      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-3">Chú giải:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-teal-400 rounded"></div>
            <span>Lịch học</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span>Tài liệu học</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span>Đã tham gia</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span>Chưa diễn ra</span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-blue-600 text-xl">ℹ️</span>
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-1">Lưu ý quan trọng:</div>
            <ul className="space-y-1 text-xs">
              <li>• Vui lòng tham gia đúng giờ theo lịch đã được phân công</li>
              <li>• Click "Meet URL" để tham gia lớp học trực tuyến</li>
              <li>• Click "Eoutlet" để xem tài liệu và bài tập</li>
              <li>• Liên hệ giảng viên nếu có thắc mắc về lịch học</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
