import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { employeeApi, type NotificationDto } from '../../api/employee.api';
import { useAuthStore } from '../../stores/auth.store';
import { useToast } from '../../components/common/Toast';
import { MailX, CheckCircle2, AlertTriangle, Info, CalendarDays, BookOpen, ClipboardList, Home, Trash2 } from 'lucide-react';

function getTypeStyle(type: string) {
  if (type === 'ENROLLMENT') return { cls: 'bg-green-50 border-green-200 text-green-800', icon: <CheckCircle2 size={36} className="text-green-600" /> };
  if (type === 'REMINDER') return { cls: 'bg-yellow-50 border-yellow-200 text-yellow-800', icon: <AlertTriangle size={36} className="text-yellow-600" /> };
  return { cls: 'bg-blue-50 border-blue-200 text-blue-800', icon: <Info size={36} className="text-blue-600" /> };
}

export default function NotificationDetailPage() {
  const { notificationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const [notification, setNotification] = useState<NotificationDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !notificationId) return;
    // Load all notifications and find the one we need
    employeeApi.getNotifications(user.id)
      .then(res => {
        const found = res.data.find(n => n.id === Number(notificationId));
        setNotification(found || null);
        // Mark as read if unread
        if (found && !found.readStatus) {
          employeeApi.markNotificationRead(found.id, user.id!).catch(() => {});
        }
      })
      .catch(() => setNotification(null))
      .finally(() => setLoading(false));
  }, [notificationId, user?.id]);

  const handleDelete = () => {
    if (!user?.id || !notification) return;
    employeeApi.deleteNotification(notification.id, user.id)
      .then(() => {
        showToast('Đã xóa thông báo', 'success');
        navigate('/employee/notifications');
      })
      .catch(() => showToast('Không thể xóa thông báo', 'error'));
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Đang tải...</div>;
  }

  if (!notification) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="flex justify-center mb-4"><MailX size={64} className="text-gray-300" /></div>
            <h2 className="text-2xl font-bold mb-2">Không tìm thấy thông báo</h2>
            <p className="text-gray-600 mb-6">Thông báo này có thể đã bị xóa hoặc không tồn tại</p>
            <button onClick={() => navigate('/employee/notifications')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { cls, icon } = getTypeStyle(notification.type || 'SYSTEM');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <button onClick={() => navigate('/employee/notifications')}
          className="mb-6 text-blue-600 hover:underline flex items-center gap-2">
          ← Quay lại danh sách thông báo
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className={`p-6 border-b-4 ${cls}`}>
            <div className="flex items-start gap-4">
              <div className="text-4xl">{icon}</div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{notification.title || 'Thông báo'}</h1>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <CalendarDays size={13} />
                    {notification.createdAt ? new Date(notification.createdAt).toLocaleString('vi-VN') : ''}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${notification.readStatus ? 'bg-gray-200 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>
                    {notification.readStatus ? 'Đã đọc' : 'Mới'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-gray-700 font-medium">{notification.message}</p>
            </div>

            <div className="mt-8 pt-6 border-t flex gap-3">
              <button onClick={() => navigate('/employee/my-courses')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
                <BookOpen size={15} /> Xem khóa học
              </button>
              <button onClick={handleDelete}
                className="px-6 py-3 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium flex items-center gap-2">
                <Trash2 size={15} /> Xóa thông báo
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Thông báo #{notification.id}</span>
              <span>Hệ thống ITMS</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={() => navigate('/employee/notifications')}
            className="px-6 py-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <ClipboardList size={16} /> Xem tất cả thông báo
          </button>
          <button onClick={() => navigate('/employee')}
            className="px-6 py-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Home size={16} /> Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
