import { useState } from 'react';
import { mockScheduleEvents, mockCoursesList, ScheduleEvent } from '../../../mocks/mockTrainerData';

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [courses] = useState(mockCoursesList);
  const [events] = useState(mockScheduleEvents);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [filterCourse, setFilterCourse] = useState<string>('all');

  const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
  const timeSlots = Array.from({ length: 13 }, (_, i) => `${7 + i}:00`);

  const handleEventClick = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setShowEventDetail(true);
  };

  const filteredEvents = filterCourse === 'all' 
    ? events 
    : events.filter(e => e.courseCode === filterCourse);

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h2>📅 Lịch dạy</h2>
      </div>

      <div className="schedule-controls">
        <div className="date-picker">
          <label>Tuần:</label>
          <input 
            type="date" 
            className="input-field"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="course-filter">
          <label>Lọc theo khóa học:</label>
          <button 
            className={`course-tag ${filterCourse === 'all' ? 'active' : ''}`}
            onClick={() => setFilterCourse('all')}
          >
            Tất cả
          </button>
          {courses.map((course) => (
            <button 
              key={course.code} 
              className={`course-tag ${filterCourse === course.code ? 'active' : ''}`}
              onClick={() => setFilterCourse(course.code)}
            >
              {course.code}
            </button>
          ))}
        </div>
      </div>

      <div className="schedule-summary">
        <div className="summary-item">
          <span className="summary-label">Tổng số buổi học:</span>
          <span className="summary-value">{filteredEvents.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Tuần này:</span>
          <span className="summary-value">{filteredEvents.length} buổi</span>
        </div>
      </div>

      <div className="calendar-view">
        <div className="calendar-grid">
          <div className="time-column">
            <div className="time-header"></div>
            {timeSlots.map((time) => (
              <div key={time} className="time-slot">
                {time}
              </div>
            ))}
          </div>

          {daysOfWeek.map((day, dayIndex) => (
            <div key={day} className="day-column">
              <div className="day-header">{day}</div>
              <div className="day-events">
                {filteredEvents
                  .filter((event) => event.day === dayIndex + 2)
                  .map((event) => {
                    const startHour = parseInt(event.startTime.split(':')[0]);
                    const endHour = parseInt(event.endTime.split(':')[0]);
                    const top = (startHour - 7) * 60;
                    const height = (endHour - startHour) * 60;

                    return (
                      <div
                        key={event.id}
                        className="calendar-event"
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          backgroundColor: event.color || '#60D5F2'
                        }}
                        onClick={() => handleEventClick(event)}
                      >
                        <div className="event-code">{event.courseCode}</div>
                        <div className="event-name">{event.courseName}</div>
                        <div className="event-room">{event.room}</div>
                        <div className="event-time">{event.startTime} - {event.endTime}</div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Detail Modal */}
      {showEventDetail && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowEventDetail(false)}>
          <div className="modal-content event-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowEventDetail(false)}>✕</button>
            
            <div className="event-detail-header">
              <div className="event-detail-icon" style={{ backgroundColor: selectedEvent.color }}>
                📚
              </div>
              <div>
                <h2>{selectedEvent.courseName}</h2>
                <span className="event-code-badge">{selectedEvent.courseCode}</span>
              </div>
            </div>

            <div className="event-detail-body">
              <div className="detail-section">
                <h3>📍 Thông tin lịch học</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Phòng học:</span>
                    <span className="detail-value">{selectedEvent.room}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ngày:</span>
                    <span className="detail-value">{daysOfWeek[selectedEvent.day - 2]}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Giờ bắt đầu:</span>
                    <span className="detail-value">{selectedEvent.startTime}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Giờ kết thúc:</span>
                    <span className="detail-value">{selectedEvent.endTime}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Thời lượng:</span>
                    <span className="detail-value">
                      {parseInt(selectedEvent.endTime) - parseInt(selectedEvent.startTime)} giờ
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>👥 Học viên</h3>
                <p>Số lượng: {courses.find(c => c.code === selectedEvent.courseCode)?.students || 0} học viên</p>
              </div>

              <div className="detail-actions">
                <button className="btn-secondary" onClick={() => setShowEventDetail(false)}>
                  Đóng
                </button>
                <button className="btn-primary">Điểm danh</button>
                <button className="btn-primary">Xem tài liệu</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
