import { useEffect, useMemo, useState } from 'react';
import { mockCoursesList, ScheduleEvent } from '../../../mocks/mockTrainerData';
import { useAuthStore } from '../../../stores/auth.store';
import { getTrainerScheduleEvents, SCHEDULES_UPDATED_EVENT } from '../../../mocks/mockScheduleStorage';

export default function Schedule() {
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [courses] = useState(mockCoursesList);
  const [events, setEvents] = useState<ScheduleEvent[]>(() => getTrainerScheduleEvents(user?.username ?? ''));
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [filterCourse, setFilterCourse] = useState<string>('all');

  const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
  const timeSlots = Array.from({ length: 13 }, (_, i) => `${7 + i}:00`);
  const dayStartMinutes = 7 * 60;
  const dayEndMinutes = (7 + timeSlots.length) * 60; // 20:00

  const parseTimeToMinutes = (time: string): number | null => {
    // expected HH:mm
    const parts = time.split(':');
    if (parts.length < 2) return null;
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
    if (h < 0 || h > 23 || m < 0 || m > 59) return null;
    return h * 60 + m;
  };

  const handleEventClick = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setShowEventDetail(true);
  };

  useEffect(() => {
    setEvents(getTrainerScheduleEvents(user?.username ?? ''));
  }, [user?.username]);

  useEffect(() => {
    const refresh = () => setEvents(getTrainerScheduleEvents(user?.username ?? ''));
    window.addEventListener(SCHEDULES_UPDATED_EVENT, refresh as EventListener);
    return () => window.removeEventListener(SCHEDULES_UPDATED_EVENT, refresh as EventListener);
  }, [user?.username]);

  const availableCourseCodes = useMemo(() => {
    const codes = new Set<string>();
    events.forEach((e) => codes.add(e.courseCode));
    return Array.from(codes);
  }, [events]);

  const filteredEvents = filterCourse === 'all'
    ? events
    : events.filter((e) => e.courseCode === filterCourse);

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
          {availableCourseCodes.length > 0 ? (
            availableCourseCodes.map((code) => (
              <button
                key={code}
                className={`course-tag ${filterCourse === code ? 'active' : ''}`}
                onClick={() => setFilterCourse(code)}
              >
                {code}
              </button>
            ))
          ) : (
            courses.map((course) => (
            <button 
              key={course.code} 
              className={`course-tag ${filterCourse === course.code ? 'active' : ''}`}
              onClick={() => setFilterCourse(course.code)}
            >
              {course.code}
            </button>
            ))
          )}
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
                    const startMin = parseTimeToMinutes(event.startTime);
                    const endMin = parseTimeToMinutes(event.endTime);
                    if (startMin === null || endMin === null || endMin <= startMin) return null;

                    const clampedStart = Math.max(startMin, dayStartMinutes);
                    const clampedEnd = Math.min(endMin, dayEndMinutes);
                    if (clampedEnd <= clampedStart) return null;

                    const top = clampedStart - dayStartMinutes;
                    const height = clampedEnd - clampedStart;

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
                      {(() => {
                        const s = parseTimeToMinutes(selectedEvent.startTime);
                        const e = parseTimeToMinutes(selectedEvent.endTime);
                        if (s === null || e === null || e <= s) return '-';
                        const mins = e - s;
                        const h = Math.floor(mins / 60);
                        const m = mins % 60;
                        return `${h > 0 ? `${h} giờ ` : ''}${m} phút`.trim();
                      })()}
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
