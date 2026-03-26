import React, { useEffect, useMemo, useRef, useState } from 'react';
import '@/assets/styles/SchedulePage.css';
import courseApi from '../../../api/course.api.wrapper';
import type { CourseDto } from '../../../api/course.api';
import { hrClassService, hrScheduleService } from '../../../services/api/hr';
import type { HRSchedule, HRClassroom } from '../../../types/hr.types';

type SchedulePageProps = {
  onSchedulesChanged?: () => void;
};

export const SchedulePage: React.FC<SchedulePageProps> = ({ onSchedulesChanged }) => {
  const tableTopRef = useRef<HTMLDivElement | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchBy, setSearchBy] = useState<'course' | 'name'>('course');
  const [filterClass, setFilterClass] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newDaysOfWeek, setNewDaysOfWeek] = useState<string[]>([]);
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [newClassCode, setNewClassCode] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [newLocationType, setNewLocationType] = useState<'ONLINE' | 'OFFLINE'>('OFFLINE');
  const [newMeetingLink, setNewMeetingLink] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const [createdSchedules, setCreatedSchedules] = useState<HRSchedule[]>([]);
  const [availableCourses, setAvailableCourses] = useState<CourseDto[]>([]);
  const [availableTrainers, setAvailableTrainers] = useState<Array<{ username: string; fullName: string }>>([]);
  const [availableRooms, setAvailableRooms] = useState<HRClassroom[]>([]);

  const handleCourseChange = async (nextCourseCode: string) => {
    setNewCourseCode(nextCourseCode);
    setSelectedTrainer('');
    if (!nextCourseCode) {
      // reset to all trainers
      try { const list = await courseApi.getTrainers(); setAvailableTrainers(list); } catch { setAvailableTrainers([]); }
      return;
    }
    // Fetch only trainers for this course
    try {
      const res = await import('../../../lib/axios').then(m => m.default.get(`/hr/schedules/trainers-by-course/${nextCourseCode}`));
      const trainers = (res.data as any)?.data ?? [];
      setAvailableTrainers(trainers);
      if (trainers.length === 1) setSelectedTrainer(trainers[0].username);
    } catch {
      setAvailableTrainers([]);
    }
  };

  const toggleDayOfWeek = (value: string) => {
    setNewDaysOfWeek((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const fetchCourses = async () => {
    try {
      const res = await courseApi.getMyCourses();
      if (res?.success) setAvailableCourses(res.data);
    } catch {
      setAvailableCourses([]);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await hrScheduleService.list();
      setCreatedSchedules(res.data.data ?? []);
    } catch {
      setCreatedSchedules([]);
    }
  };

  const fetchTrainers = async () => {
    try {
      const list = await courseApi.getTrainers();
      setAvailableTrainers(list);
    } catch {
      setAvailableTrainers([]);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await hrClassService.list();
      setAvailableRooms(res.data.data ?? []);
    } catch {
      setAvailableRooms([]);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchTrainers();
    fetchSchedules();
    fetchRooms();
  }, []);

  const parseInputDate = (value: string): Date | null => {
    const raw = value?.trim();
    if (!raw) return null;

    const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
      const year = Number(isoMatch[1]);
      const month = Number(isoMatch[2]);
      const day = Number(isoMatch[3]);
      const parsed = new Date(year, month - 1, day);
      if (
        parsed.getFullYear() === year
        && parsed.getMonth() === month - 1
        && parsed.getDate() === day
      ) {
        return parsed;
      }
      return null;
    }

    const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slashMatch) {
      const first = Number(slashMatch[1]);
      const second = Number(slashMatch[2]);
      const year = Number(slashMatch[3]);
      const month = first > 12 ? second : first;
      const day = first > 12 ? first : second;
      const parsed = new Date(year, month - 1, day);
      if (
        parsed.getFullYear() === year
        && parsed.getMonth() === month - 1
        && parsed.getDate() === day
      ) {
        return parsed;
      }
      return null;
    }

    const fallback = new Date(raw);
    if (Number.isNaN(fallback.getTime())) return null;
    return new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate());
  };

  const toIsoDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const buildScheduleDates = (startDate: string, endDate: string, dayNumbers: number[]) => {
    const start = parseInputDate(startDate);
    const end = parseInputDate(endDate);
    if (!start || !end || start > end) {
      return null;
    }
    const dates: string[] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      if (dayNumbers.includes(cursor.getDay())) {
        dates.push(toIsoDate(cursor));
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return dates;
  };

  const buildScheduleGroupKey = (s: HRSchedule) => `${s.trainerUsername}|${s.courseCode}|${s.classCode || ''}`;

  const formatWeekday = (dateStr?: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '-';
    const day = d.getDay(); // 0-6
    switch (day) {
      case 1:
        return 'Thứ 2';
      case 2:
        return 'Thứ 3';
      case 3:
        return 'Thứ 4';
      case 4:
        return 'Thứ 5';
      case 5:
        return 'Thứ 6';
      case 6:
        return 'Thứ 7';
      case 0:
      default:
        return 'Chủ nhật';
    }
  };

  const filteredCreated = createdSchedules.filter((s) => {
    if (filterDate && s.date && s.date !== filterDate) return false;
    if (filterClass && s.classCode !== filterClass) return false;
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
    const scheduled = createdSchedules.filter((x) => (x.status || '').toUpperCase() === 'SCHEDULED').length;
    const completed = createdSchedules.filter((x) => (x.status || '').toUpperCase() === 'COMPLETED').length;
    const trainers = new Set(createdSchedules.map((x) => x.trainerUsername)).size;
    return { total, scheduled, completed, trainers };
  }, [createdSchedules]);

  const courseEndDateByGroup = useMemo(() => {
    const result = new Map<string, string>();
    createdSchedules.forEach((s) => {
      if (!s.date) return;
      const key = buildScheduleGroupKey(s);
      const currentMax = result.get(key);
      if (!currentMax || s.date > currentMax) {
        result.set(key, s.date);
      }
    });
    return result;
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
            <button type="button" className="schedule-btn secondary">⬇ Xuất</button>
          </div>
        </div>

        <div className="schedule-stats">
          <div className="schedule-stat-card">
            <div className="schedule-stat-icon schedule-i-green">✓</div>
            <div className="schedule-stat-meta">
              <div className="schedule-stat-value">{stats.scheduled}</div>
              <div className="schedule-stat-label">Đã lên lịch</div>
            </div>
          </div>
          <div className="schedule-stat-card">
            <div className="schedule-stat-icon schedule-i-blue"></div>
            <div className="schedule-stat-meta">
              <div className="schedule-stat-value">{stats.total}</div>
              <div className="schedule-stat-label">Tổng lịch</div>
            </div>
          </div>
          <div className="schedule-stat-card">
            <div className="schedule-stat-icon schedule-i-amber"></div>
            <div className="schedule-stat-meta">
              <div className="schedule-stat-value">{stats.completed}</div>
              <div className="schedule-stat-label">Đã hoàn thành</div>
            </div>
          </div>
          <div className="schedule-stat-card">
            <div className="schedule-stat-icon schedule-i-red"></div>
            <div className="schedule-stat-meta">
              <div className="schedule-stat-value">{stats.trainers}</div>
              <div className="schedule-stat-label">Giảng viên</div>
            </div>
          </div>
        </div>

        <div className="schedule-create-card">
          <h2 className="schedule-create-title">
            {editingId ? 'Chỉnh sửa lịch học' : 'Tạo lịch học theo Giảng viên'}
          </h2>
          <div className="schedule-create-grid">
            <div className="schedule-create-field">
              <label htmlFor="schedule-trainer">Tài khoản giảng viên</label>
              <select
                id="schedule-trainer"
                value={selectedTrainer}
                onChange={(e) => setSelectedTrainer(e.target.value)}
              >
                <option value="">Chọn giảng viên</option>
                {availableTrainers.map((t) => (
                  <option key={t.username} value={t.username}>
                    {t.fullName} ({t.username})
                  </option>
                ))}
              </select>
            </div>
            <div className="schedule-create-field">
              <label htmlFor="schedule-course-code">Mã khóa học</label>
              <select
                id="schedule-course-code"
                value={newCourseCode}
                onChange={(e) => handleCourseChange(e.target.value)}
                onFocus={() => fetchCourses()}
              >
                <option value="">Chọn khóa học</option>
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
              <label htmlFor="schedule-start-date">Ngày bắt đầu</label>
              <input
                id="schedule-start-date"
                type="date"
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
              />
            </div>
            <div className="schedule-create-field">
              <label htmlFor="schedule-end-date">Ngày kết thúc</label>
              <input
                id="schedule-end-date"
                type="date"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
              />
            </div>
            <div className="schedule-create-field schedule-create-field-full">
              <label>Các ngày trong tuần</label>
              <div className="schedule-weekday-multiselect">
                {[
                  { value: '1', label: 'T2' },
                  { value: '2', label: 'T3' },
                  { value: '3', label: 'T4' },
                  { value: '4', label: 'T5' },
                  { value: '5', label: 'T6' },
                  { value: '6', label: 'T7' },
                  { value: '0', label: 'CN' },
                ].map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    className={`schedule-weekday-chip ${
                      newDaysOfWeek.includes(d.value) ? 'active' : ''
                    }`}
                    aria-pressed={newDaysOfWeek.includes(d.value)}
                    onClick={() => toggleDayOfWeek(d.value)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="schedule-create-field">
              <label htmlFor="schedule-start-time">Giờ bắt đầu</label>
              <input
                id="schedule-start-time"
                type="time"
                value={newStartTime}
                onChange={(e) => {
                  setNewStartTime(e.target.value);
                  setFormMessage(null);
                }}
              />
            </div>
            <div className="schedule-create-field">
              <label htmlFor="schedule-end-time">Giờ kết thúc</label>
              <input
                id="schedule-end-time"
                type="time"
                value={newEndTime}
                onChange={(e) => {
                  setNewEndTime(e.target.value);
                  setFormMessage(null);
                }}
              />
            </div>
            <div className="schedule-create-field">
              <label htmlFor="schedule-class-code">Lớp học</label>
              <select
                id="schedule-class-code"
                value={newClassCode}
                onChange={(e) => setNewClassCode(e.target.value)}
              >
                <option value="">Chọn lớp học</option>
                {availableRooms
                  .filter((room) => !newCourseCode || room.courseCode === newCourseCode)
                  .map((room) => (
                  <option key={room.classCode} value={room.classCode}>
                    {room.classCode} - {room.className}
                  </option>
                ))}
              </select>
            </div>
            <div className="schedule-create-field">
              <label htmlFor="schedule-location-type">Hình thức học</label>
              <select
                id="schedule-location-type"
                value={newLocationType}
                onChange={(e) => setNewLocationType(e.target.value as 'ONLINE' | 'OFFLINE')}
              >
                <option value="OFFLINE">Offline</option>
                <option value="ONLINE">Online</option>
              </select>
            </div>
            <div className="schedule-create-field">
              <label htmlFor="schedule-class-meet">
                Phòng/Link
              </label>
              {newLocationType === 'OFFLINE' ? (
                <>
                  <input
                    id="schedule-class-meet"
                    type="text"
                    placeholder="Nhập phòng học"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                  />
                </>
              ) : (
                <>
                  <input
                    id="schedule-class-meet"
                    type="url"
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    value={newMeetingLink}
                    onChange={(e) => setNewMeetingLink(e.target.value)}
                  />
                </>
              )}
            </div>
          </div>
          <div className="schedule-create-actions">
            <button
              type="button"
              className="schedule-btn primary"
              onClick={() => {
                setFormMessage(null);
                if (
                  !selectedTrainer ||
                  !newCourseCode ||
                  !newClassCode ||
                  !newStartDate ||
                  !newEndDate ||
                  newDaysOfWeek.length === 0 ||
                  !newStartTime ||
                  !newEndTime ||
                  (newLocationType === 'OFFLINE' && !newRoom) ||
                  (newLocationType === 'ONLINE' && !newMeetingLink.trim())
                ) {
                  setFormMessage('Vui lòng nhập đầy đủ thông tin trước khi lưu.');
                  return;
                }
                const toMinutes = (t: string) => {
                  const [h, m] = t.split(':').map(Number);
                  return h * 60 + m;
                };
                if (!newEndTime || !newStartTime || toMinutes(newEndTime) <= toMinutes(newStartTime)) {
                  setFormMessage('End time phải lớn hơn Start time. (Ví dụ: bắt đầu 10:00, kết thúc 12:00)');
                  return;
                }

                const course = availableCourses.find((c) => c.code === newCourseCode);
                const courseName = course?.title || course?.name || newCourseCode;

                const targetDays = newDaysOfWeek.map((d) => Number(d)); // 0-6 (Sun-Sat)
                const generatedDates = buildScheduleDates(newStartDate, newEndDate, targetDays);
                if (!generatedDates) {
                  setFormMessage('Khoảng ngày không hợp lệ.');
                  return;
                }

                if (generatedDates.length === 0) {
                  setFormMessage(
                    'Không có buổi nào trùng thứ trong khoảng ngày đã chọn. Vui lòng kiểm tra lại Start date, End date và Weekdays.',
                  );
                  return;
                }

                const submit = async () => {
                  if (editingId) {
                    await hrScheduleService.update(editingId, {
                      trainerUsername: selectedTrainer,
                      courseCode: newCourseCode,
                      courseName,
                      classCode: newClassCode,
                      room: newLocationType === 'OFFLINE' ? newRoom : '',
                      locationType: newLocationType,
                      meetingLink: newLocationType === 'ONLINE' ? newMeetingLink.trim() : undefined,
                      date: generatedDates[0],
                      startTime: newStartTime,
                      endTime: newEndTime,
                      status: 'SCHEDULED',
                    });
                  } else {
                    await Promise.all(generatedDates.map((dateStr) => (
                      hrScheduleService.create({
                        trainerUsername: selectedTrainer,
                        courseCode: newCourseCode,
                        courseName,
                        classCode: newClassCode,
                        room: newLocationType === 'OFFLINE' ? newRoom : '',
                        locationType: newLocationType,
                        meetingLink: newLocationType === 'ONLINE' ? newMeetingLink.trim() : undefined,
                        date: dateStr,
                        startTime: newStartTime,
                        endTime: newEndTime,
                        status: 'SCHEDULED',
                      })
                    )));
                  }
                };

                submit()
                  .then(async () => {
                    await fetchSchedules();
                    onSchedulesChanged?.();
                    setFormMessage(
                      editingId
                        ? 'Đã lưu thay đổi.'
                        : `Tạo lịch thành công (${generatedDates.length} buổi). Kết thúc khoá dự kiến: ${generatedDates[generatedDates.length - 1]}.`,
                    );
                    setTimeout(() => {
                      tableTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 0);
                    setSelectedTrainer('');
                    setNewCourseCode('');
                    setNewStartDate('');
                    setNewEndDate('');
                    setNewDaysOfWeek([]);
                    setNewStartTime('');
                    setNewEndTime('');
                    setNewClassCode('');
                    setNewRoom('');
                    setNewLocationType('OFFLINE');
                    setNewMeetingLink('');
                    setEditingId(null);
                  })
                  .catch((error: any) => {
                    setFormMessage(error?.response?.data?.message || 'Không thể lưu lịch học.');
                  });
              }}
            >
              {editingId ? 'Lưu thay đổi' : 'Tạo lịch học'}
            </button>
            <button
              type="button"
              className="schedule-btn secondary"
              onClick={() => {
                setSelectedTrainer('');
                setNewCourseCode('');
                setNewStartDate('');
                setNewEndDate('');
                setNewDaysOfWeek([]);
                setNewStartTime('');
                setNewEndTime('');
                setNewClassCode('');
                setNewRoom('');
                setNewLocationType('OFFLINE');
                setNewMeetingLink('');
                setEditingId(null);
              }}
            >
              {editingId ? 'Hủy' : 'Đặt lại'}
            </button>
            {formMessage && (
              <span style={{ marginLeft: 10, fontSize: 13, color: '#555' }}>{formMessage}</span>
            )}
          </div>
        </div>
        <div className="schedule-toolbar">
          <div className="schedule-searchbar">
            <span className="schedule-search-icon"></span>
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
              {availableRooms.map((room) => (
                <option key={room.classCode} value={room.classCode}>
                  {room.classCode} - {room.className}
                </option>
              ))}
            </select>
            <input aria-label="Ngày" type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
          </div>
        </div>

        <div ref={tableTopRef} />
        <div className="schedule-table-wrap">
          <div className="schedule-table-title">Lịch học được tạo bởi HR</div>
          <table className="schedule-table">
          <thead>
            <tr>
              <th>Giảng viên</th>
              <th>Mã khóa học</th>
              <th>Tên khóa học</th>
              <th>Lớp học</th>
              <th>Thứ</th>
              <th>Ngày</th>
              <th>Kết thúc khóa</th>
              <th>Thời gian</th>
              <th>Hình thức</th>
              <th>Phòng/Link</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredCreated.map((s) => (
              <tr key={s.id}>
                <td>{s.trainerUsername}</td>
                <td>{s.courseCode}</td>
                <td>{s.courseName}</td>
                <td>{s.classCode || '-'}</td>
                <td>{formatWeekday(s.date)}</td>
                <td>{s.date ?? '-'}</td>
                <td>{courseEndDateByGroup.get(buildScheduleGroupKey(s)) || '-'}</td>
                <td>{s.startTime} - {s.endTime}</td>
                <td>{s.locationType === 'ONLINE' ? 'Online' : 'Offline'}</td>
                <td>{s.locationType === 'ONLINE' ? (s.meetingLink || '-') : (s.room || '-')}</td>
                <td>{s.status ?? 'Scheduled'}</td>
                <td>
                  <div className="schedule-row-actions">
                    <button
                      type="button"
                      className="schedule-action-btn"
                      onClick={() => {
                        setEditingId(String(s.id));
                        setSelectedTrainer(s.trainerUsername);
                        setNewCourseCode(s.courseCode);
                        setNewStartDate(s.date ?? '');
                        setNewEndDate(s.date ?? '');
                        // thiết lập thứ từ ngày hiện tại nếu có
                        if (s.date) {
                          const d = new Date(s.date);
                          if (!Number.isNaN(d.getTime())) {
                            setNewDaysOfWeek([String(d.getDay())]);
                          }
                        } else {
                          setNewDaysOfWeek([]);
                        }
                        setNewStartTime(s.startTime);
                        setNewEndTime(s.endTime);
                        setNewClassCode(s.classCode || '');
                        setNewRoom(s.room);
                        setNewLocationType(s.locationType === 'ONLINE' ? 'ONLINE' : 'OFFLINE');
                        setNewMeetingLink(s.meetingLink || '');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      className="schedule-action-btn danger"
                      onClick={async () => {
                        const ok = window.confirm('Xóa lịch học này?');
                        if (!ok) return;
                        try {
                          await hrScheduleService.remove(s.id);
                          await fetchSchedules();
                          onSchedulesChanged?.();
                          if (editingId === String(s.id)) {
                            setEditingId(null);
                          }
                        } catch (error: any) {
                          setFormMessage(error?.response?.data?.message || 'Không thể xóa lịch học.');
                        }
                      }}
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredCreated.length === 0 && (
              <tr>
                <td colSpan={12} style={{ padding: 16, color: '#666' }}>Không có dữ liệu.</td>
              </tr>
            )}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
