import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { StudentFeedback } from '../../../data/mockTrainerData';

type FilterCategory = 'Tất cả' | 'Ẩn danh' | 'Công khai' | 'Tích cực' | 'Cần cải thiện' | 'Góp ý';

const FeedbackSection: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('Tất cả');
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [showReplyModal, setShowReplyModal] = useState<number | null>(null);
  const [showSendToHRModal, setShowSendToHRModal] = useState(false);
  const [selectedFeedbacksForHR, setSelectedFeedbacksForHR] = useState<number[]>([]);
  const [showSendToStudentModal, setShowSendToStudentModal] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/trainer/feedback');
      if (response.data.success) {
        setFeedbacks(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      toast.error('Không thể tải danh sách feedback');
    } finally {
      setLoading(false);
    }
  };

  const categories: FilterCategory[] = ['Tất cả', 'Ẩn danh', 'Công khai', 'Tích cực', 'Cần cải thiện', 'Góp ý'];

  const getCategoryCount = (category: FilterCategory) => {
    if (category === 'Tất cả') return feedbacks.length;
    return feedbacks.filter(f => {
      if (category === 'Ẩn danh') return f.isAnonymous;
      if (category === 'Công khai') return !f.isAnonymous;
      // Other categories need logic or backend support
      return false;
    }).length;
  };

  const filteredFeedbacks = selectedCategory === 'Tất cả'
    ? feedbacks
    : feedbacks.filter(f => {
        if (selectedCategory === 'Ẩn danh') return f.isAnonymous;
        if (selectedCategory === 'Công khai') return !f.isAnonymous;
        return true;
      });

  const handleReply = async (feedbackId: number) => {
    const reply = replyText[feedbackId];
    if (reply && reply.trim()) {
      try {
        const response = await axios.post(`/api/trainer/feedback/${feedbackId}/reply`, { reply });
        if (response.data.success) {
          toast.success('Đã gửi phản hồi');
          fetchFeedbacks();
          setReplyText({ ...replyText, [feedbackId]: '' });
          setShowReplyModal(null);
        }
      } catch (error) {
        toast.error('Lỗi khi gửi phản hồi');
      }
    }
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
      toast.warning('Vui lòng chọn ít nhất một feedback để báo cáo');
      return;
    }
    setShowSendToHRModal(true);
  };

  const handleSendToStudent = () => {
    setShowSendToStudentModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
          <button 
            onClick={handleSendToStudent}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
          >
            Gửi Feedback cho Học viên
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
          <div className="text-sm text-gray-600 mt-1">Chưa Đọc</div>
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
            <h3 className="font-semibold text-gray-900 mb-1">Báo cáo vi phạm cho HR</h3>
            <p className="text-sm text-gray-600">
              Chọn các feedback cần báo cáo vi phạm và gửi cho bộ phận HR để xử lý
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
              Gửi báo cáo HR
            </button>
          </div>
        </div>
      </div>

      {/* Feedbacks List */}
      <div className="space-y-4">
        {filteredFeedbacks.map((feedback) => (
          <div
            key={feedback.id}
            className={`bg-gray-50 rounded-lg p-6 border border-gray-100 hover:shadow-md transition ${!feedback.isRead ? 'border-l-4 border-blue-500' : ''} ${
              selectedFeedbacksForHR.includes(feedback.id) ? 'ring-2 ring-orange-500' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Checkbox for HR report */}
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
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white text-xl">
                    ?
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {feedback.userName ? feedback.userName.charAt(0) : 'U'}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900">
                      {feedback.isAnonymous ? 'Học viên (Ẩn danh)' : feedback.userName}
                    </h4>
                    <div className="text-sm text-gray-500">
                      ID: {feedback.isAnonymous ? '****' : feedback.userEmail}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {feedback.type === 'COURSE_FEEDBACK' && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        Course Feedback
                      </span>
                    )}
                    {feedback.isViolation && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                        Bị báo cáo
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <div className="flex text-yellow-400">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className={i < (feedback.overallRating || 0) ? 'text-lg' : 'text-gray-200 text-lg'}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(feedback.submittedAt).toLocaleDateString('vi-VN')}
                  </span>
                  {!feedback.isRead && (
                    <span className="text-sm text-blue-600 font-medium">● Mới</span>
                  )}
                </div>

                <p className="text-gray-700 mb-4 whitespace-pre-wrap">{feedback.comments}</p>
                {feedback.suggestions && (
                  <div className="bg-gray-100 rounded p-3 mb-4 text-sm text-gray-600">
                    <span className="font-semibold block mb-1">Góp ý cải thiện:</span>
                    {feedback.suggestions}
                  </div>
                )}

                {/* Reply logic here if needed */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowReplyModal(feedback.id)}
                    className="px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50 text-sm font-medium transition"
                  >
                    Phản hồi
                  </button>
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
          onSuccess={() => {
            fetchFeedbacks();
            setSelectedFeedbacksForHR([]);
            setShowSendToHRModal(false);
          }}
        />
      )}

      {/* Send to Student Modal */}
      {showSendToStudentModal && (
        <SendToStudentModal 
          onClose={() => setShowSendToStudentModal(false)}
          onSuccess={() => {
            setShowSendToStudentModal(false);
            fetchFeedbacks();
          }}
        />
      )}
    </div>
  );
};

// Send to HR Modal
const SendToHRModal: React.FC<{
  selectedFeedbacks: any[];
  onClose: () => void;
  onSuccess: () => void;
}> = ({ selectedFeedbacks, onClose, onSuccess }) => {
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSend = async () => {
    if (!comments.trim()) {
      toast.warning('Vui lòng nhập nội dung báo cáo');
      return;
    }

    try {
      setSubmitting(true);
      const reportContent = `Báo cáo vi phạm cho ${selectedFeedbacks.length} feedback:\n\n` + 
        selectedFeedbacks.map(f => `- [${f.userName || 'Ẩn danh'}]: ${f.comments}`).join('\n') + 
        `\n\nLý do: ${comments}`;

      const response = await axios.post('/api/trainer/report-hr', {
        comments: reportContent,
        isViolation: true
      });

      if (response.data.success) {
        toast.success('Đã gửi báo cáo cho HR');
        onSuccess();
      }
    } catch (error) {
      toast.error('Lỗi khi gửi báo cáo');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <h2 className="text-xl font-bold mb-4">Báo cáo vi phạm cho HR</h2>
        <div className="mb-4 text-sm text-gray-600 bg-orange-50 p-3 rounded">
          Bạn đang báo cáo <strong>{selectedFeedbacks.length}</strong> feedback vi phạm quy tắc.
        </div>
        <textarea
          className="w-full border rounded-lg p-3 h-32 mb-4 resize-none focus:ring-2 focus:ring-orange-500"
          placeholder="Mô tả lý do báo cáo vi phạm..."
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            Hủy
          </button>
          <button 
            onClick={handleSend}
            disabled={submitting}
            className="flex-1 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium disabled:opacity-50"
          >
            {submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Send to Student Modal
const SendToStudentModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [recipientId, setRecipientId] = useState('');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSend = async () => {
    if (!recipientId || !comments.trim()) {
      toast.warning('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post('/api/trainer/feedback/student', {
        recipientId: parseInt(recipientId),
        comments
      });

      if (response.data.success) {
        toast.success('Đã gửi feedback cho học viên');
        onSuccess();
      }
    } catch (error) {
      toast.error('Lỗi khi gửi feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <h2 className="text-xl font-bold mb-4">Gửi Feedback cho Học viên</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mã HP / ID Học viên</label>
          <input 
            type="number"
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập ID học viên..."
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung Feedback</label>
          <textarea
            className="w-full border rounded-lg p-3 h-32 resize-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập nội dung góp ý cho học viên..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            Hủy
          </button>
          <button 
            onClick={handleSend}
            disabled={submitting}
            className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium disabled:opacity-50"
          >
            {submitting ? 'Đang gửi...' : 'Gửi Feedback'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackSection;
