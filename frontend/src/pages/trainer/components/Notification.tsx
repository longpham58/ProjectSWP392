import { useState } from 'react';
import { mockNotifications, mockCoursesList, NotificationItem } from '../../../mocks/mockTrainerData';

interface DraftNotification {
  id: string;
  title: string;
  content: string;
  recipient: 'students' | 'hr';
  priority: 'normal' | 'urgent' | 'info';
  selectedCourse?: string;
  date: string;
}

export default function Notification() {
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'draft'>('inbox');
  const [showCompose, setShowCompose] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [recipient, setRecipient] = useState<'students' | 'hr'>('students');
  const [priority, setPriority] = useState<'normal' | 'urgent' | 'info'>('normal');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [notifications, setNotifications] = useState(mockNotifications);
  const [sentNotifications, setSentNotifications] = useState<NotificationItem[]>([]);
  const [draftNotifications, setDraftNotifications] = useState<DraftNotification[]>([]);

  const handleViewDetail = (notif: NotificationItem) => {
    setSelectedNotification(notif);
    setShowDetail(true);
    // Đánh dấu đã đọc
    setNotifications(notifications.map(n => 
      n.id === notif.id ? { ...n, isRead: true } : n
    ));
  };

  const handleSendNotification = () => {
    if (!title || !content) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (recipient === 'students' && !selectedCourse) {
      alert('Vui lòng chọn lớp học');
      return;
    }

    // Mock: Thêm vào danh sách đã gửi
    const newNotif: NotificationItem = {
      id: Date.now().toString(),
      title,
      content,
      type: priority === 'urgent' ? 'urgent' : 'info',
      date: 'Vừa xong',
      isRead: true,
      sender: 'Bạn'
    };

    setSentNotifications([newNotif, ...sentNotifications]);

    // Hiển thị thông báo thành công
    setSuccessMessage('Gửi thông báo thành công!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    // Reset form và chuyển sang tab "Đã gửi"
    resetForm();
    setShowCompose(false);
    setActiveTab('sent');
  };

  const handleSaveDraft = () => {
    if (!title && !content) {
      alert('Vui lòng nhập ít nhất tiêu đề hoặc nội dung');
      return;
    }

    const newDraft: DraftNotification = {
      id: Date.now().toString(),
      title: title || '(Chưa có tiêu đề)',
      content: content || '(Chưa có nội dung)',
      recipient,
      priority,
      selectedCourse,
      date: 'Vừa xong'
    };

    setDraftNotifications([newDraft, ...draftNotifications]);

    // Hiển thị thông báo thành công
    setSuccessMessage('Lưu nháp thành công!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    // Reset form và chuyển sang tab "Nháp"
    resetForm();
    setShowCompose(false);
    setActiveTab('draft');
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSelectedCourse('');
    setPriority('normal');
    setRecipient('students');
  };

  const handleEditDraft = (draft: DraftNotification) => {
    setTitle(draft.title === '(Chưa có tiêu đề)' ? '' : draft.title);
    setContent(draft.content === '(Chưa có nội dung)' ? '' : draft.content);
    setRecipient(draft.recipient);
    setPriority(draft.priority);
    setSelectedCourse(draft.selectedCourse || '');
    
    // Xóa draft khỏi danh sách
    setDraftNotifications(draftNotifications.filter(d => d.id !== draft.id));
    
    setShowCompose(true);
  };

  const handleDeleteDraft = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa bản nháp này?')) {
      setDraftNotifications(draftNotifications.filter(d => d.id !== id));
      setSuccessMessage('Xóa bản nháp thành công!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa thông báo này?')) {
      setNotifications(notifications.filter(n => n.id !== id));
    }
  };

  const getDisplayNotifications = () => {
    if (activeTab === 'inbox') {
      return notifications.filter(n => !n.sender || n.sender !== 'Bạn');
    }
    if (activeTab === 'sent') {
      return sentNotifications;
    }
    return []; // draft - handled separately
  };

  const filteredNotifications = getDisplayNotifications();

  return (
    <div className="notification-container">
      <div className="section-header">
        <h2>📧 Trung tâm Thông báo</h2>
        <button className="btn-primary" onClick={() => setShowCompose(true)}>
          + Soạn Thông Báo
        </button>
      </div>

      {showSuccess && (
        <div className="success-message">
          <span className="success-icon">✅</span>
          <span>{successMessage}</span>
        </div>
      )}

      <p className="section-subtitle">
        Nhận và gửi thông báo đến học viên, HR, và ban quản lý
      </p>

      <div className="notification-tabs">
        <button
          className={`tab-btn ${activeTab === 'inbox' ? 'active' : ''}`}
          onClick={() => setActiveTab('inbox')}
        >
          Hộp thư đến ({notifications.filter(n => !n.isRead && n.sender !== 'Bạn').length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          Đã Gửi ({sentNotifications.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'draft' ? 'active' : ''}`}
          onClick={() => setActiveTab('draft')}
        >
          Nháp ({draftNotifications.length})
        </button>
      </div>

      <div className="notification-search">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm thông báo"
          className="search-input"
        />
      </div>

      <div className="notification-list">
        {activeTab === 'draft' ? (
          draftNotifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>Không có bản nháp</h3>
              <p>Chưa có bản nháp nào được lưu</p>
            </div>
          ) : (
            draftNotifications.map((draft) => (
              <div key={draft.id} className="notification-item draft">
                <div className="notif-icon">📝</div>
                <div className="notif-content">
                  <div className="notif-header">
                    <h4>{draft.title}</h4>
                    <span className="badge-draft">Bản nháp</span>
                  </div>
                  <p>{draft.content.substring(0, 100)}...</p>
                  <span className="notif-date">
                    Gửi đến: {draft.recipient === 'students' ? 'Học viên' : 'HR'} • {draft.date}
                  </span>
                </div>
                <div className="notif-actions">
                  <button 
                    className="btn-icon"
                    onClick={() => handleEditDraft(draft)}
                  >
                    Chỉnh sửa
                  </button>
                  <button 
                    className="btn-icon delete"
                    onClick={() => handleDeleteDraft(draft.id)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))
          )
        ) : filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>Không có thông báo</h3>
            <p>Chưa có thông báo nào trong mục này</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`notification-item ${notif.type} ${!notif.isRead ? 'unread' : ''}`}
            >
              <div className="notif-icon">
                {notif.type === 'urgent' ? '🚨' : '💬'}
              </div>
              <div className="notif-content">
                <div className="notif-header">
                  <h4>{notif.title}</h4>
                  {notif.type === 'urgent' && <span className="badge-urgent">Khẩn cấp</span>}
                  {!notif.isRead && <span className="badge-unread">Mới</span>}
                </div>
                <p>{notif.content.substring(0, 100)}...</p>
                <span className="notif-date">
                  {notif.sender && `Từ: ${notif.sender} • `}{notif.date}
                </span>
              </div>
              <div className="notif-actions">
                <button 
                  className="btn-icon"
                  onClick={() => handleViewDetail(notif)}
                >
                  Xem chi tiết
                </button>
                {!notif.isRead && (
                  <button 
                    className="btn-icon"
                    onClick={() => handleMarkAsRead(notif.id)}
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
                <button 
                  className="btn-icon delete"
                  onClick={() => handleDelete(notif.id)}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="modal-overlay" onClick={() => setShowCompose(false)}>
          <div className="modal-content compose-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowCompose(false)}>✕</button>
            <h3>📧 Soạn thông báo mới</h3>

            <div className="form-group">
              <label>Gửi đến *</label>
              <div className="recipient-options">
                <button
                  className={`recipient-btn ${recipient === 'students' ? 'active' : ''}`}
                  onClick={() => setRecipient('students')}
                >
                  👥 Học viên<br />
                  <small>Gửi đến các lớp học</small>
                </button>
                <button
                  className={`recipient-btn ${recipient === 'hr' ? 'active' : ''}`}
                  onClick={() => setRecipient('hr')}
                >
                  💼 HR / Quản lý<br />
                  <small>Gửi đến bộ phận HR</small>
                </button>
              </div>
            </div>

            {recipient === 'students' && (
              <div className="form-group">
                <label>Chọn lớp học *</label>
                <select 
                  className="select-field"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="">Chọn lớp học</option>
                  {mockCoursesList.map((course) => (
                    <option key={course.code} value={course.code}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Mức độ ưu tiên</label>
              <div className="priority-options">
                <button
                  className={`priority-btn ${priority === 'normal' ? 'active' : ''}`}
                  onClick={() => setPriority('normal')}
                >
                  Bình thường
                </button>
                <button
                  className={`priority-btn ${priority === 'urgent' ? 'active' : ''}`}
                  onClick={() => setPriority('urgent')}
                >
                  🚨 Khẩn cấp
                </button>
                <button
                  className={`priority-btn ${priority === 'info' ? 'active' : ''}`}
                  onClick={() => setPriority('info')}
                >
                  📘 Thông tin
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Tiêu đề *</label>
              <input 
                type="text" 
                placeholder="Nhắc nhở lịch học" 
                className="input-field"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Nội dung *</label>
              <textarea
                placeholder="Kính gửi các bạn học viên..."
                className="textarea-field"
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              ></textarea>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => {
                if (title || content) {
                  if (confirm('Bạn có muốn hủy? Các thay đổi sẽ không được lưu.')) {
                    resetForm();
                    setShowCompose(false);
                  }
                } else {
                  setShowCompose(false);
                }
              }}>
                Hủy
              </button>
              <button className="btn-secondary" onClick={handleSaveDraft}>
                💾 Lưu Nháp
              </button>
              <button className="btn-primary" onClick={handleSendNotification}>
                📤 Gửi ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && selectedNotification && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal-content notification-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowDetail(false)}>✕</button>
            
            <div className="notification-detail-header">
              <div className="notification-detail-icon">
                {selectedNotification.type === 'urgent' ? '🚨' : '💬'}
              </div>
              <div className="notification-detail-info">
                <h2>{selectedNotification.title}</h2>
                {selectedNotification.type === 'urgent' && (
                  <span className="badge-urgent">Khẩn cấp</span>
                )}
                <div className="notification-detail-meta">
                  {selectedNotification.sender && <span>Từ: {selectedNotification.sender}</span>}
                  <span>{selectedNotification.date}</span>
                </div>
              </div>
            </div>

            <div className="notification-detail-body">
              <p>{selectedNotification.content}</p>
            </div>

            <div className="detail-actions">
              <button className="btn-secondary" onClick={() => setShowDetail(false)}>
                Đóng
              </button>
              <button className="btn-primary">Trả lời</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
