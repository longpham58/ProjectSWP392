import { useEffect, useState } from 'react';
import { employeeApi, CommentDto, FeedbackDto } from '../../../api/employee.api';
import { useAuthStore } from '../../../stores/auth.store';
import { ThumbsUp, Reply, Trash2, Send, MessageSquare, Star } from 'lucide-react';

interface Props {
  courseId: number;
}

// ─── Feedback Section ─────────────────────────────────────────────────────────

function FeedbackSection({ courseId, userId }: { courseId: number; userId: number }) {
  const [feedbacks, setFeedbacks] = useState<FeedbackDto[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [myFeedback, setMyFeedback] = useState<FeedbackDto | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadFeedbacks();
  }, [courseId]);

  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await employeeApi.getFeedbacks(courseId);
      const data = res.data;
      setFeedbacks(data);
      const mine = data.find(f => f.userId === userId) ?? null;
      setMyFeedback(mine);
      if (mine) {
        setRating(mine.rating);
        setComment(mine.comment);
      }
    } catch (e) {
      console.error('Failed to load feedbacks', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await employeeApi.upsertFeedback(courseId, { userId, rating, comment });
      await loadFeedbacks();
      setShowForm(false);
    } catch (e) {
      console.error('Failed to submit feedback', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!myFeedback) return;
    if (!confirm('Xóa đánh giá của bạn?')) return;
    try {
      await employeeApi.deleteFeedback(courseId, myFeedback.id, userId);
      setMyFeedback(null);
      setRating(5);
      setComment('');
      await loadFeedbacks();
    } catch (e) {
      console.error('Failed to delete feedback', e);
    }
  };

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
    : '0';

  const renderStars = (n: number, interactive = false, onChange?: (v: number) => void) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type={interactive ? 'button' : undefined}
          onClick={() => interactive && onChange?.(i)}
          className={`text-2xl ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} ${i <= n ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          ★
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-white rounded-xl shadow p-6 flex items-center gap-8">
        <div className="text-center">
          <div className="text-5xl font-bold text-yellow-500">{avgRating}</div>
          <div className="mt-1">{renderStars(Math.round(Number(avgRating)))}</div>
          <div className="text-sm text-gray-500 mt-1">{feedbacks.length} đánh giá</div>
        </div>
        <div className="flex-1">
          {[5, 4, 3, 2, 1].map(star => {
            const count = feedbacks.filter(f => f.rating === star).length;
            const pct = feedbacks.length ? (count / feedbacks.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 mb-1">
                <span className="text-sm w-4">{star}</span>
                <span className="text-yellow-400 text-sm">★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-6">{count}</span>
              </div>
            );
          })}
        </div>
        <div>
          {!myFeedback ? (
            <button
              onClick={() => setShowForm(true)}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
            >
              <Star size={14} /> Viết đánh giá
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm flex items-center gap-1"
              >
                Sửa
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm flex items-center gap-1"
              >
                <Trash2 size={13} /> Xóa
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-bold text-lg mb-4">{myFeedback ? 'Sửa đánh giá' : 'Viết đánh giá'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá sao</label>
              {renderStars(rating, true, setRating)}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nhận xét</label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={4}
                placeholder="Chia sẻ trải nghiệm của bạn về khóa học này..."
                className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
              >
                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Đang tải...</div>
      ) : feedbacks.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <MessageSquare size={36} className="mx-auto mb-2 opacity-30" />
          <div>Chưa có đánh giá nào. Hãy là người đầu tiên!</div>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map(fb => (
            <div key={fb.id} className="bg-white rounded-xl shadow p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                    {fb.userName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{fb.userName}</div>
                    <div className="text-xs text-gray-400">{new Date(fb.createdAt).toLocaleDateString('vi-VN')}</div>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className={`text-lg ${i <= fb.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{fb.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Comment Item ─────────────────────────────────────────────────────────────

function CommentItem({
  comment, courseId, userId, onRefresh
}: {
  comment: CommentDto; courseId: number; userId: number; onRefresh: () => void;
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await employeeApi.addComment(courseId, { userId, content: replyText, parentId: comment.id });
      setReplyText('');
      setShowReply(false);
      onRefresh();
    } catch (e) {
      console.error('Failed to reply', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async () => {
    try {
      await employeeApi.likeComment(comment.id, userId);
      onRefresh();
    } catch (e) {
      console.error('Failed to like', e);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Xóa bình luận này?')) return;
    try {
      await employeeApi.deleteComment(comment.id, userId);
      onRefresh();
    } catch (e) {
      console.error('Failed to delete', e);
    }
  };

  return (
    <div className="flex gap-3">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        {comment.userName?.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1">
        <div className="bg-gray-50 rounded-xl px-4 py-3">
          <div className="font-medium text-sm mb-1">{comment.userName}</div>
          <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
        </div>
        <div className="flex items-center gap-4 mt-1 px-2">
          <button onClick={handleLike} className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1">
            <ThumbsUp size={12} /> {comment.likeCount > 0 && <span>{comment.likeCount}</span>}
          </button>
          <button onClick={() => setShowReply(!showReply)} className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1">
            <Reply size={12} /> Trả lời
          </button>
          {comment.userId === userId && (
            <button onClick={handleDelete} className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1">
              <Trash2 size={12} /> Xóa
            </button>
          )}
          <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString('vi-VN')}</span>
        </div>

        {/* Reply form */}
        {showReply && (
          <form onSubmit={handleReply} className="mt-2 flex gap-2">
            <input
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Viết trả lời..."
              className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={submitting || !replyText.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
            >
              <Send size={13} /> Gửi
            </button>
          </form>
        )}

        {/* Replies */}
        {comment.replies?.length > 0 && (
          <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-100">
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} courseId={courseId} userId={userId} onRefresh={onRefresh} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Discussion Section ───────────────────────────────────────────────────────

function DiscussionSection({ courseId, userId }: { courseId: number; userId: number }) {
  const [data, setData] = useState<{ comments: CommentDto[]; hasNext: boolean }>({ comments: [], hasNext: false });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments(0);
  }, [courseId]);

  const loadComments = async (p: number) => {
    setLoading(true);
    try {
      const res = await employeeApi.getComments(courseId, p, 10);
      const d = res.data;
      setData({ comments: p === 0 ? d.comments : [...data.comments, ...d.comments], hasNext: d.hasNext });
      setPage(p);
    } catch (e) {
      console.error('Failed to load comments', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await employeeApi.addComment(courseId, { userId, content: text });
      setText('');
      loadComments(0);
    } catch (e) {
      console.error('Failed to add comment', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-white rounded-xl shadow p-5">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            T
          </div>
          <div className="flex-1 flex gap-2">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Đặt câu hỏi hoặc chia sẻ suy nghĩ về khóa học..."
              className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? '...' : 'Đăng'}
            </button>
          </div>
        </form>
      </div>

      {/* Comments */}
      {loading && page === 0 ? (
        <div className="text-center py-8 text-gray-500">Đang tải...</div>
      ) : data.comments.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <MessageSquare size={36} className="mx-auto mb-2 opacity-30" />
          <div>Chưa có thảo luận nào. Hãy bắt đầu cuộc trò chuyện!</div>
        </div>
      ) : (
        <div className="space-y-5">
          {data.comments.map(c => (
            <CommentItem key={c.id} comment={c} courseId={courseId} userId={userId} onRefresh={() => loadComments(0)} />
          ))}
          {data.hasNext && (
            <button
              onClick={() => loadComments(page + 1)}
              disabled={loading}
              className="w-full py-3 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium border border-blue-200"
            >
              {loading ? 'Đang tải...' : 'Xem thêm bình luận'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function DiscussionTab({ courseId }: Props) {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'discussion' | 'feedback'>('discussion');

  if (!user) return null;

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab('discussion')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'discussion' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <MessageSquare size={14} /> Thảo luận
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'feedback' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Star size={14} /> Đánh giá
        </button>
      </div>

      {activeTab === 'discussion' ? (
        <DiscussionSection courseId={courseId} userId={user.id} />
      ) : (
        <FeedbackSection courseId={courseId} userId={user.id} />
      )}
    </div>
  );
}
