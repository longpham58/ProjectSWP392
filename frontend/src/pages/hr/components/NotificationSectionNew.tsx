import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../stores/auth.store';
import * as hrNotificationApi from '../../../api/notification-hr.api';
import CreateHrNotificationModal from './modals/CreateHrNotificationModal';
import ViewNotificationModal from './modals/ViewNotificationModal';
import EditDraftModal from './modals/EditDraftModal';

// Types
type NotificationDto = {
  id: number;
  title: string;
  message?: string;
  content?: string;
  type?: string;
  priority?: string;
  isRead?: boolean;
  isDraft?: boolean;
  sentDate?: string;
  sentAt?: string;       // HR DTO uses sentAt
  createdAt?: string;
  category?: string;
  sender?: string;
  creator?: string;
  recipients?: string[];
  recipientType?: string;
  classCodes?: string;
  status?: string;
  sentTo?: string;
};

const NotificationSectionNew: React.FC = () => {
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
  const { user } = useAuthStore();

  // Load notifications when component mounts or filter changes
  useEffect(() => {
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
      const data = await hrNotificationApi.getHrNotifications(filter);
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setError('Không thể tải thông báo. Vui lòng thử lại sau.');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      setUnreadCount(unreadNotifications.length);
    } catch (error) {
      console.error('Error loading unread count:', error);
      setUnreadCount(0);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (!notif || !notif.title || !notif.message) {
      return false;
    }
    
    if (notif.category !== filter) {
      return false;
    }
    
    if (searchQuery.trim()) {
      const matchesSearch = notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           notif.message.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    }
    
    return true;
  });

  const markAsRead = async (id: number) => {
    try {
      await hrNotificationApi.markHrNotificationAsRead(id);
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
      const unreadNotifications = notifications.filter(n => !n.isRead);
      await Promise.all(
        unreadNotifications.map(n => hrNotificationApi.markHrNotificationAsRead(n.id))
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
        await hrNotificationApi.deleteHrNotification(id);
        setNotifications(notifications.filter(n => n.id !== id));
        loadUnreadCount();
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  const updateDraft = async (id: number, updatedData: any) => {
    try {
      await hrNotificationApi.updateHrNotification(id, updatedData);
      loadNotifications();
    } catch (error) {
      console.error('Error updating draft:', error);
    }
  };

  const sendDraft = async (id: number) => {
    try {
      await hrNotificationApi.sendHrNotification(id);
      loadNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ANNOUNCEMENT': return '📢';
      case 'SYSTEM': return '⚙️';
      case 'REMINDER': return '⏰';
      case 'GENERAL': return '📝';
      default: return '📝';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-100';
      case 'NORMAL': return 'text-blue-600 bg-blue-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('vi-VN');
  };

  const unreadCountDisplay = Math.min(unreadCount, 99);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xl font-bold relative">
              HR
              {unreadCountDisplay > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  {unreadCountDisplay}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Trung tâm Thông báo</h1>
              <p className="text-gray-600">Nhận và gửi thông báo đến nhân viên, giảng viên, và học viên</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {unreadCount} thông báo chưa đọc
              </span>
              <button
                onClick={markAllAsRead}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Đánh dấu tất cả đã đọc
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'inbox', label: 'Hộp thư đến', icon: '📥' },
              { key: 'sent', label: 'Đã gửi', icon: '📤' },
              { key: 'draft', label: 'Nháp', icon: '📝' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition flex items-center gap-2 ${
                  filter === tab.key
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
                {tab.key === 'inbox' && unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white py-0.5 px-2 rounded-full text-xs font-bold">
                    {unreadCountDisplay}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Search and Actions */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm thông báo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Soạn thông báo
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-6">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
              <div className="text-gray-600">Đang tải thông báo...</div>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">{error}</div>
              <button
                onClick={loadNotifications}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
              >
                Thử lại
              </button>
            </div>
          )}

          {!loading && !error && filteredNotifications.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có thông báo</h3>
              <p className="text-gray-600">
                {filter === 'inbox' && 'Bạn chưa nhận được thông báo nào.'}
                {filter === 'sent' && 'Bạn chưa gửi thông báo nào.'}
                {filter === 'draft' && 'Bạn chưa có bản nháp nào.'}
              </p>
            </div>
          )}

          {!loading && !error && filteredNotifications.length > 0 && (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border rounded-lg p-4 hover:shadow-md transition cursor-pointer ${
                    !notification.isRead ? 'border-green-200 bg-green-50' : 'border-gray-200'
                  }`}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead(notification.id);
                    }
                    setViewingNotification(notification);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                        {getTypeIcon(notification.type ?? '')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`font-semibold truncate ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority ?? '')}`}>
                            {notification.priority}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                          {notification.message ?? notification.content}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{formatDate(notification.sentDate ?? notification.sentAt)}</span>
                          {notification.sender && (
                            <span>Từ: {notification.sender}</span>
                          )}
                          {notification.recipientType && (
                            <span>Đến: {notification.recipientType}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {notification.isDraft && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingDraft(notification);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Chỉnh sửa nháp"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotificationHandler(notification.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Xóa"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateHrNotificationModal 
          onClose={() => {
            setShowCreateModal(false);
            loadNotifications();
          }}
        />
      )}

      {viewingNotification && (
        <ViewNotificationModal
          notification={viewingNotification}
          onClose={() => setViewingNotification(null)}
        />
      )}

      {editingDraft && (
        <EditDraftModal
          draft={editingDraft}
          onClose={() => setEditingDraft(null)}
          onSave={(updatedData) => {
            updateDraft(editingDraft.id, updatedData);
            setEditingDraft(null);
          }}
          onSend={(id) => {
            sendDraft(id);
            setEditingDraft(null);
          }}
        />
      )}
    </div>
  );
};

export default NotificationSectionNew;