import { useEffect, useState } from 'react';
import { useAuthStore } from '../../../stores/auth.store';
import { Star, MessageSquare, ThumbsUp, User, BookOpen, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:8080/api';

interface FeedbackItem {
  id: number;
  courseId: number | null;
  courseName: string | null;
  courseRating: number | null;
  trainerRating: number | null;
  contentRating: number | null;
  overallRating: number | null;
  comments: string | null;
  suggestions: string | null;
  wouldRecommend: boolean | null;
  isAnonymous: boolean;
  userName: string | null;
  userEmail: string | null;
  submittedAt: string;
  type: string;
  status: string;
}

function Stars({ value, size = 16 }: { value: number | null; size?: number }) {
  if (!value) return <span className="text-gray-400 text-xs">Chưa đánh giá</span>;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size} className={i <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
      ))}
      <span className="ml-1 text-sm font-medium text-gray-700">{value}/5</span>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className={`bg-white rounded-xl shadow p-5 flex items-center gap-4 border-l-4 ${color}`}>
      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">{icon}</div>
      <div>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  );
}

export default function FeedbackSection() {
  const { user } = useAuthStore();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<string>('all');

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    axios.get(`${API}/trainer/feedback`, { withCredentials: true })
      .then(res => {
        // Show COURSE_FEEDBACK (from employees) — exclude trainer-to-student and HR types
        const all: FeedbackItem[] = res.data?.data ?? [];
        const EXCLUDE = ['TRAINER_TO_STUDENT', 'REPORT_TO_HR', 'HR_TO_ADMIN'];
        setFeedbacks(all.filter(f => !EXCLUDE.includes(f.type)));
      })
      .catch(() => setFeedbacks([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const getRating = (f: FeedbackItem) => f.overallRating ?? f.trainerRating ?? 0;

  const total = feedbacks.length;
  const avgOverall = total
    ? (feedbacks.reduce((s, f) => s + getRating(f), 0) / total).toFixed(1)
    : '0';
  const avgTrainer = (() => {
    const withTrainer = feedbacks.filter(f => f.trainerRating);
    return withTrainer.length
      ? (withTrainer.reduce((s, f) => s + (f.trainerRating ?? 0), 0) / withTrainer.length).toFixed(1)
      : '0';
  })();
  const recommendCount = feedbacks.filter(f => f.wouldRecommend === true).length;

  // Unique courses
  const courses = Array.from(new Set(feedbacks.map(f => f.courseName).filter(Boolean))) as string[];

  // Filtered list
  const filtered = feedbacks.filter(f => {
    if (filterCourse !== 'all' && f.courseName !== filterCourse) return false;
    if (filterRating !== 'all') {
      const r = getRating(f);
      if (filterRating === '5' && r !== 5) return false;
      if (filterRating === '4' && r !== 4) return false;
      if (filterRating === '1-3' && r > 3) return false;
    }
    return true;
  });

  // Rating distribution
  const dist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: feedbacks.filter(f => getRating(f) === star).length,
  }));

  // Group by course for course summary cards
  const byCourse = courses.map(name => {
    const items = feedbacks.filter(f => f.courseName === name);
    const avg = items.length
      ? (items.reduce((s, f) => s + getRating(f), 0) / items.length).toFixed(1)
      : '0';
    return { name, count: items.length, avg };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare size={24} className="text-blue-600" /> Đánh giá từ học viên
        </h1>
        <p className="text-gray-500 text-sm mt-1">Phản hồi của học viên về các khóa học bạn giảng dạy</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Tổng đánh giá" value={total} icon={<MessageSquare size={18} className="text-blue-500" />} color="border-blue-500" />
        <StatCard label="Điểm TB tổng thể" value={avgOverall} icon={<Star size={18} className="text-yellow-500" />} color="border-yellow-500" />
        <StatCard label="Điểm TB giảng viên" value={avgTrainer} icon={<TrendingUp size={18} className="text-green-500" />} color="border-green-500" />
        <StatCard label="Giới thiệu cho người khác" value={`${recommendCount}/${total}`} icon={<ThumbsUp size={18} className="text-purple-500" />} color="border-purple-500" />
      </div>

      {/* Per-course summary */}
      {byCourse.length > 0 && (
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-semibold mb-3 text-gray-700 flex items-center gap-2">
            <BookOpen size={16} className="text-blue-500" /> Theo khóa học
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {byCourse.map(c => (
              <div
                key={c.name}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${filterCourse === c.name ? 'border-blue-400 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}
                onClick={() => setFilterCourse(filterCourse === c.name ? 'all' : c.name)}
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={14} className="text-blue-400" />
                  <span className="text-sm font-medium text-gray-800 line-clamp-1">{c.name}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-gray-500">{c.count} đánh giá</span>
                  <div className="flex items-center gap-0.5">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-semibold text-gray-700">{c.avg}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Distribution + filters */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-semibold mb-3 text-gray-700">Phân bố đánh giá</h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl font-bold text-yellow-500">{avgOverall}</div>
            <div>
              <div className="flex gap-0.5 mb-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={18} className={i <= Math.round(Number(avgOverall)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                ))}
              </div>
              <div className="text-sm text-gray-500">{total} đánh giá</div>
            </div>
          </div>
          {dist.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-2 mb-1.5">
              <span className="text-sm w-3 text-gray-600">{star}</span>
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div className="bg-yellow-400 h-2 rounded-full transition-all" style={{ width: total ? `${(count / total) * 100}%` : '0%' }} />
              </div>
              <span className="text-xs text-gray-500 w-5 text-right">{count}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-semibold mb-3 text-gray-700">Lọc đánh giá</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Khóa học</label>
              <select
                value={filterCourse}
                onChange={e => setFilterCourse(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả khóa học</option>
                {courses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Mức đánh giá</label>
              <select
                value={filterRating}
                onChange={e => setFilterRating(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="5">5 sao</option>
                <option value="4">4 sao</option>
                <option value="1-3">1–3 sao</option>
              </select>
            </div>
            <div className="pt-2 text-sm text-gray-500">
              Hiển thị <span className="font-semibold text-gray-800">{filtered.length}</span> / {total} đánh giá
            </div>
          </div>
        </div>
      </div>

      {/* Feedback list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-10 text-center text-gray-400">
            <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
            <p>{total === 0 ? 'Chưa có đánh giá nào từ học viên' : 'Không có đánh giá phù hợp với bộ lọc'}</p>
          </div>
        ) : filtered.map(f => {
          const isExpanded = expandedId === f.id;
          const displayName = f.isAnonymous ? 'Ẩn danh' : (f.userName ?? 'Học viên');
          const mainRating = getRating(f) || null;

          return (
            <div key={f.id} className="bg-white rounded-xl shadow overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : f.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                    <User size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-800">{displayName}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <BookOpen size={11} />
                      <span>{f.courseName ?? '—'}</span>
                      <span className="mx-1">·</span>
                      {new Date(f.submittedAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Stars value={mainRating} size={14} />
                  {f.wouldRecommend && (
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ThumbsUp size={10} /> Giới thiệu
                    </span>
                  )}
                  {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t px-4 pb-4 pt-3 space-y-3 bg-gray-50">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {([
                      { label: 'Khóa học', val: f.courseRating },
                      { label: 'Giảng viên', val: f.trainerRating },
                      { label: 'Nội dung', val: f.contentRating },
                      { label: 'Tổng thể', val: f.overallRating },
                    ] as { label: string; val: number | null }[]).filter(x => x.val != null).map(({ label, val }) => (
                      <div key={label} className="bg-white rounded-lg p-3 text-center shadow-sm">
                        <div className="text-xs text-gray-500 mb-1">{label}</div>
                        <Stars value={val} size={12} />
                      </div>
                    ))}
                  </div>

                  {f.comments && (
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-xs font-semibold text-gray-500 mb-1">Nhận xét</div>
                      <p className="text-sm text-gray-700">{f.comments}</p>
                    </div>
                  )}

                  {f.suggestions && (
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-xs font-semibold text-gray-500 mb-1">Góp ý cải thiện</div>
                      <p className="text-sm text-gray-700">{f.suggestions}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
