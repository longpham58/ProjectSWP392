import { useState } from 'react';
import { mockFeedbacks, FeedbackItem } from '../../../mocks/mockTrainerData';

type FilterType = 'all' | 'positive' | 'negative' | 'active' | 'proactive' | 'needImprovement' | 'suggestion';

export default function Feedback() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [feedbacks, setFeedbacks] = useState(mockFeedbacks);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const stats = [
    { label: 'Tất cả Feedback', value: feedbacks.length },
    { label: 'Tích cực', value: feedbacks.filter(f => f.category === 'positive').length },
    { label: 'Cần cải thiện', value: feedbacks.filter(f => f.category === 'suggestion').length },
    { label: 'Chưa xử lý', value: feedbacks.filter(f => f.status === 'pending').length }
  ];

  const filters = [
    { key: 'all', label: 'Tất cả' },
    { key: 'positive', label: 'Tích cực' },
    { key: 'suggestion', label: 'Góp ý' },
    { key: 'needImprovement', label: 'Cần cải thiện' }
  ];

  const handleViewDetail = (feedback: FeedbackItem) => {
    setSelectedFeedback(feedback);
    setShowDetail(true);
  };

  const handleReply = () => {
    setShowDetail(false);
    setShowReplyForm(true);
  };

  const handleSendReply = () => {
    if (!replyContent.trim()) {
      alert('Vui lòng nhập nội dung phản hồi');
      return;
    }

    // Mock: Cập nhật trạng thái feedback
    if (selectedFeedback) {
      setFeedbacks(feedbacks.map(f => 
        f.id === selectedFeedback.id 
          ? { ...f, status: 'completed' as const }
          : f
      ));
    }

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    
    setReplyContent('');
    setShowReplyForm(false);
    setSelectedFeedback(null);

    console.log('Reply sent:', {
      feedbackId: selectedFeedback?.id,
      reply: replyContent
    });
  };

  const handleMarkAsRead = (id: string) => {
    setFeedbacks(feedbacks.map(f => 
      f.id === id ? { ...f, status: 'completed' as const } : f
    ));
  };

  const filteredFeedbacks = activeFilter === 'all' 
    ? feedbacks 
    : feedbacks.filter(f => f.category === activeFilter);

  return (
    <div className="feedback-container">
      <div className="section-header">
        <h2>💬 Phản hồi từ học viên</h2>
      </div>

      {showSuccess && (
        <div className="success-message">
          <span className="success-icon">✅</span>
          <span>Gửi phản hồi thành công!</span>
        </div>
      )}

      <div className="feedback-stats">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="feedback-filters">
        <span className="filter-label">Lọc theo:</span>
        {filters.map((filter) => (
          <button
            key={filter.key}
            className={`filter-btn ${activeFilter === filter.key ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter.key as FilterType)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="feedback-list">
        {filteredFeedbacks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <h3>Chưa có feedback</h3>
            <p>Chưa có feedback nào trong mục này</p>
          </div>
        ) : (
          filteredFeedbacks.map((feedback) => (
            <div key={feedback.id} className="feedback-card">
              <div className="feedback-header">
                <div className="feedback-user">
                  <div className="user-avatar">👤</div>
                  <div className="user-info">
                    <div className="user-name">{feedback.studentName}</div>
                    <div className="user-meta">
                      📅 {feedback.date} • 📍 {feedback.studentId}
                    </div>
                  </div>
                </div>
                <div className="feedback-actions">
                  <button 
                    className={`btn-tag ${feedback.status === 'completed' ? 'completed' : 'pending'}`}
                  >
                    {feedback.status === 'completed' ? 'Đã xử lý' : 'Chưa xử lý'}
                  </button>
                  <span className={`category-badge ${feedback.category}`}>
                    {feedback.category === 'positive' ? '👍 Tích cực' : 
                     feedback.category === 'suggestion' ? '💡 Góp ý' : '⚠️ Cần cải thiện'}
                  </span>
                </div>
              </div>

              <div className="feedback-content">
                <p>{feedback.content}</p>
                <div className="feedback-rating">
                  {'⭐'.repeat(feedback.rating)}
                  <span className="rating-text">({feedback.rating}/5)</span>
                </div>
              </div>

              <div className="feedback-footer">
                <button 
                  className="btn-secondary"
                  onClick={() => handleViewDetail(feedback)}
                >
                  Xem chi tiết
                </button>
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setSelectedFeedback(feedback);
                    handleReply();
                  }}
                >
                  Gửi phản hồi
                </button>
                {feedback.status === 'pending' && (
                  <button 
                    className="btn-secondary"
                    onClick={() => handleMarkAsRead(feedback.id)}
                  >
                    Đánh dấu đã xử lý
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedFeedback && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal-content feedback-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowDetail(false)}>✕</button>
            
            <div className="feedback-detail-header">
              <div className="user-avatar large">👤</div>
              <div>
                <h2>{selectedFeedback.studentName}</h2>
                <div className="feedback-detail-meta">
                  <span>📅 {selectedFeedback.date}</span>
                  <span>📍 {selectedFeedback.studentId}</span>
                  <span className={`category-badge ${selectedFeedback.category}`}>
                    {selectedFeedback.category === 'positive' ? '👍 Tích cực' : 
                     selectedFeedback.category === 'suggestion' ? '💡 Góp ý' : '⚠️ Cần cải thiện'}
                  </span>
                </div>
              </div>
            </div>

            <div className="feedback-detail-body">
              <div className="detail-section">
                <h3>💬 Nội dung feedback</h3>
                <p>{selectedFeedback.content}</p>
              </div>

              <div className="detail-section">
                <h3>⭐ Đánh giá</h3>
                <div className="feedback-rating large">
                  {'⭐'.repeat(selectedFeedback.rating)}
                  <span className="rating-text">({selectedFeedback.rating}/5)</span>
                </div>
              </div>
            </div>

            <div className="detail-actions">
              <button className="btn-secondary" onClick={() => setShowDetail(false)}>
                Đóng
              </button>
              <button className="btn-primary" onClick={handleReply}>
                Gửi phản hồi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Form Modal */}
      {showReplyForm && selectedFeedback && (
        <div className="modal-overlay" onClick={() => setShowReplyForm(false)}>
          <div className="modal-content reply-form-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowReplyForm(false)}>✕</button>
            
            <h3>📝 Phản hồi feedback</h3>

            <div className="original-feedback">
              <h4>Feedback gốc từ {selectedFeedback.studentName}:</h4>
              <p>{selectedFeedback.content}</p>
              <div className="feedback-rating">
                {'⭐'.repeat(selectedFeedback.rating)}
              </div>
            </div>

            <div className="form-group">
              <label>Nội dung phản hồi của bạn *</label>
              <textarea
                className="textarea-field"
                rows={6}
                placeholder="Cảm ơn bạn đã góp ý. Tôi sẽ cố gắng cải thiện..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              ></textarea>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowReplyForm(false)}>
                Hủy
              </button>
              <button className="btn-primary" onClick={handleSendReply}>
                Gửi phản hồi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
