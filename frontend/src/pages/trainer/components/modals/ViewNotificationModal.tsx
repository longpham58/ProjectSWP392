import React from 'react';
import type { NotificationDto } from '../../../../api/notification-trainer.api';

interface ViewNotificationModalProps {
  notification: NotificationDto;
  onClose: () => void;
  onDelete: (id: number) => void;
  onEdit?: (notification: NotificationDto) => void;
  onSend?: (id: number) => void;
}

const ViewNotificationModal: React.FC<ViewNotificationModalProps> = ({ 
  notification, 
  onClose, 
  onDelete, 
  onEdit, 
  onSend 
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'URGENT': return '🔴';
      case 'FEEDBACK': return '💬';
      case 'INFO': return 'ℹ️';
      case 'ANNOUNCEMENT': return '📢';
      default: return '📢';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'inbox': return 'Hộp thư đến';
      case 'sent': return 'Đã gửi';
      case 'draft': return 'Bản nháp';
      default: return category;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b sticky top-0 bg-white">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                {getTypeIcon(notification.type)}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{notification.title}</h2>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(notification.priority)}`}>
                    {notification.priority === 'HIGH' && 'Ưu tiên cao'}
                    {notification.priority === 'MEDIUM' && 'Ưu tiên trung bình'}
                    {notification.priority === 'LOW' && 'Ưu tiên thấp'}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                    {getCategoryLabel(notification.category)}
                  </span>
                  {notification.type === 'URGENT' && (
                    <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-semibold">
                      Khẩn cấp
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Meta Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Thời gian</div>
                <div className="font-medium text-gray-900">
                  {new Date(notification.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>
              {notification.category === 'inbox' && notification.sender && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">Người gửi</div>
                  <div className="font-medium text-gray-900">
                    {notification.sender}
                  </div>
                </div>
              )}
              {notification.category === 'sent' && notification.recipients && (
                <div className="col-span-2">
                  <div className="text-sm text-gray-600 mb-1">Người nhận</div>
                  <div className="font-medium text-gray-900">
                    {notification.recipients.join(', ')}
                  </div>
                </div>
              )}
              <div>
                <div className="text-sm text-gray-600 mb-1">Loại thông báo</div>
                <div className="font-medium text-gray-900">
                  {notification.type === 'URGENT' && 'Khẩn cấp'}
                  {notification.type === 'FEEDBACK' && 'Phản hồi'}
                  {notification.type === 'INFO' && 'Thông tin'}
                  {notification.type === 'ANNOUNCEMENT' && 'Thông báo'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Trạng thái</div>
                <div className="font-medium text-gray-900">
                  {notification.isRead ? (
                    <span className="text-green-600">
                      Đã đọc
                    </span>
                  ) : (
                    <span className="text-orange-600">
                      Chưa đọc
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Nội dung</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {notification.message}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Đóng
            </button>
            {notification.category === 'draft' && onEdit && onSend && (
              <>
                <button
                  onClick={() => {
                    onEdit(notification);
                  }}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => {
                    if (confirm('Bạn có muốn gửi bản nháp này?')) {
                      onSend(notification.id);
                      alert('Đã gửi thông báo thành công!');
                      onClose();
                    }
                  }}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
                >
                  Gửi ngay
                </button>
              </>
            )}
            <button
              onClick={() => {
                if (confirm('Bạn có chắc muốn xóa thông báo này?')) {
                  onDelete(notification.id);
                }
              }}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewNotificationModal;