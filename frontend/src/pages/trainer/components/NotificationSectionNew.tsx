import React, { useState, useEffect } from 'react';
import { useTrainerNotificationStore } from '../../../stores/trainerNotification.store';
import type { NotificationRequest } from '../../../api/notification-trainer.api';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import CreateNotificationModal from './modals/CreateNotificationModal';

const NotificationSectionNew: React.FC = () => {
  const {
    notifications,
    loading,
    error,
    currentCategory,
    setCurrentCategory,
    fetchNotifications,
    deleteNotification,
    markAsRead,
    markAllAsRead,
    sendNotification
  } = useTrainerNotificationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingNotification, setViewingNotification] = useState<any | null>(null);
  const [editingDraft, setEditingDraft] = useState<any | null>(null);

  // Fetch notifications on mount and when category changes
  useEffect(() => {
    fetchNotifications(currentCategory);
  }, [currentCategory, fetchNotifications]);

  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notif.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      alert('Đã đánh dấu tất cả là đã đọc!');
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    if (confirm('Bạn có chắc muốn xóa thông báo này?')) {
      try {
        await deleteNotification(id);
        alert('Đã xóa thông báo thành công!');
      } catch (err) {
        console.error('Failed to delete notification:', err);
      }
    }
  };

  const handleSendDraft = async (id: number) => {
    if (confirm('Bạn có muốn gửi bản nháp này?')) {
      try {
        await sendNotification(id);
        alert('Đã gửi thông báo thành công!');
        // Refresh the list
        fetchNotifications(currentCategory);
      } catch (err) {
        console.error('Failed to send notification:', err);
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead && currentCategory === 'inbox').length;

  const getTabCount = (category: 'inbox' | 'sent' | 'draft') => {
    // This would need to be fetched separately or cached
    return notifications.length;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'URGENT': return '[!]';
      case 'FEEDBACK': return '[FB]';
      case 'GENERAL': return '[i]';
      default: return '[*]';
    }
  };

  const formatTime = (dateString: string | null | undefined) => {
    if (!dateString) return 'Không rõ';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Không rõ';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Trung tâm Thông báo</h1>
            <p className="text-gray-600">Nhận và gửi thông báo đến học viên, HR, và ban quản lý</p>
          </div>
          {unreadCount > 0 && (
            <div className="px-4 py-2 bg-red-100 text-red-700 rounded-full font-semibold">
              {unreadCount} chưa đọc
            </div>
          )}
        </div>
        
        <div className="flex gap-4 mt-4">
          <button 
            onClick={handleMarkAllAsRead}
            className="px-6 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            disabled={unreadCount === 0 || loading}
          >
            Đánh Dấu Tất Cả Đã Đọc
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            + Soạn Thông Báo
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setCurrentCategory('inbox')}
          className={`px-6 py-3 rounded-lg font-medium transition ${
            currentCategory === 'inbox'
              ? 'bg-white shadow text-blue-600'
              : 'bg-white text-gray-600 hover:shadow'
          }`}
        >
          Hộp thư đến
        </button>
        <button
          onClick={() => setCurrentCategory('sent')}
          className={`px-6 py-3 rounded-lg font-medium transition ${
            currentCategory === 'sent'
              ? 'bg-white shadow text-blue-600'
              : 'bg-white text-gray-600 hover:shadow'
          }`}
        >
          Đã Gửi
        </button>
        <button
          onClick={() => setCurrentCategory('draft')}
          className={`px-6 py-3 rounded-lg font-medium transition ${
            currentCategory === 'draft'
              ? 'bg-white shadow text-blue-600'
              : 'bg-white text-gray-600 hover:shadow'
          }`}
        >
          Bản nháp
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Tìm kiếm thông báo"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 outline-none text-gray-700 px-3 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading && notifications.length > 0 && (
          <div className="text-center py-4">
            <LoadingSpinner />
          </div>
        )}
        
        {!loading && filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl text-gray-300 mb-4">[ ]</div>
            <p className="text-gray-500 text-lg">
              {currentCategory === 'inbox' && 'Không có thông báo mới'}
              {currentCategory === 'sent' && 'Chưa có thông báo đã gửi'}
              {currentCategory === 'draft' && 'Chưa có bản nháp'}
            </p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer ${
                !notification.isRead && currentCategory === 'inbox' ? 'border-l-4 border-blue-500' : ''
              }`}
              onClick={() => currentCategory === 'inbox' && handleMarkAsRead(notification.id)}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                  {getTypeIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{notification.title}</h3>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {notification.priority === 'HIGH' && (
                        <span className="px-3 py-1 bg-red-500 text-white text-xs rounded-full">
                          Khẩn cấp
                        </span>
                      )}
                      {currentCategory === 'draft' && (
                        <span className="px-3 py-1 bg-orange-500 text-white text-xs rounded-full">
                          Bản nháp
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{formatTime(notification.sentDate)}</span>
                    {currentCategory === 'inbox' && notification.sender && (
                      <span>{notification.sender}</span>
                    )}
                    {currentCategory === 'sent' && notification.recipients && (
                      <span>Đến: {notification.recipients.join(', ')}</span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    {currentCategory === 'inbox' && (
                      <>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingNotification(notification);
                            handleMarkAsRead(notification.id);
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                        >
                          Xem chi tiết
                        </button>
                        {!notification.isRead && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                          >
                            Đánh Dấu Đã Đọc
                          </button>
                        )}
                      </>
                    )}
                    {currentCategory === 'sent' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingNotification(notification);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                      >
                        Xem chi tiết
                      </button>
                    )}
                    {currentCategory === 'draft' && (
                      <>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingDraft(notification);
                          }}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                        >
                          Chỉnh sửa
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendDraft(notification.id);
                          }}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                        >
                          Gửi ngay
                        </button>
                      </>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNotification(notification.id);
                      }}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateNotificationModal 
          onClose={() => {
            setShowCreateModal(false);
            fetchNotifications(currentCategory);
          }} 
        />
      )}

      {editingDraft && (
        <EditDraftModal
          draft={editingDraft}
          onClose={() => {
            setEditingDraft(null);
            fetchNotifications(currentCategory);
          }}
        />
      )}

      {viewingNotification && (
        <ViewNotificationModal
          notification={viewingNotification}
          onClose={() => setViewingNotification(null)}
          onDelete={(id) => {
            handleDeleteNotification(id);
            setViewingNotification(null);
          }}
        />
      )}
    </div>
  );
};


const EditDraftModal: React.FC<{ draft: any; onClose: () => void }> = ({ draft, onClose }) => {
  const { updateNotification, sendNotification, loading } = useTrainerNotificationStore();
  
  const [title, setTitle] = useState(draft.title);
  const [content, setContent] = useState(draft.message);
  const [priority, setPriority] = useState(draft.priority);

  const handleSave = async () => {
    try {
      await updateNotification(draft.id, {
        title,
        message: content,
        priority,
        recipientType: draft.recipients ? 'STUDENTS' : 'HR',
        classCodes: draft.recipients,
        isDraft: true
      });
      alert('Đã cập nhật bản nháp!');
      onClose();
    } catch (err) {
      alert('Cập nhật thất bại!');
    }
  };

  const handleSend = async () => {
    try {
      await sendNotification(draft.id);
      alert('Đã gửi thông báo!');
      onClose();
    } catch (err) {
      alert('Gửi thất bại!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-6">Chỉnh sửa bản nháp</h2>
        
        <div className="mb-4">
          <label className="block mb-2">Tiêu đề</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Nội dung</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-6 py-2 border rounded">Hủy</button>
          <button onClick={handleSave} className="px-6 py-2 border-2 border-orange-500 text-orange-600 rounded" disabled={loading}>
            Lưu thay đổi
          </button>
          <button onClick={handleSend} className="flex-1 px-6 py-2 bg-green-500 text-white rounded" disabled={loading}>
            Gửi ngay
          </button>
        </div>
      </div>
    </div>
  );
};

const ViewNotificationModal: React.FC<{ notification: any; onClose: () => void; onDelete: (id: number) => void }> = ({ notification, onClose, onDelete }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-4">{notification.title}</h2>
        <p className="text-gray-600 mb-4">{notification.message}</p>
        <div className="text-sm text-gray-500 mb-6">
          <p>Thời gian: {new Date(notification.sentDate).toLocaleString('vi-VN')}</p>
          {notification.sender && <p>Người gửi: {notification.sender}</p>}
          {notification.recipients && <p>Người nhận: {notification.recipients.join(', ')}</p>}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-6 py-2 bg-gray-200 rounded">Đóng</button>
          <button onClick={() => onDelete(notification.id)} className="px-6 py-2 bg-red-500 text-white rounded">
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSectionNew;
