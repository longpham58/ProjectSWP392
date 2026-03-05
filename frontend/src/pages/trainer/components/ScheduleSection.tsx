import React, { useState } from 'react';
import { mockSchedule, ScheduleClass, TIME_SLOTS } from '../../../data/mockTrainerData';

const ScheduleSection: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedClasses, setSelectedClasses] = useState<string[]>(['ALL']); // Default: show all
  const [schedule] = useState<ScheduleClass[]>(mockSchedule);
  const [viewingClass, setViewingClass] = useState<ScheduleClass | null>(null);

  const daysOfWeek = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const slots = [1, 2, 3, 4, 5, 6]; // 6 slots

  const getClassesForDay = (dayIndex: number) => {
    if (selectedClasses.includes('ALL')) {
      return schedule.filter(s => s.dayOfWeek === dayIndex);
    }
    return schedule.filter(
      s => s.dayOfWeek === dayIndex && selectedClasses.includes(s.courseCode)
    );
  };

  const getSlotPosition = (slot: number) => {
    return (slot - 1) * 80; // 80px per slot
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
              <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
            </div>
          </div>
          <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium">
            Schedule
          </button>
        </div>
      </div>

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
              <option value="ITM5001-M01">ITM5001-M01</option>
              <option value="ITM5002-M02">ITM5002-M02</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {selectedClasses.includes('ALL') 
                ? 'Đang hiển thị tất cả khóa học' 
                : `Đang hiển thị ${selectedClasses.length} khóa học`}
            </p>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            {/* Header Row */}
            <div className="grid grid-cols-8 bg-blue-500 text-white">
              <div className="p-4 border-r border-blue-400 font-semibold">Slot / Thời gian</div>
              {daysOfWeek.map((day, index) => (
                <div key={index} className="p-4 border-r border-blue-400 font-semibold text-center">
                  {day}
                </div>
              ))}
            </div>

            {/* Slot Rows */}
            <div className="relative">
              <div className="grid grid-cols-8">
                {/* Slot Column */}
                <div className="border-r border-gray-200">
                  {slots.map((slot) => (
                    <div
                      key={slot}
                      className="h-[80px] px-3 py-2 border-b border-gray-200 flex flex-col justify-center"
                    >
                      <div className="text-sm font-bold text-gray-800">Slot {slot}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {TIME_SLOTS[slot as keyof typeof TIME_SLOTS].start} - {TIME_SLOTS[slot as keyof typeof TIME_SLOTS].end}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Day Columns */}
                {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                  <div key={dayIndex} className="relative border-r border-gray-200">
                    {slots.map((slot) => (
                      <div
                        key={slot}
                        className="h-[80px] border-b border-gray-200"
                      />
                    ))}
                    
                    {/* Classes for this day */}
                    {getClassesForDay(dayIndex).map((classItem, index) => (
                      <div
                        key={index}
                        onClick={() => setViewingClass(classItem)}
                        className="absolute left-1 right-1 bg-cyan-400 rounded-lg p-3 shadow-md hover:shadow-lg hover:bg-cyan-500 transition cursor-pointer"
                        style={{
                          top: `${getSlotPosition(classItem.slot)}px`,
                          height: '76px' // Fixed height for one slot
                        }}
                      >
                        <div className="text-xs font-bold text-gray-900">{classItem.courseCode}</div>
                        <div className="text-xs text-gray-800 mt-1">{classItem.className}</div>
                        <div className="text-xs text-gray-700 mt-1">
                          Slot {classItem.slot} ({classItem.startTime}-{classItem.endTime})
                        </div>
                        <div className="text-xs text-gray-700">{classItem.room}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
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

// Class Detail Modal Component
const ClassDetailModal: React.FC<{
  classItem: ScheduleClass;
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
              <div className="text-sm text-gray-600 mb-1">Lớp học</div>
              <div className="font-semibold text-gray-900">{classItem.className}</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Phòng học</div>
              <div className="font-semibold text-gray-900">{classItem.room}</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Thứ</div>
              <div className="font-semibold text-gray-900">{daysOfWeek[classItem.dayOfWeek]}</div>
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
                {classItem.startTime} - {classItem.endTime}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {TIME_SLOTS[classItem.slot as keyof typeof TIME_SLOTS].label}
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
              onClick={() => alert('Chức năng chỉnh sửa lịch học')}
              className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium"
            >
              Chỉnh sửa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSection;
