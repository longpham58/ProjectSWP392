import React, { useEffect, useMemo, useState } from 'react';
import '@/assets/styles/NotificationPage.css';
import { hrNotificationService } from '../../../services/api/hr';
import type { HrNotification, NotificationChannel, NotificationStatus } from '../../../types/hr.types';

function fmtDateTime(iso?: string) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return '-';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

function isoToYmd(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isoToHm(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return '';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}


type NotificationPageProps = {
  onNotificationsChanged?: () => void;
};

export const NotificationPage: React.FC<NotificationPageProps> = ({ onNotificationsChanged }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [filterChannel, setFilterChannel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const [notifications, setNotifications] = useState<HrNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState('');

  type NotificationAction = 'Draft' | 'SendNow' | 'Schedule';
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formChannel, setFormChannel] = useState<NotificationChannel>('In-app');
  const [formRecipient, setFormRecipient] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formAction, setFormAction] = useState<NotificationAction>('Draft');
  const [formScheduleDate, setFormScheduleDate] = useState('');
  const [formScheduleTime, setFormScheduleTime] = useState('');
  const [formError, setFormError] = useState<string>('');

  const fetchNotifications = async () => {
    setLoading(true);
    setPageError('');
    try {
      const res = await hrNotificationService.list();
      setNotifications(res.data.data ?? []);
    } catch (error: any) {
      setNotifications([]);
      setPageError(error?.response?.data?.message || 'Không thể tải thông báo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormTitle('');
    setFormChannel('In-app');
    setFormRecipient('');
    setFormContent('');
    setFormAction('Draft');
    setFormScheduleDate('');
    setFormScheduleTime('');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (n: HrNotification) => {
    setEditingId(n.id);
    setFormTitle(n.title);
    setFormChannel(n.channel);
    setFormRecipient(n.sentTo);
    setFormContent(n.content ?? '');
    if (n.status === 'Draft') {
      setFormAction('Draft');
      setFormScheduleDate('');
      setFormScheduleTime('');
    } else if (n.status === 'Scheduled') {
      setFormAction('Schedule');
      setFormScheduleDate(isoToYmd(n.scheduledAt));
      setFormScheduleTime(isoToHm(n.scheduledAt));
    } else if (n.status === 'Sent') {
      setFormAction('SendNow');
      setFormScheduleDate('');
      setFormScheduleTime('');
    } else {
      // Cancelled -> allow user to decide again
      setFormAction('Draft');
      setFormScheduleDate('');
      setFormScheduleTime('');
    }
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormError('');
  };

  const combineDateTimeToIso = (dateYmd: string, timeHm: string) => {
    if (!dateYmd || !timeHm) return undefined;
    const value = `${dateYmd}T${timeHm}:00`;
    const dt = new Date(value);
    if (!Number.isFinite(dt.getTime())) return undefined;
    return value;
  };

  const filtered = useMemo(() => {
    const keyword = filterKeyword.trim().toLowerCase();

    const list = notifications.filter((n) => {
      if (filterChannel && n.channel !== filterChannel) return false;
      if (filterStatus && n.status !== filterStatus) return false;
      if (keyword && !n.title.toLowerCase().includes(keyword)) return false;

      if (filterDate) {
        const plannedYmd = isoToYmd(n.scheduledAt);
        const sentYmd = isoToYmd(n.sentAt);
        if (plannedYmd !== filterDate && sentYmd !== filterDate) return false;
      }

      return true;
    });

    // newest first: planned time, then sent time, else by id
    return list.sort((a, b) => {
      const aT = new Date(a.scheduledAt ?? a.sentAt ?? 0).getTime() || 0;
      const bT = new Date(b.scheduledAt ?? b.sentAt ?? 0).getTime() || 0;
      if (bT !== aT) return bT - aT;
      return b.id - a.id;
    });
  }, [filterChannel, filterDate, filterKeyword, filterStatus, notifications]);

  const statusLabel: Record<NotificationStatus, string> = {
    Draft: 'Nháp',
    Scheduled: 'Đã lên lịch',
    Sent: 'Đã gửi',
    Cancelled: 'Đã huỷ',
  };

  const statusClass: Record<NotificationStatus, string> = {
    Draft: 'draft',
    Scheduled: 'scheduled',
    Sent: 'sent',
    Cancelled: 'cancelled',
  };

  const notifStats = useMemo(() => {
    const total = notifications.length;
    const draft = notifications.filter((x) => x.status === 'Draft').length;
    const scheduled = notifications.filter((x) => x.status === 'Scheduled').length;
    const sent = notifications.filter((x) => x.status === 'Sent').length;
    return { total, draft, scheduled, sent };
  }, [notifications]);

  const sendTypeLabel = (n: HrNotification) => {
    if (n.status === 'Draft') return '-';
    if (n.status === 'Sent') return 'Gửi ngay';
    if (n.scheduledAt) return 'Hẹn giờ';
    return '-';
  };

  return (
    <div className="notification-page">
      <div className="notif-topbar">
        <div className="notif-topbar-left">
          <h1 className="notification-title">Danh sách thông báo</h1>
          <div className="notif-subtitle">Soạn thảo, lên lịch và theo dõi trạng thái gửi</div>
        </div>
        <div className="notif-topbar-actions">
          <button type="button" className="notif-action-btn secondary">⬇ Export</button>
          <button type="button" className="notif-action-btn secondary">⬆ Import</button>
          <button type="button" className="notif-action-btn primary" onClick={openCreateModal}>
            + Tạo thông báo
          </button>
        </div>
      </div>

      <div className="notif-stats">
        <div className="notif-stat-card">
          <div className="notif-stat-icon notif-i-amber">✎</div>
          <div className="notif-stat-meta">
            <div className="notif-stat-value">{notifStats.draft}</div>
            <div className="notif-stat-label">Nháp</div>
          </div>
        </div>
        <div className="notif-stat-card">
          <div className="notif-stat-icon notif-i-blue"></div>
          <div className="notif-stat-meta">
            <div className="notif-stat-value">{notifStats.scheduled}</div>
            <div className="notif-stat-label">Đã lên lịch</div>
          </div>
        </div>
        <div className="notif-stat-card">
          <div className="notif-stat-icon notif-i-green">✓</div>
          <div className="notif-stat-meta">
            <div className="notif-stat-value">{notifStats.sent}</div>
            <div className="notif-stat-label">Đã gửi</div>
          </div>
        </div>
        <div className="notif-stat-card">
          <div className="notif-stat-icon notif-i-red">∑</div>
          <div className="notif-stat-meta">
            <div className="notif-stat-value">{notifStats.total}</div>
            <div className="notif-stat-label">Tổng</div>
          </div>
        </div>
      </div>

      <div className="notif-toolbar">
        <div className="notif-search">
          <span className="notif-search-icon"></span>
          <input
            id="notif-keyword"
            type="text"
            placeholder="Tìm kiếm theo tiêu đề..."
            value={filterKeyword}
            onChange={(e) => setFilterKeyword(e.target.value)}
          />
        </div>
        <div className="notif-filters-inline">
          <select aria-label="Kênh" value={filterChannel} onChange={(e) => setFilterChannel(e.target.value)}>
            <option value="">Tất cả kênh</option>
            <option value="In-app">In-app</option>
            <option value="Email">Email</option>
          </select>
          <select aria-label="Trạng thái" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="Draft">Nháp</option>
            <option value="Scheduled">Đã lên lịch</option>
            <option value="Sent">Đã gửi</option>
            <option value="Cancelled">Đã huỷ</option>
          </select>
          <input aria-label="Ngày" id="notif-date" type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
        </div>
      </div>
      {pageError && <div style={{ color: '#dc2626', marginBottom: 8 }}>{pageError}</div>}
      <div className="notification-table-wrap">
        <table className="notification-table">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Kênh</th>
              <th>Người nhận</th>
              <th>Hình thức</th>
              <th>Thời gian dự kiến</th>
              <th>Thời gian gửi</th>
              <th>Người tạo</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((n) => (
              <tr key={n.id}>
                <td>{n.title}</td>
                <td>{n.channel}</td>
                <td>{n.sentTo}</td>
                <td>{sendTypeLabel(n)}</td>
                <td>{fmtDateTime(n.scheduledAt)}</td>
                <td>{fmtDateTime(n.sentAt)}</td>
                <td>{n.creator}</td>
                <td>
                  <span className={`notif-status notif-status-${statusClass[n.status]}`}>{statusLabel[n.status]}</span>
                </td>
                <td>
                  {n.status !== 'Sent' && (
                    <button
                      type="button"
                      className="notif-icon-btn"
                      title="Sửa"
                      aria-label="Sửa"
                      onClick={() => openEditModal(n)}
                    >
                      ✎
                    </button>
                  )}
                  {n.status === 'Scheduled' && (
                    <button
                      type="button"
                      className="notif-icon-btn"
                      title="Huỷ lịch"
                      aria-label="Huỷ lịch"
                      onClick={async () => {
                        try {
                          await hrNotificationService.update(n.id, {
                            title: n.title,
                            content: n.content,
                            channel: n.channel,
                            sentTo: n.sentTo,
                            scheduledAt: n.scheduledAt,
                            sentAt: n.sentAt,
                            creator: n.creator,
                            status: 'Cancelled',
                          });
                          await fetchNotifications();
                          onNotificationsChanged?.();
                        } catch (error: any) {
                          setPageError(error?.response?.data?.message || 'Không thể huỷ lịch thông báo.');
                        }
                      }}
                    >
                      ⨯
                    </button>
                  )}
                  <button
                    type="button"
                    className="notif-icon-btn"
                    title="Xóa"
                    aria-label="Xóa"
                    onClick={async () => {
                      const ok = window.confirm('Bạn có chắc chắn muốn xóa thông báo này?');
                      if (!ok) return;
                      try {
                        await hrNotificationService.remove(n.id);
                        await fetchNotifications();
                        onNotificationsChanged?.();
                      } catch (error: any) {
                        setPageError(error?.response?.data?.message || 'Không thể xóa thông báo.');
                      }
                    }}
                  >
                    
                  </button>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: 16, color: '#666' }}>Không có dữ liệu.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="notif-modal-overlay" onClick={closeModal}>
          <div className="notif-modal" onClick={(e) => e.stopPropagation()}>
            <div className="notif-modal-header">
              <h3>{editingId != null ? 'Sửa thông báo' : 'Tạo thông báo'}</h3>
              <button type="button" className="notif-modal-close" onClick={closeModal}>×</button>
            </div>
            <form
              className="notif-modal-form"
              onSubmit={async (e) => {
                e.preventDefault();

                const title = formTitle.trim();
                if (!title) {
                  setFormError('Vui lòng nhập tiêu đề.');
                  return;
                }
                if (!formRecipient) {
                  setFormError('Vui lòng chọn người nhận.');
                  return;
                }

                let status: NotificationStatus = 'Draft';
                let scheduledAt: string | undefined;
                let sentAt: string | undefined;

                if (formAction === 'SendNow') {
                  status = 'Sent';
                  sentAt = new Date().toISOString().slice(0, 19);
                } else if (formAction === 'Schedule') {
                  const iso = combineDateTimeToIso(formScheduleDate, formScheduleTime);
                  if (!iso) {
                    setFormError('Vui lòng chọn đầy đủ ngày & giờ để hẹn lịch gửi.');
                    return;
                  }
                  status = 'Scheduled';
                  scheduledAt = iso;
                } else {
                  status = 'Draft';
                }

                const payload = {
                  title,
                  content: formContent.trim() || undefined,
                  channel: formChannel,
                  sentTo: formRecipient,
                  scheduledAt: status === 'Scheduled' ? scheduledAt : undefined,
                  sentAt: status === 'Sent' ? sentAt : undefined,
                  creator: 'HR',
                  status,
                };

                try {
                  if (editingId != null) {
                    await hrNotificationService.update(editingId, payload);
                  } else {
                    await hrNotificationService.create(payload);
                  }
                  await fetchNotifications();
                  onNotificationsChanged?.();
                  closeModal();
                } catch (error: any) {
                  setFormError(error?.response?.data?.message || 'Không thể lưu thông báo.');
                }
              }}
            >
              <div className="notif-form-field">
                <label>Trạng thái</label>
                <div className="notif-radio-group">
                  <label>
                    <input
                      type="radio"
                      name="action"
                      checked={formAction === 'Draft'}
                      onChange={() => setFormAction('Draft')}
                    />{' '}
                    Nháp
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="action"
                      checked={formAction === 'SendNow'}
                      onChange={() => setFormAction('SendNow')}
                    />{' '}
                    Gửi ngay
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="action"
                      checked={formAction === 'Schedule'}
                      onChange={() => setFormAction('Schedule')}
                    />{' '}
                    Hẹn giờ
                  </label>
                </div>
              </div>
              <div className="notif-form-field">
                <label>Tiêu đề</label>
                <input
                  type="text"
                  placeholder="Nhập tiêu đề"
                  value={formTitle}
                  onChange={(ev) => setFormTitle(ev.target.value)}
                />
              </div>
              <div className="notif-form-field">
                <label>Gửi qua</label>
                <div className="notif-radio-group">
                  <label>
                    <input
                      type="radio"
                      name="channel"
                      checked={formChannel === 'In-app'}
                      onChange={() => setFormChannel('In-app')}
                    />{' '}
                    In-app
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="channel"
                      checked={formChannel === 'Email'}
                      onChange={() => setFormChannel('Email')}
                    />{' '}
                    Email
                  </label>
                </div>
              </div>
              <div className="notif-form-field">
                <label>Người nhận</label>
                <select value={formRecipient} onChange={(ev) => setFormRecipient(ev.target.value)}>
                  <option value="">Chọn nhóm...</option>
                  <option value="Phòng ban 1">Phòng ban 1</option>
                  <option value="Phòng ban 2">Phòng ban 2</option>
                  <option value="Phòng ban 3">Phòng ban 3</option>
                  <option value="Tất cả">Tất cả</option>
                </select>
              </div>
              <div className="notif-form-field">
                <label>Nội dung</label>
                <textarea
                  placeholder="Nhập nội dung thông báo"
                  rows={4}
                  value={formContent}
                  onChange={(ev) => setFormContent(ev.target.value)}
                />
              </div>
              {formAction === 'Schedule' && (
                <div className="notif-form-field">
                  <label>Thời gian hẹn gửi</label>
                  <div className="notif-datetime">
                    <input type="date" value={formScheduleDate} onChange={(e) => setFormScheduleDate(e.target.value)} />
                    <input type="time" value={formScheduleTime} onChange={(e) => setFormScheduleTime(e.target.value)} />
                  </div>
                </div>
              )}

              {formError && <div className="notif-form-error">{formError}</div>}
              <div className="notif-modal-actions">
                <button type="button" className="notif-btn secondary" onClick={closeModal}>Hủy</button>
                <button type="submit" className="notif-btn primary">
                  {editingId != null
                    ? 'Cập nhật'
                    : formAction === 'Draft'
                      ? 'Lưu nháp'
                      : formAction === 'SendNow'
                        ? 'Gửi ngay'
                        : 'Lên lịch gửi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
