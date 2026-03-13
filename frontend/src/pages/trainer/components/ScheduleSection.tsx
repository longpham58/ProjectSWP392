import React, { useState, useEffect } from 'react';
import { useTrainerScheduleStore } from '../../../stores/trainerSchedule.store';
import { TrainerScheduleDto } from '../../../api/trainerSchedule.api';

const ScheduleSection: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedClasses, setSelectedClasses] = useState<string[]>(['ALL']); // Default: show all
  const [viewingClass, setViewingClass] = useState<TrainerScheduleDto | null>(null);

  // Use store (READ-ONLY)
  const { 
    schedule, 
    loading, 
    error, 
    fetchSchedule, 
    clearError
  } = useTrainerScheduleStore();

  // Fetch schedule on component mount
  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const daysOfWeek = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  
  // Define time slots with actual times (every hour from 07:00 to 17:00)
  const timeSlots = [
    { id: 1, label: '07:00' },
    { id: 2, label: '08:00' },
    { id: 3, label: '09:00' },
    { id: 4, label: '10:00' },
    { id: 5, label: '11:00' },
    { id: 6, label: '12:00' },
    { id: 7, label: '13:00' },
    { id: 8, label: '14:00' },
    { id: 9, label: '15:00' },
    { id: 10, label: '16:00' },
    { id: 11, label: '17:00' }
  ];

  // Get unique course codes for filter
  const uniqueCourseCodes = Array.from(new Set(schedule.map(s => s.courseCode)));

  const getClassesForDay = (dayIndex: number) => {
    let filteredSchedule = schedule.filter(s => s.dayOfWeek === dayIndex);
    
    if (!selectedClasses.includes('ALL')) {
      filteredSchedule = filteredSchedule.filter(s => selectedClasses.includes(s.courseCode));
    }
    
    return filteredSchedule;
  };



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
              <p className="text-sm text-gray-600 mt-1">Xem lịch giảng dạy của bạn</p>
            </div>
          </div>
          <div className="text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
            📅 Chỉ xem - Liên hệ HR để thay đổi lịch
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-red-600">⚠️</div>
              <span className="text-red-800">{error}</span>
            </div>
            <button 
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Đang tải lịch học...</span>
          </div>
        </div>
      )}

      {/* Date Picker & Class Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
            <div className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg">
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="flex-1 outline-none"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Khóa học</label>
            <select
              multiple
              value={selectedClasses}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                // If "ALL" is selected, only keep "ALL"
                if (selected.includes('ALL') && !selectedClasses.includes('ALL')) {
                  setSelectedClasses(['ALL']);
                } 
                // If other options are selected while "ALL" is active, remove "ALL"
                else if (selected.length > 1 && selectedClasses.includes('ALL')) {
                  setSelectedClasses(selected.filter(s => s !== 'ALL'));
                }
                // If nothing selected, default to "ALL"
                else if (selected.length === 0) {
                  setSelectedClasses(['ALL']);
                }
                else {
                  setSelectedClasses(selected);
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Tất cả khóa học</option>
              {uniqueCourseCodes.map(courseCode => (
                <option key={courseCode} value={courseCode}>{courseCode}</option>
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

      {/* Schedule Grid - Vertical Time Slots */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Header Row - Days of Week */}
            <div className="grid gap-0" style={{ gridTemplateColumns: '120px repeat(7, 1fr)' }}>
              <div className="bg-blue-500 text-white p-4 font-semibold border-r border-blue-400">
                Thời gian
              </div>
              {daysOfWeek.map((day, index) => (
                <div 
                  key={index} 
                  className="bg-blue-500 text-white p-4 font-semibold text-center border-r border-blue-400"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Time Slots - Vertical Layout */}
            {timeSlots.map((timeSlot) => (
              <div 
                key={timeSlot.id}
                className="grid gap-0 border-b border-gray-200"
                style={{ gridTemplateColumns: '120px repeat(7, 1fr)' }}
              >
                {/* Time Label */}
                <div className="bg-gray-50 p-4 border-r border-gray-200 flex flex-col justify-center">
                  <div className="text-sm font-bold text-gray-800">{timeSlot.label}</div>
                </div>

                {/* Day Cells */}
                {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                  const classesForSlot = getClassesForDay(dayIndex).filter(c => c.slot === timeSlot.id);
                  
                  return (
                    <div
                      key={dayIndex}
                      className="relative min-h-[100px] border-r border-gray-200 p-2 bg-white hover:bg-gray-50 transition"
                    >
                      {/* Classes for this slot and day */}
                      {classesForSlot.map((classItem, index) => (
                        <div
                          key={index}
                          onClick={() => setViewingClass(classItem)}
                          className="bg-cyan-400 rounded-lg p-2 shadow-md hover:shadow-lg hover:bg-cyan-500 transition cursor-pointer mb-1 text-center"
                        >
                          <div className="text-xs font-bold text-gray-900">{classItem.courseCode}</div>
                          <div className="text-xs text-gray-800 mt-0.5">
                            Buổi {classItem.sessionNumber}
                          </div>
                          <div className="text-xs text-gray-700 mt-0.5">
                            {classItem.location}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-cyan-400 rounded"></div>
            <span className="text-sm text-gray-700">Lớp học đã lên lịch</span>
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

// Class Detail Modal Component (READ-ONLY)
const ClassDetailModal: React.FC<{
  classItem: TrainerScheduleDto;
  onClose: () => void;
}> = ({ classItem, onClose }) => {
  const daysOfWeek = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  
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
              <div className="text-sm text-gray-600 mb-1">Phiên học</div>
              <div className="font-semibold text-gray-900">
                Buổi {classItem.sessionNumber}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Địa điểm</div>
              <div className="font-semibold text-gray-900">{classItem.location}</div>
              {classItem.locationType === 'ONLINE' && classItem.meetingLink && (
                <a 
                  href={classItem.meetingLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Link meeting
                </a>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Ngày</div>
              <div className="font-semibold text-gray-900">
                {daysOfWeek[classItem.dayOfWeek]} - {classItem.date}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Slot</div>
              <div className="font-semibold text-gray-900">
                Slot {classItem.slot}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 col-span-2">
              <div className="text-sm text-blue-600 mb-1">Thời gian</div>
              <div className="font-semibold text-blue-900 text-lg">
                {classItem.timeStart} - {classItem.timeEnd}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Slot {classItem.slot}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 mb-1">Sức chứa</div>
              <div className="font-semibold text-green-900">
                {classItem.currentEnrolled}/{classItem.maxCapacity}
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-600 mb-1">Trạng thái</div>
              <div className="font-semibold text-purple-900">
                {getStatusText(classItem.status)}
              </div>
            </div>
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
                <span className="text-gray-600">Phiên số:</span>
                <span className="font-medium text-gray-900">{classItem.sessionNumber}</span>
              </div>
            </div>
          </div>

          {/* Actions - READ ONLY */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition font-medium"
            >
              Đóng
            </button>
            <div className="flex-1 px-6 py-3 bg-blue-50 text-blue-700 rounded-lg text-center font-medium">
              📞 Liên hệ HR để thay đổi
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get status text in Vietnamese
const getStatusText = (status: string) => {
  switch (status) {
    case 'SCHEDULED': return 'Đã lên lịch';
    case 'ONGOING': return 'Đang diễn ra';
    case 'COMPLETED': return 'Đã hoàn thành';
    case 'CANCELLED': return 'Đã hủy';
    default: return status;
  }
};

export default ScheduleSection;
