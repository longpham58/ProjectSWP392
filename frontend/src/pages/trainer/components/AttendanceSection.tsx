import React, { useState } from 'react';
import { mockClassSessions, mockStudents, AttendanceRecord } from '../../../data/mockTrainerData';

const AttendanceSection: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('SE15D09');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(
    mockClassSessions[0].attendanceRecords
  );
  const [isSaved, setIsSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleAttendanceChange = (studentId: number, status: 'PRESENT' | 'ABSENT') => {
    setAttendanceRecords(records =>
      records.map(record =>
        record.studentId === studentId ? { ...record, status } : record
      )
    );
    setHasChanges(true);
    setIsSaved(false);
  };

  const handleSave = () => {
    // Simulate API call
    setTimeout(() => {
      setIsSaved(true);
      setHasChanges(false);
      alert('Đã lưu điểm danh thành công!');
    }, 500);
  };

  const getAttendanceStatus = (studentId: number) => {
    const record = attendanceRecords.find(r => r.studentId === studentId);
    return record?.status || 'ABSENT';
  };

  const presentCount = attendanceRecords.filter(r => r.status === 'PRESENT').length;
  const absentCount = attendanceRecords.filter(r => r.status === 'ABSENT').length;
  const attendanceRate = ((presentCount / attendanceRecords.length) * 100).toFixed(1);

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
              <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
            </div>
          </div>
          <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium">
            Attendance
          </button>
        </div>
      </div>

      {/* Class Selector */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="SE15D09">SE15D09</option>
              <option value="ITM5001-M01">ITM5001-M01</option>
              <option value="ITM5002-M02">ITM5002-M02</option>
            </select>
            <div className="text-sm text-gray-600">
              Ngày: {new Date().toLocaleDateString('vi-VN')}
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{presentCount}</div>
              <div className="text-xs text-gray-600">Có mặt</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{absentCount}</div>
              <div className="text-xs text-gray-600">Vắng</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{attendanceRate}%</div>
              <div className="text-xs text-gray-600">Tỷ lệ</div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="px-6 py-4 text-left font-semibold">STT</th>
              <th className="px-6 py-4 text-left font-semibold">Name</th>
              <th className="px-6 py-4 text-left font-semibold">Date of Birth</th>
              <th className="px-6 py-4 text-left font-semibold">Email</th>
              <th className="px-6 py-4 text-center font-semibold">Attendance</th>
              <th className="px-6 py-4 text-center font-semibold">Image</th>
            </tr>
          </thead>
          <tbody>
            {mockStudents.map((student, index) => {
              const status = getAttendanceStatus(student.id);
              return (
                <tr key={student.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 text-gray-600">{student.dateOfBirth}</td>
                  <td className="px-6 py-4 text-gray-600">{student.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`attendance-${student.id}`}
                          checked={status === 'PRESENT'}
                          onChange={() => handleAttendanceChange(student.id, 'PRESENT')}
                          className="w-4 h-4 text-green-600"
                        />
                        <span className="text-sm">Present</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`attendance-${student.id}`}
                          checked={status === 'ABSENT'}
                          onChange={() => handleAttendanceChange(student.id, 'ABSENT')}
                          className="w-4 h-4 text-red-600"
                        />
                        <span className="text-sm">Absent</span>
                      </label>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold">
                        {student.name.charAt(0)}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {hasChanges && !isSaved && (
            <span className="text-orange-600 text-sm flex items-center gap-2">
              Có thay đổi chưa lưu
            </span>
          )}
          {isSaved && (
            <span className="text-green-600 text-sm flex items-center gap-2">
              Đã lưu thành công
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              setAttendanceRecords(mockClassSessions[0].attendanceRecords);
              setHasChanges(false);
              setIsSaved(false);
            }}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            disabled={!hasChanges}
          >
            Reset
          </button>
          <button 
            onClick={handleSave}
            className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!hasChanges}
          >
            Save Attendance
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSection;
