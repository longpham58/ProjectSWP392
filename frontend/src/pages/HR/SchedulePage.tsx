import React, { useEffect, useMemo, useRef, useState } from 'react';
import '../../assets/styles/SchedulePage.css';
import { mockUsers } from '../../mocks/mockAuthData';
import { addTrainerSchedule, deleteTrainerSchedule, getAllTrainerSchedules, updateTrainerSchedule } from '../../mocks/mockScheduleStorage';
import courseApi from '../../api/course.api.wrapper';
import type { CourseDto } from '../../api/course.api';

const MOCK_TRAINERS = mockUsers
  .filter((u) => (u.roles || []).includes('TRAINER'))
  .map((u) => ({ id: String(u.id), fullName: u.fullName, username: u.username }));

export const SchedulePage: React.FC = () => {
  const tableTopRef = useRef<HTMLDivElement | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchBy, setSearchBy] = useState<'course' | 'name'>('course');
  const [filterClass, setFilterClass] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const [createdSchedules, setCreatedSchedules] = useState(() => getAllTrainerSchedules());
  const [availableCourses, setAvailableCourses] = useState<CourseDto[]>([]);

  const fetchCourses = async () => {
    try {
      const res = await courseApi.getMyCourses();
      if (res?.success) setAvailableCourses(res.data);
    } catch {
      // ignore in mock UI
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredCreated = createdSchedules.filter((s) => {
    if (filterDate && s.date && s.date !== filterDate) return false;
    if (filterClass && s.room !== filterClass) return false;
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      const match = searchBy === 'course'
        ? s.courseCode.toLowerCase().includes(kw)
        : s.courseName.toLowerCase().includes(kw);
      if (!match) return false;
    }
    return true;
  });

  const stats = useMemo(() => {
    const total = createdSchedules.length;
    const scheduled = createdSchedules.filter((x) => (x.status || 'Scheduled') === 'Scheduled').length;
    const completed = createdSchedules.filter((x) => x.status === 'Completed').length;
    const trainers = new Set(createdSchedules.map((x) => x.trainerUsername)).size;
    return { total, scheduled, completed, trainers };
  }, [createdSchedules]);

  return (
    <div className="schedule-page">
      <div className="schedule-scroll-area">
        <div className="schedule-topbar">
          <div className="schedule-topbar-left">
            <h1 className="schedule-page-title">Quản lý lịch học</h1>
            <div className="schedule-subtitle">Tạo lịch dạy theo trainer và theo dõi lịch đã tạo</div>
          </div>
          <div className="schedule-topbar-actions">
            <button type="button" className="schedule-btn secondary">⬇ Export</button>
          </div>
        </div>

        <div className="schedule-stats">
          <div className="schedule-stat-card">
            <div className="schedule-stat-icon schedule-i-green">✓</div>
            <div className="schedule-stat-meta">
              <div className="schedule-stat-value">{stats.scheduled}</div>
              <div className="schedule-stat-label">Scheduled</div>
            </div>
          </div>
          <div className="schedule-stat-card">
            <div className="schedule-stat-icon schedule-i-blue">🗓</div>
            <div className="schedule-stat-meta">
              <div className="schedule-stat-value">{stats.total}</div>
              <div className="schedule-stat-label">Tổng lịch</div>
            </div>
          </div>
          <div className="schedule-stat-card">
            <div className="schedule-stat-icon schedule-i-amber">🏁</div>
            <div className="schedule-stat-meta">
              <div className="schedule-stat-value">{stats.completed}</div>
              <div className="schedule-stat-label">Completed</div>
            </div>
          </div>
          <div className="schedule-stat-card">
            <div className="schedule-stat-icon schedule-i-red">👤</div>
            <div className="schedule-stat-meta">
              <div className="schedule-stat-value">{stats.trainers}</div>
              <div className="schedule-stat-label">Trainer</div>
            </div>
          </div>
        </div>

        <div className="schedule-create-card">
          <h2 className="schedule-create-title">
            {editingId ? 'Edit learning schedule' : 'Create learning schedule per Trainer'}
          </h2>
          <div className="schedule-create-grid">
            <div className="schedule-create-field">
              <label htmlFor="schedule-trainer">Trainer account</label>
              <select
                id="schedule-trainer"
                value={selectedTrainer}
                onChange={(e) => setSelectedTrainer(e.target.value)}
              >
                <option value="">Choose trainer</option>
                {MOCK_TRAINERS.map((t) => (
                  <option key={t.id} value={t.username}>
                    {t.fullName} ({t.username})
                  </option>
                ))}
              </select>
            </div>
            <div className="schedule-create-field">
              <label htmlFor="schedule-course-code">Course code</label>
              <select
                id="schedule-course-code"
                value={newCourseCode}
                onChange={(e) => setNewCourseCode(e.target.value)}
                onFocus={() => fetchCourses()}
              >
                <option value="">Choose course</option>
                {newCourseCode && !availableCourses.some((c) => c.code === newCourseCode) && (
                  <option value={newCourseCode}>{newCourseCode}</option>
                )}
                {availableCourses.map((c) => (
                  <option key={c.id} value={c.code || `ITMS-${String(c.id).padStart(3, '0')}`}>
                    {(c.code || `ITMS-${String(c.id).padStart(3, '0')}`)} - {c.title || c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="schedule-create-field">
              <label htmlFor="schedule-date-new">Date</label>
              <input
                id="schedule-date-new"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>
            <div className="schedule-create-field">
              <label htmlFor="schedule-start-time">Start time</label>
              <input
                id="schedule-start-time"
                type="time"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
              />
            </div>
            <div className="schedule-create-field">
              <label htmlFor="schedule-end-time">End time</label>
              <input
                id="schedule-end-time"
                type="time"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
              />
            </div>
            <div className="schedule-create-field">
              <label htmlFor="schedule-room-new">Room</label>
              <input
                id="schedule-room-new"
                type="text"
                placeholder="Zoom / Phòng 100..."
                value={newRoom}
                onChange={(e) => setNewRoom(e.target.value)}
              />
            </div>
          </div>
          <div className="schedule-create-actions">
            <button
              type="button"
              className="schedule-btn primary"
              onClick={() => {
                setFormMessage(null);
                if (!selectedTrainer || !newCourseCode || !newDate || !newStartTime || !newEndTime || !newRoom) {
                  setFormMessage('Vui lòng nhập đầy đủ thông tin trước khi lưu.');
                  return;
                }
                if (newEndTime <= newStartTime) {
                  setFormMessage('End time phải lớn hơn Start time.');
                  return;
                }

                const course = availableCourses.find((c) => c.code === newCourseCode);
                const courseName = course?.title || course?.name || newCourseCode;

                if (editingId) {
                  updateTrainerSchedule(editingId, {
                    trainerUsername: selectedTrainer,
                    courseCode: newCourseCode,
                    courseName,
                    room: newRoom,
                    date: newDate,
                    startTime: newStartTime,
                    endTime: newEndTime,
                  });
                } else {
                  addTrainerSchedule({
                    trainerUsername: selectedTrainer,
                    courseCode: newCourseCode,
                    courseName,
                    room: newRoom,
                    date: newDate,
                    startTime: newStartTime,
                    endTime: newEndTime,
                    status: 'Scheduled',
                    color: '#60D5F2',
                  });
                }

                setCreatedSchedules(getAllTrainerSchedules());
                setFormMessage(editingId ? 'Đã lưu thay đổi.' : 'Tạo lịch thành công.');
                setTimeout(() => {
                  tableTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 0);

                // reset form
                setSelectedTrainer('');
                setNewCourseCode('');
                setNewDate('');
                setNewStartTime('');
                setNewEndTime('');
                setNewRoom('');
                setEditingId(null);
              }}
            >
              {editingId ? 'Save changes' : 'Create schedule'}
            </button>
            <button
              type="button"
              className="schedule-btn secondary"
              onClick={() => {
                setSelectedTrainer('');
                setNewCourseCode('');
                setNewDate('');
                setNewStartTime('');
                setNewEndTime('');
                setNewRoom('');
                setEditingId(null);
              }}
            >
              {editingId ? 'Cancel' : 'Reset'}
            </button>
            {formMessage && (
              <span style={{ marginLeft: 10, fontSize: 13, color: '#555' }}>{formMessage}</span>
            )}
          </div>
        </div>
        <div className="schedule-toolbar">
          <div className="schedule-searchbar">
            <span className="schedule-search-icon">🔎</span>
            <input
              id="schedule-search"
              type="text"
              placeholder={searchBy === 'course' ? 'Tìm theo mã khoá học...' : 'Tìm theo tên khoá học...'}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
          <div className="schedule-filters-inline">
            <div className="schedule-seg" role="group" aria-label="Search by">
              <button
                type="button"
                className={`schedule-seg-btn ${searchBy === 'course' ? 'active' : ''}`}
                onClick={() => setSearchBy('course')}
              >
                Mã
              </button>
              <button
                type="button"
                className={`schedule-seg-btn ${searchBy === 'name' ? 'active' : ''}`}
                onClick={() => setSearchBy('name')}
              >
                Tên
              </button>
            </div>
            <select aria-label="Lớp" value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
              <option value="">Tất cả lớp</option>
              <option value="Zoom">Zoom</option>
              <option value="Phòng 100">Phòng 100</option>
            </select>
            <input aria-label="Ngày" type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
          </div>
        </div>

        <div ref={tableTopRef} />
        <div className="schedule-table-wrap">
          <div className="schedule-table-title">Schedules created by HR (mock)</div>
          <table className="schedule-table">
          <thead>
            <tr>
              <th>Trainer</th>
              <th>Course code</th>
              <th>Course name</th>
              <th>Date</th>
              <th>Time</th>
              <th>Room</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCreated.map((s) => (
              <tr key={s.id}>
                <td>{s.trainerUsername}</td>
                <td>{s.courseCode}</td>
                <td>{s.courseName}</td>
                <td>{s.date ?? '-'}</td>
                <td>{s.startTime} - {s.endTime}</td>
                <td>{s.room}</td>
                <td>{s.status ?? 'Scheduled'}</td>
                <td>
                  <div className="schedule-row-actions">
                    <button
                      type="button"
                      className="schedule-action-btn"
                      onClick={() => {
                        setEditingId(s.id);
                        setSelectedTrainer(s.trainerUsername);
                        setNewCourseCode(s.courseCode);
                        setNewDate(s.date ?? '');
                        setNewStartTime(s.startTime);
                        setNewEndTime(s.endTime);
                        setNewRoom(s.room);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="schedule-action-btn danger"
                      onClick={() => {
                        const ok = window.confirm('Delete this schedule?');
                        if (!ok) return;
                        deleteTrainerSchedule(s.id);
                        setCreatedSchedules(getAllTrainerSchedules());
                        if (editingId === s.id) {
                          setEditingId(null);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
