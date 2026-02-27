import { useState, useEffect } from 'react';
import { mockStudents, mockCoursesList, Student } from '../../../mocks/mockTrainerData';

export default function Attendance() {
  const [selectedCourse, setSelectedCourse] = useState(mockCoursesList[0]?.code || '');
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isToday, setIsToday] = useState(true);

  // Check if selected date is today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setIsToday(selectedDate === today);
    
    // Reset attendance when changing date
    if (selectedDate !== today) {
      setStudents(students.map(s => ({ ...s, attendance: null })));
      setHasChanges(false);
    }
  }, [selectedDate]);

  const handleDateChange = (newDate: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    if (newDate !== today) {
      alert('⚠️ Chỉ có thể điểm danh cho ngày hôm nay!\n\nNgày hôm nay: ' + formatDate(today));
      return;
    }
    
    setSelectedDate(newDate);
  };

  const handleAttendance = (studentId: string, status: 'present' | 'absent') => {
    if (!isToday) {
      alert('⚠️ Chỉ có thể điểm danh cho ngày hôm nay!');
      return;
    }
    
    setStudents(
      students.map((s) => (s.id === studentId ? { ...s, attendance: status } : s))
    );
    setHasChanges(true);
  };

  const handleSaveAttendance = async () => {
    if (!isToday) {
      alert('⚠️ Chỉ có thể lưu điểm danh cho ngày hôm nay!');
      return;
    }

    if (!hasChanges) {
      alert('Không có thay đổi nào để lưu');
      return;
    }

    const attendedCount = students.filter(s => s.attendance === 'present').length;
    const absentCount = students.filter(s => s.attendance === 'absent').length;
    const notMarkedCount = students.filter(s => s.attendance === null).length;

    if (notMarkedCount > 0) {
      if (!confirm(`Còn ${notMarkedCount} học viên chưa điểm danh. Bạn có muốn tiếp tục lưu?`)) {
        return;
      }
    }

    setIsSaving(true);
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    setShowSuccess(true);
    setHasChanges(false);
    
    setTimeout(() => setShowSuccess(false), 3000);
    
    console.log('Saved attendance:', {
      course: selectedCourse,
      date: selectedDate,
      attended: attendedCount,
      absent: absentCount,
      students: students.filter(s => s.attendance !== null)
    });
  };

  const handleResetAttendance = () => {
    if (!isToday) {
      alert('⚠️ Chỉ có thể reset điểm danh cho ngày hôm nay!');
      return;
    }
    
    if (confirm('Bạn có chắc muốn reset tất cả điểm danh?')) {
      setStudents(students.map(s => ({ ...s, attendance: null })));
      setHasChanges(false);
    }
  };

  const handleMarkAllPresent = () => {
    if (!isToday) {
      alert('⚠️ Chỉ có thể điểm danh cho ngày hôm nay!');
      return;
    }
    
    setStudents(students.map(s => ({ ...s, attendance: 'present' })));
    setHasChanges(true);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const attendedCount = students.filter(s => s.attendance === 'present').length;
  const absentCount = students.filter(s => s.attendance === 'absent').length;
  const attendanceRate = students.length > 0 
    ? ((attendedCount / students.length) * 100).toFixed(1) 
    : 0;

  return (
    <div className="attendance-container">
      <div className="section-header">
        <h2>✅ Điểm danh</h2>
        <div className="header-actions">
          {hasChanges && isToday && (
            <button className="btn-secondary" onClick={handleResetAttendance}>
              🔄 Reset
            </button>
          )}
          <button 
            className="btn-primary" 
            onClick={handleSaveAttendance}
            disabled={isSaving || !hasChanges || !isToday}
          >
            {isSaving ? '⏳ Đang lưu...' : '💾 Lưu điểm danh'}
          </button>
        </div>
      </div>

      {showSuccess && (
        <div className="success-message">
          <span className="success-icon">✅</span>
          <span>Lưu điểm danh thành công!</span>
        </div>
      )}

      {!isToday && (
        <div className="warning-message">
          <span className="warning-icon">⚠️</span>
          <span>
            Bạn đang xem ngày {formatDate(selectedDate)}. 
            Chỉ có thể điểm danh cho ngày hôm nay ({formatDate(currentDate)}).
          </span>
        </div>
      )}

      <div className="attendance-controls">
        <div className="control-group">
          <label>Chọn khóa học:</label>
          <select
            className="select-field"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            {mockCoursesList.map((course) => (
              <option key={course.code} value={course.code}>
                {course.code} - {course.name} ({course.students} học viên)
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Ngày điểm danh:</label>
          <div className="date-input-wrapper">
            <input
              type="date"
              className="input-field"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              max={currentDate}
            />
            {!isToday && (
              <span className="date-warning">⚠️ Chỉ điểm danh hôm nay</span>
            )}
          </div>
        </div>

        <button 
          className="btn-secondary" 
          onClick={handleMarkAllPresent}
          disabled={!isToday}
        >
          ✓ Điểm danh tất cả
        </button>
      </div>

      <div className="attendance-stats">
        <div className="stat-card present">
          <div className="stat-value">{attendedCount}</div>
          <div className="stat-label">Có mặt</div>
        </div>
        <div className="stat-card absent">
          <div className="stat-value">{absentCount}</div>
          <div className="stat-label">Vắng mặt</div>
        </div>
        <div className="stat-card rate">
          <div className="stat-value">{attendanceRate}%</div>
          <div className="stat-label">Tỷ lệ tham gia</div>
        </div>
      </div>

      <div className="attendance-table">
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Họ và tên</th>
              <th>Ngày sinh</th>
              <th>Email</th>
              <th>Điểm danh</th>
              <th>Ảnh</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id} className={student.attendance || ''}>
                <td>{index + 1}</td>
                <td>{student.name}</td>
                <td>{student.dob}</td>
                <td>{student.email}</td>
                <td>
                  <div className="attendance-buttons">
                    <button
                      className={`attendance-btn ${
                        student.attendance === 'present' ? 'present' : ''
                      }`}
                      onClick={() => handleAttendance(student.id, 'present')}
                      disabled={!isToday}
                    >
                      ✓ Có mặt
                    </button>
                    <button
                      className={`attendance-btn ${
                        student.attendance === 'absent' ? 'absent' : ''
                      }`}
                      onClick={() => handleAttendance(student.id, 'absent')}
                      disabled={!isToday}
                    >
                      ✗ Vắng
                    </button>
                  </div>
                </td>
                <td>
                  <div className="student-avatar">
                    {student.avatar || '👤'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
