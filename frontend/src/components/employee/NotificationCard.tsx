import type { Notification } from '../../data/mockNotifications';

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead?: (id: number) => void;
}

export default function NotificationCard({ notification, onMarkAsRead }: NotificationCardProps) {
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

  return (
    <div className={`border rounded-lg p-4 ${getTypeColor(notification.type)} ${!notification.read ? 'border-l-4' : ''}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{getTypeIcon(notification.type)}</span>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-semibold">{notification.title}</h4>
            {!notification.read && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">Mới</span>
            )}
          </div>
          <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {new Date(notification.date).toLocaleDateString('vi-VN')}
            </span>
            {!notification.read && (
              <button
                onClick={() => onMarkAsRead?.(notification.id)}
                className="text-xs text-blue-600 hover:underline"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
