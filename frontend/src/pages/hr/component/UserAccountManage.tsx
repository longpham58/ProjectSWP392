import React, { useEffect, useMemo, useState } from 'react';
import '@/assets/styles/UserAccountManagePage.css';
import { hrEmployeeService } from '../../../services/api/hr';
import type { Employee } from '../../../types/hr.types';

type UserAccountManagePageProps = {
  refreshToken?: number;
};

export const UserAccountManagePage: React.FC<UserAccountManagePageProps> = ({ refreshToken = 0 }) => {
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterKeyword, setFilterKeyword] = useState('');
  const [users, setUsers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await hrEmployeeService.list({
        role: filterRole || undefined,
        status: filterStatus || undefined,
        keyword: filterKeyword || undefined,
      });
      setUsers(res.data.data ?? []);
    } catch (error: any) {
      setUsers([]);
      setErrorMessage(error?.response?.data?.message || 'Không thể tải danh sách tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterRole, filterStatus, filterKeyword, refreshToken]);

  const filtered = useMemo(() => {
    return users.filter((u) => u.role !== 'Admin');
  }, [users]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const active = filtered.filter((u) => u.status === 'Active').length;
    const inactive = filtered.filter((u) => u.status === 'Inactive').length;
    const trainers = filtered.filter((u) => u.role === 'Trainer').length;
    return { total, active, inactive, trainers };
  }, [filtered]);

  const initials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
    return (first + last).toUpperCase();
  };

  return (
    <div className="user-account-page">
      <div className="ua-topbar">
        <div className="ua-topbar-left">
          <h1 className="user-account-title">Danh sách tài khoản</h1>
          <div className="ua-subtitle">Quản lý người dùng và phân quyền trong hệ thống</div>
        </div>
        <div className="ua-topbar-actions">
        </div>
      </div>

      <div className="ua-stats">
        <div className="ua-stat-card">
          <div className="ua-stat-icon ua-i-green">&#10003;</div>
          <div className="ua-stat-meta">
            <div className="ua-stat-value">{stats.active}</div>
            <div className="ua-stat-label">Đang hoạt động</div>
          </div>
        </div>
        <div className="ua-stat-card">
          <div className="ua-stat-icon ua-i-blue">U</div>
          <div className="ua-stat-meta">
            <div className="ua-stat-value">{stats.trainers}</div>
            <div className="ua-stat-label">Giảng viên</div>
          </div>
        </div>
        <div className="ua-stat-card">
          <div className="ua-stat-icon ua-i-amber">⏸</div>
          <div className="ua-stat-meta">
            <div className="ua-stat-value">{stats.inactive}</div>
            <div className="ua-stat-label">Tạm ngưng</div>
          </div>
        </div>
        <div className="ua-stat-card">
          <div className="ua-stat-icon ua-i-red">∑</div>
          <div className="ua-stat-meta">
            <div className="ua-stat-value">{stats.total}</div>
            <div className="ua-stat-label">Tổng tài khoản</div>
          </div>
        </div>
      </div>

      <div className="ua-toolbar">
        <div className="ua-search">
          <span className="ua-search-icon">&#128269;</span>
          <input
            id="user-keyword"
            type="text"
            placeholder="Tìm kiếm theo UserID, họ tên, email..."
            value={filterKeyword}
            onChange={(e) => setFilterKeyword(e.target.value)}
          />
        </div>
        <div className="ua-filters">
          <select aria-label="Role" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="">Tất cả role</option>
            <option value="HR">HR</option>
            <option value="Trainer">Trainer</option>
            <option value="Employee">Employee</option>
          </select>
          <select aria-label="Status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>
      {errorMessage && <div style={{ color: '#dc2626', marginBottom: 8 }}>{errorMessage}</div>}

      <div className="user-account-table-wrap">
        <table className="user-account-table">
          <thead>
            <tr>
              <th>Mã người dùng</th>
              <th>Họ và tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>{u.userId}</td>
                <td>
                  <div className="ua-name-cell">
                    <div className="ua-avatar">{initials(u.fullname)}</div>
                    <div className="ua-name-meta">
                      <div className="ua-name">{u.fullname}</div>
                      <div className="ua-id">{u.userId}</div>
                    </div>
                  </div>
                </td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td><span className={`user-status user-status-${u.status.toLowerCase()}`}>{u.status}</span></td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 16, color: '#666' }}>Không có dữ liệu.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
