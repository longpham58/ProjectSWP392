import { useState } from 'react';
import { mockNotifications, type Notification } from '../../data/mockNotifications';
import NotificationCard from '../../components/employee/NotificationCard';
import { NoNotifications } from '../../components/common/EmptyState';
import { useToast } from '../../components/common/Toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { showToast } = useToast();

  const handleMarkAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    showToast('Đã đánh dấu tất cả thông báo là đã đọc', 'success');
  };

  const handleDeleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    showToast('Đã xóa thông báo', 'success');
  };

  const handleDeleteAll = () => {
    if (window.confirm('Bạn có chắc muốn xóa tất cả thông báo đã đọc?')) {
      setNotifications(prev => prev.filter(n => !n.read));
      showToast('Đã xóa tất cả thông báo đã đọc', 'success');
    }
  };

  // Filter notifications
  let filteredNotifications = notifications;

  // Filter by read/unread
  if (filter === 'unread') {
    filteredNotifications = filteredNotifications.filter(n => !n.read);
  }

  // Filter by type
  if (typeFilter !== 'all') {
    filteredNotifications = filteredNotifications.filter(n => n.type === typeFilter);
  }

  // Filter by search term
  if (searchTerm) {
    filteredNotifications = filteredNotifications.filter(n =>
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + itemsPerPage);

  const unreadCount = notifications.filter(n => !n.read).length;
  const readCount = notifications.filter(n => n.read).length;

  // Count by type
  const infoCount = notifications.filter(n => n.type === 'info').length;
  const warningCount = notifications.filter(n => n.type === 'warning').length;
  const successCount = notifications.filter(n => n.type === 'success').length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">Thông báo</h1>
          <div className="flex gap-2">
            {readCount > 0 && (
              <button
                onClick={handleDeleteAll}
                className="text-sm text-red-600 hover:underline"
              >
                🗑️ Xóa đã đọc
              </button>
            )}
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:underline"
              >
                ✓ Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
        </div>
        <p className="text-gray-600">
          {unreadCount > 0 ? `Bạn có ${unreadCount} thông báo chưa đọc` : 'Không có thông báo mới'}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm thông báo..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => {
            setFilter('all');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Tất cả ({notifications.length})
        </button>
        <button
          onClick={() => {
            setFilter('unread');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'unread'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Chưa đọc ({unreadCount})
        </button>
      </div>

      {/* Type Filter */}
      <div className="mb-6">
        <div className="text-sm font-medium text-gray-700 mb-2">Lọc theo loại:</div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setTypeFilter('all');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              typeFilter === 'all'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => {
              setTypeFilter('info');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              typeFilter === 'info'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            ℹ️ Thông tin ({infoCount})
          </button>
          <button
            onClick={() => {
              setTypeFilter('warning');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              typeFilter === 'warning'
                ? 'bg-yellow-600 text-white'
                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            }`}
          >
            ⚠️ Cảnh báo ({warningCount})
          </button>
          <button
            onClick={() => {
              setTypeFilter('success');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              typeFilter === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            ✓ Thành công ({successCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {paginatedNotifications.length > 0 ? (
        <>
          <div className="space-y-4 mb-6">
            {paginatedNotifications.map(notification => (
              <div key={notification.id} className="relative group">
                <NotificationCard
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
                <button
                  onClick={() => handleDeleteNotification(notification.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg text-sm"
                  title="Xóa thông báo"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Trước
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau →
              </button>
            </div>
          )}

          {/* Results Info */}
          <div className="text-center text-sm text-gray-600 mt-4">
            Hiển thị {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredNotifications.length)} trong tổng số {filteredNotifications.length} thông báo
          </div>
        </>
      ) : (
        <NoNotifications />
      )}
    </div>
  );
}
