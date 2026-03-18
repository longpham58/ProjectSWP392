import React, { useEffect, useState, useRef } from 'react';
import { hrClassMemberService } from '../../../services/api/hr';

type Member = {
  id: number;
  userId: number;
  username: string;
  fullName: string;
  email: string;
  status: string;
  joinedAt: string;
};

type Employee = {
  userId: number;
  username: string;
  fullName: string;
  email: string;
};

type Props = {
  classId: number;
  onClose: () => void;
};

export const ClassMembersModal: React.FC<Props> = ({ classId, onClose }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data } = await hrClassMemberService.getMembers(classId);
      setMembers(data.data || []);
    } catch (e) {
      setError('Lỗi tải danh sách học viên');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailable = async () => {
    try {
      const { data } = await hrClassMemberService.getAvailableEmployees(classId);
      setAvailableEmployees(data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchAvailable();
  }, [classId]);

  const handleAdd = async () => {
    if (!selectedUserId) {
      setError('Vui lòng chọn nhân viên');
      return;
    }
    setError('');
    try {
      await hrClassMemberService.addMember(classId, selectedUserId);
      setSelectedUserId('');
      fetchMembers();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Lỗi khi thêm học viên');
    }
  };

  const handleRemove = async (memberId: number) => {
    if (!window.confirm('Xóa học viên này khỏi lớp?')) return;
    try {
      await hrClassMemberService.removeMember(classId, memberId);
      fetchMembers();
    } catch (e: any) {
      alert('Lỗi: ' + (e?.response?.data?.message || 'Không thể xóa'));
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await hrClassMemberService.downloadTemplate(classId);
      const url = window.URL.createObjectURL(new Blob([response.data as any]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Import_Members_Template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert('Lỗi tải template');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setError('');
    setLoading(true);
    try {
      const response = await hrClassMemberService.importMembers(classId, file);
      const result = response.data.data;
      if (result.errors && result.errors.length > 0) {
        alert(`Import lỗi ${result.errors.length} dòng:\n${result.errors.join('\\n')}`);
      } else {
        alert(`Import thành công! Đã thêm ${result.added} người, bỏ qua ${result.skipped}`);
      }
      fetchMembers();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Lỗi xử lý file Excel');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Quản lý Danh sách Học viên</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer' }}>&times;</button>
        </div>

        {error && <div style={{ padding: '10px', background: '#fee2e2', color: '#dc2626', borderRadius: 6, marginBottom: 16 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 12, marginBottom: 16, background: '#f9fafb', padding: 16, borderRadius: 8 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 6, fontWeight: 500 }}>Thêm thủ công</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} style={input}>
                <option value="">-- Chọn nhân viên --</option>
                {availableEmployees.map(emp => (
                  <option key={emp.userId} value={emp.userId}>{emp.fullName} ({emp.email})</option>
                ))}
              </select>
              <button disabled={loading} onClick={handleAdd} style={btnStyle('#2563eb')}>Thêm</button>
            </div>
          </div>
          
          <div style={{ flex: 1, borderLeft: '1px solid #e5e7eb', paddingLeft: 12 }}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 6, fontWeight: 500 }}>Upload Excel</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={handleDownloadTemplate} style={btnStyle('#4b5563')}>Tải Template</button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls" style={{ display: 'none' }} />
              <button disabled={loading} onClick={() => fileInputRef.current?.click()} style={btnStyle('#10b981')}>Import File</button>
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f3f4f6', position: 'sticky', top: 0 }}>
                {['Mã NV', 'Họ Tên', 'Email', 'Trạng thái', 'Thao tác'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: '#9ca3af' }}>Lớp chưa có học viên</td></tr>
              ) : members.map(m => (
                <tr key={m.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={tdStyle}>{m.username}</td>
                  <td style={tdStyle}>{m.fullName}</td>
                  <td style={tdStyle}>{m.email}</td>
                  <td style={tdStyle}>
                    <span style={statusBadge(m.status)}>{m.status}</span>
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => handleRemove(m.id)} style={btnSmall('#ef4444')}>Xóa</button>
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

const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 };
const modal: React.CSSProperties = { background: '#fff', borderRadius: 10, padding: 24, width: '90%', maxWidth: 800, maxHeight: '95vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' };
const input: React.CSSProperties = { flex: 1, padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' };
const btnStyle = (bg: string): React.CSSProperties => ({ padding: '8px 16px', background: bg, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' });
const btnSmall = (bg: string): React.CSSProperties => ({ padding: '6px 12px', background: bg, color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 500 });
const thStyle: React.CSSProperties = { padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: 13, color: '#374151', borderBottom: '1px solid #e5e7eb' };
const tdStyle: React.CSSProperties = { padding: '12px', color: '#374151' };
const statusBadge = (status?: string): React.CSSProperties => ({ padding: '4px 8px', borderRadius: 12, fontSize: 12, fontWeight: 500, background: status === 'ACTIVE' ? '#dcfce7' : status === 'COMPLETED' ? '#dbeafe' : '#fee2e2', color: status === 'ACTIVE' ? '#16a34a' : status === 'COMPLETED' ? '#2563eb' : '#dc2626' });
