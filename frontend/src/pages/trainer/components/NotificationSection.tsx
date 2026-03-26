import React, { useState, useEffect } from 'react';
import type { NotificationDto, NotificationRequest } from '../../../api/notification-trainer.api';
import * as trainerApi from '../../../api/notification-trainer.api';
import CreateNotificationModal from './modals/CreateNotificationModal';
import EditDraftModal from './modals/EditDraftModal';
import ViewNotificationModal from './modals/ViewNotificationModal';

const NotificationSection: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [filter, setFilter] = useState<'inbox' | 'sent' | 'draft'>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [viewingNotification, setViewingNotification] = useState<NotificationDto | null>(null);
  const [editingDraft, setEditingDraft] = useState<NotificationDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Load notifications when component mounts or filter changes
  useEffect(() => {
    // Add a small delay to ensure component is mounted properly
    const timer = setTimeout(() => {
      loadNotifications();
      loadUnreadCount();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await trainerApi.getTrainerNotifications(filter);
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setError('Không thể tải thông báo. Vui lòng thử lại sau.');
      // Set mock data as fallback to prevent crashes
      const mockData: NotificationDto[] = [
        {
          id: 1,
          title: 'Thông báo lịch học mới',
          message: 'Lịch học cho lớp ITM5001-M01 đã được cập nhật.',
          type: 'ANNOUNCEMENT',
          priority: 'MEDIUM',
          category: filter,
          isRead: false,
          createdAt: new Date().toISOString(),
          sender: 'Hệ thống',
          recipients: ['ITM5001-M01']
        }
      ];
      setNotifications(mockData);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      // Calculate unread count from notifications
      const unreadNotifications = notifications.filter(n => !n.isRead);
      setUnreadCount(unreadNotifications.length);
    } catch (error) {
      console.error('Error loading unread count:', error);
      // Set 0 as fallback
      setUnreadCount(0);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    // Ensure notif exists and has required properties
    if (!notif || !notif.title || !notif.message) {
      return false;
    }
    
    // Lọc theo tab
    if (notif.category !== filter) {
      return false;
    }
    
    // Lọc theo search
    if (searchQuery.trim()) {
      const matchesSearch = notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           notif.message.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    }
    
    return true;
  });

  const markAsRead = async (id: number) => {
    try {
      await trainerApi.markNotificationAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ));
      loadUnreadCount();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Mark all unread notifications as read individually
      const unreadNotifications = notifications.filter(n => !n.isRead);
      await Promise.all(
        unreadNotifications.map(n => trainerApi.markNotificationAsRead(n.id))
      );
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotificationHandler = async (id: number) => {
    if (confirm('Bạn có chắc muốn xóa thông báo này?')) {
      try {
        await trainerApi.deleteNotification(id);
        setNotifications(notifications.filter(n => n.id !== id));
        loadUnreadCount();
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  const updateDraft = async (id: number, updatedData: NotificationRequest) => {
    try {
      await trainerApi.updateNotification(id, updatedData);
      // Reload notifications to reflect the change
      loadNotifications();
    } catch (error) {
      console.error('Error updating draft:', error);
    }
  };

  const sendDraft = async (id: number) => {
    try {
      await trainerApi.sendNotification(id);
      // Reload notifications to reflect the change
      loadNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const unreadCountDisplay = notifications.filter(n => !n.isRead && n.category === 'inbox').length;

  const getTabCount = (category: 'inbox' | 'sent' | 'draft') => {
    return notifications.filter(n => n.category === category).length;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'URGENT': return '[!]';
      case 'FEEDBACK': return '[FB]';
      case 'INFO': return '[i]';
      case 'ANNOUNCEMENT': return '[*]';
      default: return '[*]';
    }
  };

  const formatDateTime = (dateStr: string | null | undefined): string => {
    if (!dateStr) return 'Không rõ';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Không rõ';
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-8">
      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong className="font-bold">Lỗi: </strong>
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={() => {
              setError(null);
              loadNotifications();
            }}
            className="ml-4 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Trung tâm Thông báo</h1>
            <p className="text-gray-600">Nhận và gửi thông báo đến học viên, HR, và ban quản lý</p>
          </div>
          {unreadCountDisplay > 0 && (
            <div className="px-4 py-2 bg-red-100 text-red-700 rounded-full font-semibold">
              {unreadCountDisplay} chưa đọc
            </div>
          )}
        </div>
        
        <div className="flex gap-4 mt-4">
          <button 
            onClick={markAllAsRead}
            className="px-6 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            disabled={unreadCountDisplay === 0}
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

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter('inbox')}
          className={`px-6 py-3 rounded-lg font-medium transition ${
            filter === 'inbox'
              ? 'bg-white shadow text-blue-600'
              : 'bg-white text-gray-600 hover:shadow'
          }`}
        >
          Hộp thư đến
          {getTabCount('inbox') > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
              {getTabCount('inbox')}
            </span>
          )}
        </button>
        <button
          onClick={() => setFilter('sent')}
          className={`px-6 py-3 rounded-lg font-medium transition ${
            filter === 'sent'
              ? 'bg-white shadow text-blue-600'
              : 'bg-white text-gray-600 hover:shadow'
          }`}
        >
          Đã Gửi
          {getTabCount('sent') > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-xs">
              {getTabCount('sent')}
            </span>
          )}
        </button>
        <button
          onClick={() => setFilter('draft')}
          className={`px-6 py-3 rounded-lg font-medium transition ${
            filter === 'draft'
              ? 'bg-white shadow text-blue-600'
              : 'bg-white text-gray-600 hover:shadow'
          }`}
        >
          Bản nháp
          {getTabCount('draft') > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs">
              {getTabCount('draft')}
            </span>
          )}
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

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-600">Đang tải thông báo...</div>
        </div>
      )}

      {/* Notifications List */}
      {!loading && (
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl text-gray-300 mb-4">Empty</div>
              <p className="text-gray-500 text-lg">
                {filter === 'inbox' && 'Không có thông báo mới'}
                {filter === 'sent' && 'Chưa có thông báo đã gửi'}
                {filter === 'draft' && 'Chưa có bản nháp'}
              </p>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer ${
                  !notification.isRead && notification.category === 'inbox' ? 'border-l-4 border-blue-500' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
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
                        {notification.type === 'URGENT' && (
                          <span className="px-3 py-1 bg-red-500 text-white text-xs rounded-full">
                            Khẩn cấp
                          </span>
                        )}
                        {notification.type === 'FEEDBACK' && (
                          <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full">
                            Feedback
                          </span>
                        )}
                        {notification.category === 'draft' && (
                          <span className="px-3 py-1 bg-orange-500 text-white text-xs rounded-full">
                            Bản nháp
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{formatDateTime(notification.createdAt)}</span>
                      {notification.category === 'inbox' && notification.sender && (
                        <span>{notification.sender}</span>
                      )}
                      {notification.category === 'sent' && notification.recipients && (
                        <span>Đến: {notification.recipients.join(', ')}</span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      {notification.category === 'inbox' && (
                        <>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingNotification(notification);
                              markAsRead(notification.id);
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                          >
                            Xem chi tiết
                          </button>
                          {!notification.isRead && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                            >
                              Đánh Dấu Đã Đọc
                            </button>
                          )}
                        </>
                      )}
                      {notification.category === 'sent' && (
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
                      {notification.category === 'draft' && (
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
                              if (confirm('Bạn có muốn gửi bản nháp này?')) {
                                sendDraft(notification.id);
                                alert('Đã gửi thông báo thành công!');
                              }
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
                          deleteNotificationHandler(notification.id);
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
      )}

      {/* Create Notification Modal */}
      {showCreateModal && (
        <CreateNotificationModal 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={() => {
            setShowCreateModal(false);
            loadNotifications();
            loadUnreadCount();
          }}
        />
      )}

      {/* Edit Draft Modal */}
      {editingDraft && (
        <EditDraftModal
          draft={editingDraft}
          onClose={() => setEditingDraft(null)}
          onSave={(id, updatedData) => {
            updateDraft(id, updatedData);
            setEditingDraft(null);
          }}
          onSend={(id) => {
            sendDraft(id);
            setEditingDraft(null);
          }}
        />
      )}

      {/* View Notification Detail Modal */}
      {viewingNotification && (
        <ViewNotificationModal
          notification={viewingNotification}
          onClose={() => setViewingNotification(null)}
          onDelete={(id) => {
            deleteNotificationHandler(id);
            setViewingNotification(null);
          }}
          onEdit={(notification) => {
            setViewingNotification(null);
            setEditingDraft(notification);
          }}
          onSend={(id) => {
            sendDraft(id);
            setViewingNotification(null);
          }}
        />
      )}
    </div>
  );
};

export default NotificationSection;