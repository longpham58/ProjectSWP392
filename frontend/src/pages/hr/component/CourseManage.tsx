import React, { useEffect, useMemo, useState } from 'react';
import '@/assets/styles/CourseManagePage.css';
import courseApi, { type HrTrainerOption } from '../../../api/course.api.wrapper';
import type { CourseDto } from '../../../api/course.api';

type CourseManagePageProps = {
  onCoursesChanged?: (newCourseId?: number) => void;
};

export const CourseManagePage: React.FC<CourseManagePageProps> = ({ onCoursesChanged }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchSchedule, setSearchSchedule] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCode, setFilterCode] = useState('');

  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [trainers, setTrainers] = useState<HrTrainerOption[]>([]);

  const [formCode, setFormCode] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Programming');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState('DRAFT');
  const [formDepartment, setFormDepartment] = useState('IT Department');
  const [formTrainerUsername, setFormTrainerUsername] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string>('');

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await courseApi.getMyCourses();
      if (res.success) setCourses(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    courseApi.getTrainers().then((list) => {
      setTrainers(list);
      if (!formTrainerUsername && list.length > 0) {
        setFormTrainerUsername(list[0].username);
      }
    }).catch(() => {
      setTrainers([]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const code = (c.code || `ITMS-${c.id}`).toLowerCase();
      const name = (c.title || c.name || '').toLowerCase();
      if (filterStatus && (c.status || '').toLowerCase() !== filterStatus.toLowerCase()) return false;
      if (filterCode && !code.includes(filterCode.toLowerCase())) return false;
      if (searchSchedule && !name.includes(searchSchedule.toLowerCase())) return false;
      return true;
    });
  }, [courses, filterStatus, filterCode, searchSchedule]);

  const stats = useMemo(() => {
    const total = courses.length;
    const active = courses.filter((c) => (c.status || '').toLowerCase() === 'active').length;
    const draft = courses.filter((c) => (c.status || '').toLowerCase() === 'draft').length;
    const inactive = courses.filter((c) => (c.status || '').toLowerCase() === 'inactive').length;
    return { total, active, draft, inactive };
  }, [courses]);

  const openCreateModal = () => {
    setEditingId(null);
    setFormError('');
    setFormCode('');
    setFormTitle('');
    setFormCategory('Programming');
    setFormDescription('');
    setFormStatus('DRAFT');
    setFormDepartment('IT Department');
    setFormTrainerUsername(trainers[0]?.username || '');
    setModalOpen(true);
  };

  return (
    <div className="course-manage-page">
      <div className="course-topbar">
        <div className="course-topbar-left">
          <h1 className="course-manage-title">Danh sách khoá học</h1>
          <div className="course-subtitle">Tạo, cập nhật và theo dõi khoá học trong hệ thống</div>
        </div>
        <div className="course-topbar-actions">
          <button type="button" className="course-action-btn secondary">⬇ Xuất</button>
          <button type="button" className="course-action-btn secondary">⬆ Nhập</button>
          <button type="button" className="course-action-btn primary" onClick={openCreateModal}>
            + Thêm khoá học
          </button>
        </div>
      </div>

      <div className="course-stats">
        <div className="course-stat-card">
          <div className="course-stat-icon course-i-green">✓</div>
          <div className="course-stat-meta">
            <div className="course-stat-value">{stats.active}</div>
            <div className="course-stat-label">Đang hoạt động</div>
          </div>
        </div>
        <div className="course-stat-card">
          <div className="course-stat-icon course-i-blue"></div>
          <div className="course-stat-meta">
            <div className="course-stat-value">{stats.total}</div>
            <div className="course-stat-label">Tổng khoá học</div>
          </div>
        </div>
        <div className="course-stat-card">
          <div className="course-stat-icon course-i-amber">✎</div>
          <div className="course-stat-meta">
            <div className="course-stat-value">{stats.draft}</div>
            <div className="course-stat-label">Nháp</div>
          </div>
        </div>
        <div className="course-stat-card">
          <div className="course-stat-icon course-i-red">⏸</div>
          <div className="course-stat-meta">
            <div className="course-stat-value">{stats.inactive}</div>
            <div className="course-stat-label">Không hoạt động</div>
          </div>
        </div>
      </div>

      <div className="course-toolbar">
        <div className="course-search">
          <span className="course-search-icon"></span>
          <input
            id="course-search"
            type="text"
            placeholder="Tìm kiếm theo tên khoá học..."
            value={searchSchedule}
            onChange={(e) => setSearchSchedule(e.target.value)}
          />
        </div>
        <div className="course-filters-inline">
          <select aria-label="Trạng thái" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <input
            aria-label="Mã khoá học"
            type="text"
            placeholder="Mã khoá học..."
            value={filterCode}
            onChange={(e) => setFilterCode(e.target.value)}
          />
        </div>
      </div>
      <div className="course-table-wrap">
        <table className="course-table">
          <thead>
            <tr>
              <th>Mã khoá học</th>
              <th>Tên khoá học</th>
              <th>Phòng ban</th>
              <th>Giảng viên</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td>{c.code || `ITMS-${String(c.id).padStart(3, '0')}`}</td>
                <td>{c.title || c.name}</td>
                <td>{c.departmentName || '-'}</td>
                <td>{c.trainerName || '-'}</td>
                <td>
                  <span className={`course-status course-status-${(c.status || 'draft').toLowerCase()}`}>
                    {c.status}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="course-icon-btn"
                    title="Edit"
                    onClick={() => {
                      setEditingId(c.id);
                      setModalOpen(true);
                      setFormCode(c.code || '');
                      setFormTitle(c.title || c.name || '');
                      setFormCategory(c.category || 'Programming');
                      setFormDescription(c.description || '');
                      setFormStatus(c.status || 'DRAFT');
                      setFormDepartment(c.departmentName || 'IT Department');
                      setFormTrainerUsername(c.trainerUsername || 'trainer001');
                    }}
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    className="course-icon-btn"
                    title="Xóa"
                    onClick={async () => {
                      const ok = window.confirm('Xóa khóa học này?');
                      if (!ok) return;
                      try {
                        await courseApi.deleteCourse(c.id);
                        setCourses((prev) => prev.filter((x) => x.id !== c.id));
                        onCoursesChanged?.();
                      } catch (err: any) {
                        setFormError(err?.response?.data?.message || 'Không thể xóa khoá học.');
                      }
                    }}
                  >
                    
                  </button>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: 16, color: '#666' }}>
                  Không có dữ liệu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="course-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="course-modal" onClick={(e) => e.stopPropagation()}>
            <div className="course-modal-header">
              <h3>{editingId ? 'Sửa khoá học' : 'Thêm khoá học'}</h3>
              <button type="button" className="course-modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <form
              className="course-modal-form"
              onSubmit={async (e) => {
                e.preventDefault();
                setFormError('');
                if (!formTitle.trim()) return;
                const trainer = trainers.find((t) => t.username === formTrainerUsername);
                try {
                  if (editingId) {
                    await courseApi.updateCourse(editingId, {
                      code: formCode.trim() || undefined,
                      title: formTitle.trim(),
                      name: formTitle.trim(),
                      category: formCategory,
                      description: formDescription,
                      status: formStatus,
                      trainerName: trainer?.fullName || '',
                      trainerUsername: trainer?.username,
                      departmentName: formDepartment,
                    });
                    await fetchCourses();
                    onCoursesChanged?.();
                  } else {
                    const created = await courseApi.addCourse({
                    code: formCode.trim() || undefined,
                    title: formTitle.trim(),
                    name: formTitle.trim(),
                    category: formCategory,
                    description: formDescription,
                    status: formStatus,
                    trainerName: trainer?.fullName || '',
                    trainerUsername: trainer?.username,
                    departmentName: formDepartment,
                    });
                    await fetchCourses();
                    onCoursesChanged?.(created?.id);
                  }
                  setModalOpen(false);
                  setFormCode('');
                  setFormTitle('');
                  setFormCategory('Programming');
                  setFormDescription('');
                  setFormStatus('DRAFT');
                  setFormDepartment('IT Department');
                  setFormTrainerUsername(trainers[0]?.username || '');
                  setEditingId(null);
                } catch (err: any) {
                  const message = err?.response?.data?.message || 'Không thể lưu khoá học.';
                  setFormError(message);
                }
              }}
            >
              <div className="course-form-row">
                <div className="course-form-field">
                  <label>Giảng viên phụ trách</label>
                  <select
                    value={formTrainerUsername}
                    onChange={(e) => setFormTrainerUsername(e.target.value)}
                  >
                    <option value="">Chọn giảng viên</option>
                    {trainers.map((t) => (
                      <option key={t.username} value={t.username}>
                        {t.fullName} ({t.username})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="course-form-field">
                <label>Mã khoá học</label>
                <input
                  type="text"
                  placeholder="Nhập mã khoá học"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                />
              </div>
              <div className="course-form-field">
                <label>Tên khoá học</label>
                <input
                  type="text"
                  placeholder="Nhập tên khoá học"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
              </div>
              <div className="course-form-field">
                <label>Danh mục</label>
                <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
                  <option value="Programming">Lập trình</option>
                  <option value="Management">Quản lý</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Data Science">Data Science</option>
                </select>
              </div>
              <div className="course-form-field">
                <label>Mô tả</label>
                <textarea
                  placeholder="Nhập mô tả"
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>
              <div className="course-form-row">
                <div className="course-form-field">
                  <label>Phòng ban</label>
                  <input value={formDepartment} onChange={(e) => setFormDepartment(e.target.value)} />
                </div>
              </div>
              <div className="course-form-field">
                <label>Trạng thái</label>
                <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              <div className="course-modal-actions">
                <button type="button" className="course-btn secondary" onClick={() => { setModalOpen(false); setEditingId(null); }}>Hủy</button>
                <button type="submit" className="course-btn primary">{editingId ? 'Lưu' : 'Thêm khoá học'}</button>
              </div>
              {formError && (
                <div style={{ color: '#dc2626', fontSize: 13, marginTop: 8 }}>{formError}</div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
