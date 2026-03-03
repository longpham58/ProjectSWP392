import React, { useState } from 'react';
import { mockFeedbacks, StudentFeedback } from '../../../data/mockTrainerData';

type FilterCategory = 'Tất cả' | 'Ẩn danh' | 'Công khai' | 'Tích cực' | 'Cần cải thiện' | 'Góp ý';

const FeedbackSection: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<StudentFeedback[]>(mockFeedbacks);
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('Tất cả');
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
  const [showReplyModal, setShowReplyModal] = useState<number | null>(null);
  const [showSendToHRModal, setShowSendToHRModal] = useState(false);
  const [selectedFeedbacksForHR, setSelectedFeedbacksForHR] = useState<number[]>([]);

  const categories: FilterCategory[] = ['Tất cả', 'Ẩn danh', 'Công khai', 'Tích cực', 'Cần cải thiện', 'Góp ý'];

  const getCategoryCount = (category: FilterCategory) => {
    if (category === 'Tất cả') return feedbacks.length;
    return feedbacks.filter(f => f.category === category).length;
  };

  const filteredFeedbacks = selectedCategory === 'Tất cả'
    ? feedbacks
    : feedbacks.filter(f => f.category === selectedCategory);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400 text-lg' : 'text-gray-300 text-lg'}>
        ★
      </span>
    ));
  };

  const handleReply = (feedbackId: number) => {
    const reply = replyText[feedbackId];
    if (reply && reply.trim()) {
      setFeedbacks(feedbacks.map(f =>
        f.id === feedbackId ? { ...f, reply, isRead: true } : f
      ));
      setReplyText({ ...replyText, [feedbackId]: '' });
      setShowReplyModal(null);
    }
  };

  const markAsRead = (feedbackId: number) => {
    setFeedbacks(feedbacks.map(f =>
      f.id === feedbackId ? { ...f, isRead: true } : f
    ));
  };

  const toggleSelectFeedback = (feedbackId: number) => {
    setSelectedFeedbacksForHR(prev =>
      prev.includes(feedbackId)
        ? prev.filter(id => id !== feedbackId)
        : [...prev, feedbackId]
    );
  };

  const handleSendToHR = () => {
    if (selectedFeedbacksForHR.length === 0) {
      alert('Vui lòng chọn ít nhất một feedback để gửi cho HR');
      return;
    }
    setShowSendToHRModal(true);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white text-xl font-bold">
              T
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Feedback</h1>
            </div>
          </div>
          <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium">
            Feedback
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-cyan-100 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-gray-900">{feedbacks.length}</div>
          <div className="text-sm text-gray-600 mt-1">Tổng Feedback</div>
        </div>
        <div className="bg-cyan-100 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-gray-900">{getCategoryCount('Ẩn danh')}</div>
          <div className="text-sm text-gray-600 mt-1">Ẩn danh</div>
        </div>
        <div className="bg-cyan-100 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-gray-900">{getCategoryCount('Công khai')}</div>
          <div className="text-sm text-gray-600 mt-1">Công khai</div>
        </div>
        <div className="bg-cyan-100 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-gray-900">{feedbacks.filter(f => !f.isRead).length}</div>
          <div className="text-sm text-gray-600 mt-1">Chưa Xử Lý</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-cyan-100 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm font-semibold text-gray-700">Lọc theo:</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition ${
                selectedCategory === category
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Label */}
      <div className="bg-orange-100 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Gửi feedback cho HR</h3>
            <p className="text-sm text-gray-600">
              Chọn các feedback cần báo cáo và gửi cho bộ phận HR để xử lý
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectedFeedbacksForHR.length > 0 && (
              <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-semibold">
                {selectedFeedbacksForHR.length} đã chọn
              </span>
            )}
            <button
              onClick={handleSendToHR}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={selectedFeedbacksForHR.length === 0}
            >
              Gửi cho HR
            </button>
          </div>
        </div>
      </div>

      {/* Feedbacks List */}
      <div className="space-y-4">
        {filteredFeedbacks.map((feedback) => (
          <div
            key={feedback.id}
            className={`bg-gray-100 rounded-lg p-6 ${!feedback.isRead ? 'border-l-4 border-blue-500' : ''} ${
              selectedFeedbacksForHR.includes(feedback.id) ? 'ring-2 ring-orange-500' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Checkbox */}
              <div className="flex-shrink-0 pt-1">
                <input
                  type="checkbox"
                  checked={selectedFeedbacksForHR.includes(feedback.id)}
                  onChange={() => toggleSelectFeedback(feedback.id)}
                  className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500 cursor-pointer"
                />
              </div>

              {/* Avatar */}
              <div className="flex-shrink-0">
                {feedback.isAnonymous ? (
                  <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center text-white text-xl">
                    ?
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {feedback.studentName.charAt(0)}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900">{feedback.studentName}</h4>
                    <div className="text-sm text-gray-600">{feedback.courseCode}</div>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full">
                      {feedback.category}
                    </span>
                    <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full">
                      Tích cực
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-red-500">🔥 {feedback.date}</span>
                  <span className="text-sm text-gray-600">• {feedback.rating}</span>
                  {!feedback.isRead && (
                    <span className="ml-auto text-sm text-blue-600 font-medium">● Chưa đọc</span>
                  )}
                </div>

                <p className="text-gray-700 mb-4">{feedback.comment}</p>

                {/* Reply Section */}
                {feedback.reply ? (
                  <div className="bg-green-50 rounded-lg p-4 mb-3">
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">Reply:</span>
                      <div>
                        <div className="text-sm font-semibold text-green-800 mb-1">Phản hồi của bạn:</div>
                        <p className="text-sm text-gray-700">{feedback.reply}</p>
                      </div>
                    </div>
                  </div>
                ) : showReplyModal === feedback.id ? (
                  <div className="bg-white rounded-lg p-4 mb-3 border-2 border-blue-500">
                    <textarea
                      value={replyText[feedback.id] || ''}
                      onChange={(e) => setReplyText({ ...replyText, [feedback.id]: e.target.value })}
                      placeholder="Nhập phản hồi của bạn..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleReply(feedback.id)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                      >
                        Gửi phản hồi
                      </button>
                      <button
                        onClick={() => setShowReplyModal(null)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Actions */}
                <div className="flex gap-2">
                  {!feedback.reply && (
                    <button
                      onClick={() => setShowReplyModal(feedback.id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                    >
                      Trả lời
                    </button>
                  )}
                  {!feedback.isRead && (
                    <button
                      onClick={() => markAsRead(feedback.id)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
                    >
                      Đánh dấu đã đọc
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Send to HR Modal */}
      {showSendToHRModal && (
        <SendToHRModal
          selectedFeedbacks={feedbacks.filter(f => selectedFeedbacksForHR.includes(f.id))}
          onClose={() => setShowSendToHRModal(false)}
          onSend={() => {
            alert(`Đã gửi ${selectedFeedbacksForHR.length} feedback cho HR thành công!`);
            setSelectedFeedbacksForHR([]);
            setShowSendToHRModal(false);
          }}
        />
      )}
    </div>
  );
};

// Send to HR Modal Component
const SendToHRModal: React.FC<{
  selectedFeedbacks: StudentFeedback[];
  onClose: () => void;
  onSend: () => void;
}> = ({ selectedFeedbacks, onClose, onSend }) => {
  const [subject, setSubject] = useState('Báo cáo feedback từ học viên');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');

  const negativeFeedbacks = selectedFeedbacks.filter(f => f.rating < 3);
  const positiveFeedbacks = selectedFeedbacks.filter(f => f.rating >= 4);

  const handleSend = () => {
    if (!message.trim()) {
      alert('Vui lòng nhập nội dung báo cáo');
      return;
    }
    onSend();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xl">
                HR
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Gửi feedback cho HR</h2>
                <p className="text-sm text-gray-600">Báo cáo {selectedFeedbacks.length} feedback cần xử lý</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              X
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{selectedFeedbacks.length}</div>
              <div className="text-sm text-gray-600 mt-1">Tổng feedback</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{positiveFeedbacks.length}</div>
              <div className="text-sm text-gray-600 mt-1">Tích cực</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-red-600">{negativeFeedbacks.length}</div>
              <div className="text-sm text-gray-600 mt-1">Cần cải thiện</div>
            </div>
          </div>

          {/* Priority */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Mức độ ưu tiên</label>
            <div className="flex gap-3">
              <button
                onClick={() => setPriority('normal')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
                  priority === 'normal'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Bình thường
              </button>
              <button
                onClick={() => setPriority('urgent')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
                  priority === 'urgent'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Khẩn cấp
              </button>
            </div>
          </div>

          {/* Subject */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Message */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nội dung báo cáo</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Kính gửi bộ phận HR,\n\nTôi xin báo cáo ${selectedFeedbacks.length} feedback từ học viên cần được xem xét và xử lý:\n\n- ${negativeFeedbacks.length} feedback tiêu cực cần cải thiện\n- ${positiveFeedbacks.length} feedback tích cực\n\nVui lòng xem xét và có biện pháp phù hợp.\n\nTrân trọng.`}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">{message.length} ký tự</p>
          </div>

          {/* Selected Feedbacks Preview */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Feedback đã chọn ({selectedFeedbacks.length})
            </label>
            <div className="max-h-60 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
              {selectedFeedbacks.map((feedback) => (
                <div key={feedback.id} className="bg-gray-50 rounded p-3 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900">{feedback.studentName}</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 line-clamp-2">{feedback.comment}</p>
                </div>
              ))}
            </div>
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
              onClick={handleSend}
              className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
            >
              Gửi cho HR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackSection;
