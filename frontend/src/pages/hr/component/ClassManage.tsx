import React, { useEffect, useState } from 'react';
import { hrClassService } from '../../../services/api/hr';
import type { HRClassroom } from '../../../types/hr.types';
import '@/assets/styles/CourseManagePage.css';

type ClassManagePageProps = {
  onClassesChanged?: () => void;
};

export const ClassManagePage: React.FC<ClassManagePageProps> = ({ onClassesChanged }) => {
  const [classes, setClasses] = useState<HRClassroom[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [classCode, setClassCode] = useState('');
  const [className, setClassName] = useState('');
  const [error, setError] = useState('');

  const getFriendlyClassError = (err: any, fallback: string) => {
    const message = err?.response?.data?.message || '';
    if (
      message.includes('Classroom')
      || message.includes('JDBC exception')
      || message.includes('DB_SCHEMA_MISSING')
    ) {
      return 'Cơ sở dữ liệu chưa có bảng Classroom. Vui lòng khởi tạo bảng Classroom rồi thử lại.';
    }
    return message || fallback;
  };

  const loadClasses = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await hrClassService.list();
      setClasses(res.data.data || []);
    } catch (err: any) {
      setError(getFriendlyClassError(err, 'Không tải được dữ liệu lớp học'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setClassCode('');
    setClassName('');
    setError('');
    setModalOpen(true);
  };

  const openEdit = (item: HRClassroom) => {
    setEditingId(item.id);
    setClassCode(item.classCode);
    setClassName(item.className);
    setError('');
    setModalOpen(true);
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId != null) {
        await hrClassService.update(editingId, { classCode, className });
      } else {
        await hrClassService.create({ classCode, className });
      }
      setModalOpen(false);
      await loadClasses();
      onClassesChanged?.();
    } catch (err: any) {
      setError(getFriendlyClassError(err, 'Không thể lưu dữ liệu lớp học'));
    }
  };

  const removeClass = async (id: number) => {
    const ok = window.confirm('Bạn có chắc chắn muốn xóa lớp này?');
    if (!ok) return;
    setError('');
    try {
      await hrClassService.remove(id);
      await loadClasses();
      onClassesChanged?.();
    } catch (err: any) {
      setError(getFriendlyClassError(err, 'Không thể xóa lớp học'));
    }
  };

  return (
    <div className="course-manage-page">
      <div className="course-topbar">
        <div className="course-topbar-left">
          <h1 className="course-manage-title">Class Management</h1>
          <div className="course-subtitle">Quản lý mã lớp và tên lớp học</div>
        </div>
        <div className="course-topbar-actions">
          <button type="button" className="course-action-btn primary" onClick={openCreate}>
            + Add class
          </button>
        </div>
      </div>

      {error && <div style={{ color: '#dc2626', marginBottom: 8 }}>{error}</div>}

      <div className="course-table-wrap">
        <table className="course-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Class code</th>
              <th>Class name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.classCode}</td>
                <td>{item.className}</td>
                <td>
                  <button type="button" className="course-icon-btn" onClick={() => openEdit(item)}>✎</button>
                  <button type="button" className="course-icon-btn" onClick={() => removeClass(item.id)}>🗑</button>
                </td>
              </tr>
            ))}
            {!loading && classes.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: 16, color: '#666' }}>Không có dữ liệu.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="course-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="course-modal" onClick={(e) => e.stopPropagation()}>
            <div className="course-modal-header">
              <h3>{editingId != null ? 'Edit class' : 'Create class'}</h3>
              <button type="button" className="course-modal-close" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <form className="course-modal-form" onSubmit={submitForm}>
              <div className="course-form-field">
                <label>Mã lớp</label>
                <input value={classCode} onChange={(e) => setClassCode(e.target.value)} required />
              </div>
              <div className="course-form-field">
                <label>Tên lớp</label>
                <input value={className} onChange={(e) => setClassName(e.target.value)} required />
              </div>
              <div className="course-modal-actions">
                <button type="button" className="course-btn secondary" onClick={() => setModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="course-btn primary">
                  {editingId != null ? 'Lưu thay đổi' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

