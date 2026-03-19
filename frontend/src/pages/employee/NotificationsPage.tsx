import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/auth.store';
import { employeeApi, type NotificationDto } from '../../api/employee.api';
import { NoNotifications } from '../../components/common/EmptyState';
import { useToast } from '../../components/common/Toast';
import { useNavigate } from 'react-router-dom';
import { CheckCheck, Bell, Trash2, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

function notifIcon(type: string) {
  if (type === 'ENROLLMENT') return <CheckCircle2 size={14} style={{ color: '#16A34A' }} />;
  if (type === 'REMINDER') return <AlertTriangle size={14} style={{ color: '#D97706' }} />;
  return <Info size={14} style={{ color: '#2563EB' }} />;
}

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { showToast } = useToast();

  useEffect(() => {
    if (!user?.id) return;
    employeeApi.getNotifications(user.id)
      .then(res => setNotifications(res.data))
      .catch(() => {});
  }, [user?.id]);

  const handleMarkAsRead = (id: number) => {
    if (!user?.id) return;
    employeeApi.markNotificationRead(id, user.id)
      .then(() => setNotifications(prev => prev.map(n => n.id === id ? { ...n, readStatus: true } : n)))
      .catch(() => {});
  };

  const handleMarkAllAsRead = () => {
    if (!user?.id) return;
    const unread = notifications.filter(n => !n.readStatus);
    Promise.all(unread.map(n => employeeApi.markNotificationRead(n.id, user.id!)))
      .then(() => {
        setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
        showToast('Đã đánh dấu tất cả thông báo là đã đọc', 'success');
      }).catch(() => {});
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!user?.id) return;
    employeeApi.deleteNotification(id, user.id)
      .then(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        showToast('Đã xóa thông báo', 'success');
      }).catch(() => showToast('Không thể xóa thông báo', 'error'));
  };

  const handleClick = (n: NotificationDto) => {
    if (!n.readStatus) handleMarkAsRead(n.id);
    navigate(`/employee/notification/${n.id}`);
  };

  let filtered = notifications;
  if (filter === 'unread') filtered = filtered.filter(n => !n.readStatus);
  if (searchTerm) filtered = filtered.filter(n =>
    n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (n.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);
  const unreadCount = notifications.filter(n => !n.readStatus).length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">Thông báo</h1>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              <CheckCheck size={13} /> Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>
        <p className="text-gray-600">
          {unreadCount > 0 ? `Bạn có ${unreadCount} thông báo chưa đọc` : 'Không có thông báo mới'}
        </p>
      </div>

      <div className="mb-4">
        <input type="text" placeholder="Tìm kiếm thông báo..."
          value={searchTerm}
          onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      <div className="flex gap-2 mb-6">
        {(['all', 'unread'] as const).map(f => (
          <button key={f} onClick={() => { setFilter(f); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            {f === 'all' ? `Tất cả (${notifications.length})` : `Chưa đọc (${unreadCount})`}
          </button>
        ))}
      </div>

      {paginated.length > 0 ? (
        <>
          <div className="space-y-3 mb-6">
            {paginated.map(n => (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                style={{
                  background: n.readStatus ? '#FFFFFF' : '#EFF6FF',
                  border: `1px solid ${n.readStatus ? '#E5E7EB' : '#BFDBFE'}`,
                  borderLeft: `4px solid ${n.readStatus ? '#E5E7EB' : '#2563EB'}`,
                  borderRadius: '10px', padding: '14px 16px',
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = n.readStatus ? '#F9FAFB' : '#DBEAFE')}
                onMouseLeave={e => (e.currentTarget.style.background = n.readStatus ? '#FFFFFF' : '#EFF6FF')}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', background: n.readStatus ? '#F3F4F6' : '#DBEAFE', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {notifIcon(n.type || 'SYSTEM')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {n.title && (
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>{n.title}</div>
                    )}
                    <div style={{ fontSize: '13px', fontWeight: n.readStatus ? 400 : 500, color: n.readStatus ? '#374151' : '#111827', marginBottom: '4px' }}>{n.message}</div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF' }}>
                      {n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {!n.readStatus && (
                      <div style={{ width: '8px', height: '8px', background: '#2563EB', borderRadius: '50%' }} />
                    )}
                    <button
                      onClick={e => handleDelete(e, n.id)}
                      style={{ padding: '4px', borderRadius: '6px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#DC2626')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
                      title="Xóa thông báo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 text-sm">← Trước</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg text-sm ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 text-sm">Sau →</button>
            </div>
          )}
        </>
      ) : (
        <NoNotifications />
      )}
    </div>
  );
}
