import { useParams, useNavigate } from 'react-router-dom';
import { mockNotifications } from '../../data/mockNotifications';

export default function NotificationDetailPage() {
  const { notificationId } = useParams();
  const navigate = useNavigate();
  
  const notification = mockNotifications.find(n => n.id === Number(notificationId));

  if (!notification) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold mb-2">Không tìm thấy thông báo</h2>
            <p className="text-gray-600 mb-6">Thông báo này có thể đã bị xóa hoặc không tồn tại</p>
            <button
              onClick={() => navigate('/employee/notifications')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/employee/notifications')}
          className="mb-6 text-blue-600 hover:underline flex items-center gap-2"
        >
          ← Quay lại danh sách thông báo
        </button>

        {/* Notification Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className={`p-6 border-b-4 ${getTypeColor(notification.type)}`}>
            <div className="flex items-start gap-4">
              <div className="text-4xl">{getTypeIcon(notification.type)}</div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{notification.title}</h1>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    📅 {new Date(notification.date).toLocaleDateString('vi-VN')}
                  </span>
                  {notification.relatedCourse && (
                    <span className="flex items-center gap-1">
                      📚 {notification.relatedCourse}
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    notification.read ? 'bg-gray-200 text-gray-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {notification.read ? 'Đã đọc' : 'Mới'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Summary */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-gray-700 font-medium">{notification.message}</p>
            </div>

            {/* Detail Content */}
            {notification.detailContent && (
              <div className="prose max-w-none">
                <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                  {notification.detailContent}
                </div>
              </div>
            )}

            {/* Action Button */}
            {notification.actionUrl && (
              <div className="mt-8 pt-6 border-t">
                <button
                  onClick={() => navigate(notification.actionUrl!)}
                  className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {notification.type === 'success' ? 'Xem chứng chỉ' :
                   notification.type === 'warning' ? 'Đi đến khóa học' :
                   'Xem chi tiết'}
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Thông báo #{notification.id}</span>
              <span>Hệ thống ITMS</span>
            </div>
          </div>
        </div>

        {/* Related Actions */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/employee/notifications')}
            className="px-6 py-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
          >
            📋 Xem tất cả thông báo
          </button>
          <button
            onClick={() => navigate('/employee')}
            className="px-6 py-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
          >
            🏠 Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
