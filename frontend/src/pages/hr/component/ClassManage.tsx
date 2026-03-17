import React, { useEffect, useState } from 'react';
import { hrClassService } from '../../../services/api/hr';
import courseApi from '../../../api/course.api.wrapper';
import type { HRClassroom } from '../../../types/hr.types';
import type { CourseDto } from '../../../api/course.api';

type Trainer = { trainerId: number; trainerName: string };

type Form = {
  courseId: string;
  classCode: string;
  className: string;
  trainerId: string;
  maxStudents: string;
  status: string;
  notes: string;
};

const empty: Form = {
  courseId: '',
  classCode: '',
  className: '',
  trainerId: '',
  maxStudents: '',
  status: 'ACTIVE',
  notes: '',
};

export const ClassManagePage: React.FC = () => {
  const [classes, setClasses] = useState<HRClassroom[]>([]);
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [clsRes, crsRes, trnRes] = await Promise.all([
        hrClassService.list(),
        courseApi.getMyCourses(),
        hrClassService.listTrainers(),
      ]);
      setClasses(clsRes.data.data ?? []);
      setCourses(crsRes.data ?? []);
      const raw = trnRes.data.data ?? [];
      setTrainers(raw.map((t: any) => ({ trainerId: t.trainerId, trainerName: t.trainerName })));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const sf = (k: keyof Form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleCourseChange = (cid: string) => {
    sf('courseId', cid);
    const course = courses.find(c => String(c.id) === cid);
    if (course?.trainerId) {
      sf('trainerId', String(course.trainerId));
    } else {
      sf('trainerId', '');
    }
  };

  const openCreate = () => {
    setEditId(null);
    setForm(empty);
    setError('');
    setShowModal(true);
  };

  const openEdit = (cls: HRClassroom) => {
    setEditId(cls.id);
    setForm({
      courseId: String(cls.courseId ?? ''),
      classCode: cls.classCode ?? '',
      className: cls.className ?? '',
      trainerId: String(cls.trainerId ?? ''),
      maxStudents: String(cls.maxStudents ?? ''),
      status: cls.status ?? 'ACTIVE',
      notes: cls.notes ?? '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.classCode.trim()) { setError('Vui lòng nhập mã lớp'); return; }
    if (!form.className.trim()) { setError('Vui lòng nhập tên lớp'); return; }
    if (!form.courseId) { setError('Vui lòng chọn khóa học'); return; }
    setError('');
    const payload = {
      classCode: form.classCode.trim(),
      className: form.className.trim(),
      courseId: Number(form.courseId),
      trainerId: form.trainerId ? Number(form.trainerId) : undefined,
      maxStudents: form.maxStudents ? Number(form.maxStudents) : undefined,
      status: form.status,
      notes: form.notes.trim() || undefined,
    };
    try {
      if (editId !== null) {
        await hrClassService.update(editId, payload);
      } else {
        await hrClassService.create(payload);
      }
      setShowModal(false);
      fetchAll();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Xác nhận xóa lớp học này?')) return;
    try {
      await hrClassService.remove(id);
      fetchAll();
    } catch {
      alert('Xóa thất bại');
    }
  };

  const filtered = classes.filter(c =>
    c.classCode?.toLowerCase().includes(search.toLowerCase()) ||
    c.className?.toLowerCase().includes(search.toLowerCase()) ||
    c.courseName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Quản lý lớp học</h2>
        <button onClick={openCreate} style={btnStyle('#2563eb')}>+ Tạo lớp mới</button>
      </div>

      <input
        placeholder="Tìm kiếm theo mã lớp, tên lớp, khóa học..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, marginBottom: 16, fontSize: 14, boxSizing: 'border-box' }}
      />

      {loading ? (
        <p style={{ color: '#6b7280' }}>Đang tải...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                {['Mã lớp', 'Tên lớp', 'Khóa học', 'Giảng viên', 'Sĩ số tối đa', 'Trạng thái', 'Thao tác'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#9ca3af' }}>Không có dữ liệu</td></tr>
              ) : filtered.map(cls => (
                <tr key={cls.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={tdStyle}>{cls.classCode}</td>
                  <td style={tdStyle}>{cls.className}</td>
                  <td style={tdStyle}>{cls.courseName ?? cls.courseCode ?? '-'}</td>
                  <td style={tdStyle}>{cls.trainerName ?? '-'}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{cls.maxStudents ?? '-'}</td>
                  <td style={tdStyle}>
                    <span style={statusBadge(cls.status)}>{cls.status ?? '-'}</span>
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => openEdit(cls)} style={btnSmall('#2563eb')}>Sửa</button>
                    <button onClick={() => handleDelete(cls.id)} style={{ ...btnSmall('#ef4444'), marginLeft: 6 }}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={overlay}>
          <div style={modal}>
            <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 600 }}>
              {editId !== null ? 'Chỉnh sửa lớp học' : 'Tạo lớp học mới'}
            </h3>

            <label style={label}>Khóa học <span style={{ color: 'red' }}>*</span></label>
            <select value={form.courseId} onChange={e => handleCourseChange(e.target.value)} style={input}>
              <option value="">-- Chọn khóa học --</option>
              {courses.map(c => (
                <option key={c.id} value={String(c.id)}>{c.name ?? c.title} ({c.code})</option>
              ))}
            </select>

            <label style={label}>Mã lớp <span style={{ color: 'red' }}>*</span></label>
            <input value={form.classCode} onChange={e => sf('classCode', e.target.value)} style={input} placeholder="VD: CLS001" />

            <label style={label}>Tên lớp <span style={{ color: 'red' }}>*</span></label>
            <input value={form.className} onChange={e => sf('className', e.target.value)} style={input} placeholder="VD: Lớp Java cơ bản" />

            <label style={label}>Giảng viên</label>
            <select value={form.trainerId} onChange={e => sf('trainerId', e.target.value)} style={input}>
              <option value="">-- Chọn giảng viên --</option>
              {trainers.map(t => (
                <option key={t.trainerId} value={String(t.trainerId)}>{t.trainerName}</option>
              ))}
            </select>

            <label style={label}>Sĩ số tối đa</label>
            <input type="number" value={form.maxStudents} onChange={e => sf('maxStudents', e.target.value)} style={input} placeholder="VD: 30" min={1} />

            <label style={label}>Trạng thái</label>
            <select value={form.status} onChange={e => sf('status', e.target.value)} style={input}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>

            <label style={label}>Ghi chú</label>
            <textarea value={form.notes} onChange={e => sf('notes', e.target.value)} style={{ ...input, height: 72, resize: 'vertical' }} placeholder="Ghi chú thêm..." />

            {error && <p style={{ color: '#ef4444', fontSize: 13, margin: '4px 0 0' }}>{error}</p>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button onClick={() => setShowModal(false)} style={btnStyle('#6b7280')}>Hủy</button>
              <button onClick={handleSubmit} style={btnStyle('#2563eb')}>{editId !== null ? 'Cập nhật' : 'Tạo lớp'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const thStyle: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', fontWeight: 600, fontSize: 13, color: '#374151' };
const tdStyle: React.CSSProperties = { padding: '10px 12px', color: '#374151' };
const label: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 4, color: '#374151' };
const input: React.CSSProperties = { width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, marginBottom: 12, boxSizing: 'border-box' };
const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modal: React.CSSProperties = { background: '#fff', borderRadius: 10, padding: 24, width: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' };

const btnStyle = (bg: string): React.CSSProperties => ({
  padding: '8px 16px', background: bg, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 500,
});
const btnSmall = (bg: string): React.CSSProperties => ({
  padding: '4px 10px', background: bg, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12,
});
const statusBadge = (status?: string): React.CSSProperties => ({
  padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 500,
  background: status === 'ACTIVE' ? '#dcfce7' : status === 'COMPLETED' ? '#dbeafe' : '#f3f4f6',
  color: status === 'ACTIVE' ? '#16a34a' : status === 'COMPLETED' ? '#2563eb' : '#6b7280',
});
