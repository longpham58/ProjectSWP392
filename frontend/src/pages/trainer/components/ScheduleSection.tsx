import React, { useState, useEffect, useMemo } from 'react';
import { getTrainerSchedule, TrainerScheduleDto } from '../../../api/trainerSchedule.api';
import { ScheduleClass, TIME_SLOTS } from '../../../data/mockTrainerData';
import { getAllTrainerSchedules } from '../../../mocks/mockScheduleStorage';

const ScheduleSection: React.FC = () => {
  // State for API schedule
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));
  const [selectedClasses, setSelectedClasses] = useState<string[]>(['ALL']);
  const [schedule, setSchedule] = useState<TrainerScheduleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingClass, setViewingClass] = useState<TrainerScheduleDto | ScheduleClass | null>(null);

  // Days of week
  const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const daysOfWeekFull = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

  // Get Monday of the week
  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  // Load schedule data
  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const data = await getTrainerSchedule();
      setSchedule(data);
    } catch (error) {
      // Fallback to mock data if API fails
      const mock = getAllTrainerSchedules();
      setSchedule(mock);
    } finally {
      setLoading(false);
    }
  };

  // Navigate weeks
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

  const goToToday = () => {
    setCurrentWeekStart(getWeekStart(new Date()));
  };

  // Get dates for the current week
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
  // Get classes for a specific date
  const getClassesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    let filtered = schedule.filter(s => s.date === dateStr);
    
    if (!selectedClasses.includes('ALL')) {
      filtered = filtered.filter(s => selectedClasses.includes(s.courseCode));
    }
    
    return filtered;
  };

  // Format time from HH:mm:ss to HH:mm
  const formatTime = (time: string): string => {
    return time.substring(0, 5);
  };

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Get unique course codes for filter
  const uniqueCourseCodes = Array.from(new Set(schedule.map(s => s.courseCode)));

  return (
    <div className="p-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
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
      </div>

      {/* Week Navigation & Class Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousWeek}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition font-medium"
            >
              ← Tuần trước
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium"
            >
              Hôm nay
            </button>
            <button
              onClick={goToNextWeek}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition font-medium"
            >
              Tuần sau →
            </button>
          </div>
          
          <div className="text-lg font-semibold text-gray-900">
            {weekDates[0].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - {weekDates[6].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Lọc theo khóa học</label>
            <select
              multiple
              value={selectedClasses}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                if (selected.includes('ALL') && !selectedClasses.includes('ALL')) {
                  setSelectedClasses(['ALL']);
                } else if (selected.length > 1 && selectedClasses.includes('ALL')) {
                  setSelectedClasses(selected.filter(s => s !== 'ALL'));
                } else if (selected.length === 0) {
                  setSelectedClasses(['ALL']);
                } else {
                  setSelectedClasses(selected);
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Tất cả khóa học</option>
              {uniqueCourseCodes.map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {selectedClasses.includes('ALL') 
                ? 'Đang hiển thị tất cả khóa học' 
                : `Đang hiển thị ${selectedClasses.length} khóa học`}
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-600">Đang tải lịch học...</div>
        </div>
      )}

      {/* Schedule Grid */}
      {!loading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[1200px]">
              {/* Header Row with Dates */}
              <div className="grid grid-cols-8 bg-blue-500 text-white">
                <div className="p-4 border-r border-blue-400 font-semibold">Thời gian</div>
                {weekDates.map((date, index) => {
                  const today = isToday(date);
                  return (
                    <div 
                      key={index} 
                      className={`p-4 border-r border-blue-400 font-semibold text-center ${today ? 'bg-blue-600' : ''}`}
                    >
                      <div>{daysOfWeek[index]}</div>
                      <div className="text-sm font-normal mt-1">
                        {date.getDate()}/{date.getMonth() + 1}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Day Columns with Sessions */}
              <div className="grid grid-cols-8 min-h-[400px]">
                {/* Time Column */}
                <div className="border-r border-gray-200 bg-gray-50">
                  <div className="p-3 text-sm text-gray-600 text-center">
                    Các buổi học trong tuần
                  </div>
                </div>

                {/* Day Columns */}
                {weekDates.map((date, dayIndex) => {
                  const classes = getClassesForDate(date);
                  const today = isToday(date);
                  
                  return (
                    <div 
                      key={dayIndex} 
                      className={`border-r border-gray-200 p-2 space-y-2 ${today ? 'bg-blue-50' : ''}`}
                    >
                      {classes.length === 0 ? (
                        <div className="text-center text-gray-400 text-sm py-4">
                          Không có lịch
                        </div>
                      ) : (
                        classes.map((classItem, index) => (
                          <div
                            key={index}
                            onClick={() => setViewingClass(classItem)}
                            className="bg-cyan-400 rounded-lg p-3 shadow-md hover:shadow-lg hover:bg-cyan-500 transition cursor-pointer"
                          >
                            <div className="text-xs font-bold text-gray-900">{classItem.courseCode}</div>
                            <div className="text-xs text-gray-800 mt-1">{classItem.classCode}</div>
                            <div className="text-xs text-gray-700 mt-1">
                              {formatTime(classItem.timeStart)} - {formatTime(classItem.timeEnd)}
                            </div>
                            <div className="text-xs text-gray-700">{classItem.location}</div>
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

      {/* View Class Detail Modal */}
      {viewingClass && (
        <ClassDetailModal
          classItem={viewingClass}
          onClose={() => setViewingClass(null)}
        />
      )}
    </div>
  );
};

// Class Detail Modal Component
const ClassDetailModal: React.FC<{
  classItem: TrainerScheduleDto;
  onClose: () => void;
}> = ({ classItem, onClose }) => {
  const formatTime = (time: string): string => {
    return time.substring(0, 5);
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="text-white">
              <h2 className="text-2xl font-bold">{classItem.courseCode}</h2>
              <p className="text-cyan-100 mt-1">{classItem.courseName}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
            >
              <span className="text-xl">×</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Mã lớp</div>
              <div className="font-semibold text-gray-900">{classItem.classCode}</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Phòng học</div>
              <div className="font-semibold text-gray-900">{classItem.location}</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Ngày học</div>
              <div className="font-semibold text-gray-900">{formatDate(classItem.date)}</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Buổi học số</div>
              <div className="font-semibold text-gray-900">
                Buổi {classItem.sessionNumber}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 col-span-2">
              <div className="text-sm text-blue-600 mb-1">Thời gian</div>
              <div className="font-semibold text-blue-900 text-lg">
                {formatTime(classItem.timeStart)} - {formatTime(classItem.timeEnd)}
              </div>
            </div>

            {classItem.locationType === 'ONLINE' && classItem.meetingLink && (
              <div className="bg-green-50 rounded-lg p-4 col-span-2">
                <div className="text-sm text-green-600 mb-1">Link học online</div>
                <a 
                  href={classItem.meetingLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {classItem.meetingLink}
                </a>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Thông tin khóa học</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Mã khóa học:</span>
                <span className="font-medium text-gray-900">{classItem.courseCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tên khóa học:</span>
                <span className="font-medium text-gray-900">{classItem.courseName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Giảng viên:</span>
                <span className="font-medium text-gray-900">{classItem.trainerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sĩ số:</span>
                <span className="font-medium text-gray-900">
                  {classItem.currentEnrolled} / {classItem.maxCapacity}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng thái:</span>
                <span className={`font-medium ${
                  classItem.status === 'COMPLETED' ? 'text-green-600' :
                  classItem.status === 'ONGOING' ? 'text-blue-600' :
                  classItem.status === 'CANCELLED' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {classItem.status === 'SCHEDULED' ? 'Đã lên lịch' :
                   classItem.status === 'ONGOING' ? 'Đang diễn ra' :
                   classItem.status === 'COMPLETED' ? 'Đã hoàn thành' :
                   'Đã hủy'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition font-medium"
            >
              Đóng
            </button>
            <button
              onClick={() => {
                // Navigate to attendance page with session ID
                window.location.href = `/trainer/attendance?sessionId=${classItem.sessionId}`;
              }}
              className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium"
            >
              Điểm danh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSection;
