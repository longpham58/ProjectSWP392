import { useNavigate } from 'react-router-dom';
import type { Notification } from '../../api/notification.api';

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead?: (id: number) => void;
}

export default function NotificationCard({ notification, onMarkAsRead }: NotificationCardProps) {
  const navigate = useNavigate();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-50 border-blue-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return '📘';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '📌';
    }
  };

  const handleViewDetail = () => {
    if (!notification.read) {
      onMarkAsRead?.(notification.id);
    }
    navigate(`/employee/notification/${notification.id}`);
  };

  return (
    <div className={`border rounded-lg p-4 ${getTypeColor(notification.type)} ${!notification.read ? 'border-l-4' : ''} hover:shadow-md transition-shadow`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{getTypeIcon(notification.type)}</span>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-semibold">{notification.title}</h4>
            {!notification.read && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">Mới</span>
            )}
          </div>
          <p className="text-sm text-gray-700 mb-3">{notification.message}</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              📅 {new Date(notification.date).toLocaleDateString('vi-VN')}
            </span>
            <div className="flex gap-2">
              {!notification.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead?.(notification.id);
                  }}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Đánh dấu đã đọc
                </button>
              )}
              <button
                onClick={handleViewDetail}
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
              >
                Xem chi tiết →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
