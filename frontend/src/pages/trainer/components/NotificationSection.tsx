import React, { useState } from 'react';
import { mockNotifications, Notification } from '../../../data/mockTrainerData';

const NotificationSection: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'inbox' | 'sent' | 'draft'>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [viewingNotification, setViewingNotification] = useState<Notification | null>(null);

  const filteredNotifications = notifications.filter(notif => {
    // Lọc theo tab
    if (notif.category !== filter) {
      return false;
    }
    
    // Lọc theo search
    const matchesSearch = notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notif.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: number) => {
    if (confirm('Bạn có chắc muốn xóa thông báo này?')) {
      setNotifications(notifications.filter(n => n.id !== id));
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead && n.category === 'inbox').length;

  const getTabCount = (category: 'inbox' | 'sent' | 'draft') => {
    return notifications.filter(n => n.category === category).length;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'URGENT': return '🔴';
      case 'FEEDBACK': return '💬';
      case 'INFO': return 'ℹ️';
      default: return '📢';
    }
  };

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
            onClick={markAllAsRead}
            className="px-6 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            disabled={unreadCount === 0}
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

      {/* Notifications List */}
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
                    <span>⏰ {notification.time}</span>
                    {notification.category === 'inbox' && notification.sender && (
                      <span>👤 {notification.sender}</span>
                    )}
                    {notification.category === 'sent' && notification.recipients && (
                      <span>📧 Đến: {notification.recipients.join(', ')}</span>
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
                            alert('Chức năng chỉnh sửa bản nháp');
                          }}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                        >
                          Chỉnh sửa
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Bạn có muốn gửi bản nháp này?')) {
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
                        deleteNotification(notification.id);
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

      {/* Create Notification Modal */}
      {showCreateModal && (
        <CreateNotificationModal onClose={() => setShowCreateModal(false)} />
      )}

      {/* View Notification Detail Modal */}
      {viewingNotification && (
        <ViewNotificationModal
          notification={viewingNotification}
          onClose={() => setViewingNotification(null)}
          onDelete={(id) => {
            deleteNotification(id);
            setViewingNotification(null);
          }}
        />
      )}
    </div>
  );
};

// Create Notification Modal Component
const CreateNotificationModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [recipient, setRecipient] = useState<'students' | 'hr'>('students');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [priority, setPriority] = useState('normal');
  const [template, setTemplate] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const availableClasses = ['ITM5001-M01', 'ITM5002-M02', 'ITM5003-M03'];

  const toggleClass = (classCode: string) => {
    setSelectedClasses(prev =>
      prev.includes(classCode)
        ? prev.filter(c => c !== classCode)
        : [...prev, classCode]
    );
    setErrors({ ...errors, selectedClasses: '' });
  };

  const toggleAllClasses = () => {
    if (selectedClasses.length === availableClasses.length) {
      setSelectedClasses([]);
    } else {
      setSelectedClasses([...availableClasses]);
    }
    setErrors({ ...errors, selectedClasses: '' });
  };

  const templates = {
    reminder: {
      title: 'Nhắc nhở lịch học',
      content: `Kính gửi các học viên,

Nhắc nhở lịch học:
- Thời gian: [Thời gian]
- Phòng học: [Phòng]
- Chủ đề: [Chủ đề]

Vui lòng chuẩn bị đầy đủ và đến đúng giờ.

Trân trọng`
    },
    maintenance: {
      title: 'Thông báo bảo trì hệ thống',
      content: `Kính gửi các học viên,

Hệ thống sẽ bảo trì vào [Thời gian].
Vui lòng lưu dữ liệu và đăng xuất trước thời gian này.

Trân trọng`
    },
    exam: {
      title: 'Thông báo kiểm tra',
      content: `Kính gửi các học viên,

Thông báo kiểm tra:
- Môn: [Môn học]
- Thời gian: [Thời gian]
- Hình thức: [Hình thức]

Vui lòng chuẩn bị kỹ lưỡng.

Trân trọng`
    },
    custom: {
      title: 'Tài liệu mới',
      content: `Kính gửi các học viên,

Tài liệu mới đã được cập nhật:
- Tên tài liệu: [Tên]
- Module: [Module]

Vui lòng tải về và học tập.

Trân trọng`
    }
  };

  const handleTemplateChange = (templateKey: string) => {
    setTemplate(templateKey);
    if (templateKey && templates[templateKey as keyof typeof templates]) {
      const selected = templates[templateKey as keyof typeof templates];
      setTitle(selected.title);
      setContent(selected.content);
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề';
    }

    if (!content.trim()) {
      newErrors.content = 'Vui lòng nhập nội dung';
    }

    if (recipient === 'students' && selectedClasses.length === 0) {
      newErrors.selectedClasses = 'Vui lòng chọn ít nhất một lớp học';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSend = () => {
    if (validate()) {
      const classesText = selectedClasses.length === availableClasses.length 
        ? 'Tất cả lớp' 
        : selectedClasses.join(', ');
      alert(`Đã gửi thông báo thành công!\n\nĐến: ${recipient === 'students' ? 'Học viên - ' + classesText : 'HR/Quản lý'}\nTiêu đề: ${title}\nMức độ: ${priority}`);
      onClose();
    }
  };

  const handleSaveDraft = () => {
    if (title.trim() || content.trim()) {
      alert('Đã lưu nháp thành công!');
      onClose();
    } else {
      alert('Vui lòng nhập ít nhất tiêu đề hoặc nội dung');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
            N
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Soạn thông báo mới</h2>
        </div>

        {/* Recipient */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Gửi đến *</label>
          <div className="flex gap-4">
            <button
              onClick={() => setRecipient('students')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
                recipient === 'students'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>Học viên</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">(Gửi đến các lớp học)</div>
            </button>
            <button
              onClick={() => setRecipient('hr')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
                recipient === 'hr'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>HR / Quản lý</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">(Gửi đến bộ phận HR)</div>
            </button>
          </div>
        </div>

        {/* Class Selection */}
        {recipient === 'students' && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Chọn lớp học *</label>
            
            {/* Select All Option */}
            <div className="mb-3 p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedClasses.length === availableClasses.length}
                  onChange={toggleAllClasses}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mr-3"
                />
                <div className="flex-1">
                  <span className="font-semibold text-blue-900">Chọn tất cả lớp học</span>
                  <p className="text-sm text-blue-700 mt-1">
                    Gửi thông báo đến tất cả {availableClasses.length} lớp học
                  </p>
                </div>
              </label>
            </div>

            {/* Individual Classes */}
            <div className="space-y-2">
              {availableClasses.map((classCode) => (
                <div
                  key={classCode}
                  className={`p-3 rounded-lg border-2 transition ${
                    selectedClasses.includes(classCode)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedClasses.includes(classCode)}
                      onChange={() => toggleClass(classCode)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mr-3"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">{classCode}</span>
                    </div>
                  </label>
                </div>
              ))}
            </div>

            {/* Selected Count */}
            {selectedClasses.length > 0 && (
              <div className="mt-3 p-2 bg-green-50 rounded-lg text-sm text-green-700">
                Đã chọn {selectedClasses.length} lớp học
              </div>
            )}

            {errors.selectedClasses && (
              <p className="text-red-500 text-sm mt-2">{errors.selectedClasses}</p>
            )}
          </div>
        )}

        {/* Priority */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Mức độ ưu tiên</label>
          <div className="flex gap-3">
            <button
              onClick={() => setPriority('normal')}
              className={`px-6 py-2 rounded-lg border-2 transition ${
                priority === 'normal'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              Ưu Tiên
            </button>
            <button
              onClick={() => setPriority('urgent')}
              className={`px-6 py-2 rounded-lg border-2 transition ${
                priority === 'urgent'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              ⚠️ Khẩn cấp
            </button>
            <button
              onClick={() => setPriority('info')}
              className={`px-6 py-2 rounded-lg border-2 transition ${
                priority === 'info'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              ℹ️ Thông tin
            </button>
          </div>
        </div>

        {/* Template */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Mẫu nhanh (tùy chọn)</label>
          <select
            value={template}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Chọn mẫu nhanh</option>
            <option value="reminder">Nhắc nhở lịch học</option>
            <option value="maintenance">Thông báo bảo trì hệ thống</option>
            <option value="exam">Thông báo kiểm tra</option>
            <option value="custom">Tài liệu mới</option>
          </select>
        </div>

        {/* Title */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setErrors({ ...errors, title: '' });
            }}
            placeholder="Nhắc nhở lịch học"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Content */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nội dung *</label>
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setErrors({ ...errors, content: '' });
            }}
            placeholder="Kính gửi các học viên,&#10;&#10;Nhắc nhở lịch học:&#10;- Thời gian: [Thời gian]&#10;- Phòng học: [Phòng]&#10;- Chủ đề: [Chủ đề]&#10;&#10;Vui lòng chuẩn bị đầy đủ và đến đúng giờ.&#10;&#10;Trân trọng"
            rows={8}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
              errors.content ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">{errors.content}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">{content.length} ký tự</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleSaveDraft}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Lưu Nháp
          </button>
          <button
            onClick={handleSend}
            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
          >
            Gửi ngay
          </button>
        </div>
      </div>
    </div>
  );
};

// View Notification Detail Modal
const ViewNotificationModal: React.FC<{
  notification: Notification;
  onClose: () => void;
  onDelete: (id: number) => void;
}> = ({ notification, onClose, onDelete }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'URGENT': return '🔴';
      case 'FEEDBACK': return '💬';
      case 'INFO': return 'ℹ️';
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
              X
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
                  {notification.time}
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
            {notification.category === 'draft' && (
              <>
                <button
                  onClick={() => {
                    alert('Chức năng chỉnh sửa bản nháp');
                  }}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => {
                    if (confirm('Bạn có muốn gửi bản nháp này?')) {
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

export default NotificationSection;
