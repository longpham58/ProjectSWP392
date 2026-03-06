import { useNavigate } from 'react-router-dom';
import type { Notification } from '../../data/mockNotifications';

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
      case 'info': 
        return (
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning': 
        return (
          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'success': 
        return (
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error': 
        return (
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default: 
        return (
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
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
        <div className="flex-shrink-0 mt-1">{getTypeIcon(notification.type)}</div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-semibold">{notification.title}</h4>
            {!notification.read && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">Mới</span>
            )}
          </div>
          <p className="text-sm text-gray-700 mb-3">{notification.message}</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(notification.date).toLocaleDateString('vi-VN')}
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
