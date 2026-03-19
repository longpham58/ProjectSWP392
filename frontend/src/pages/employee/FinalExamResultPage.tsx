import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PartyPopper, Frown, Trophy } from 'lucide-react';

// This page is kept for backward compatibility but FinalExamPage now handles results inline
export default function FinalExamResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { score = 0, passed = false } = location.state || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-6">
        <div className={`rounded-xl shadow-lg p-8 text-center ${
          passed ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-pink-600'
        } text-white`}>
          <div className="flex justify-center mb-4">
            {passed ? <PartyPopper size={64} /> : <Frown size={64} />}
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {passed ? 'Chúc mừng! Bạn đã đạt!' : 'Chưa đạt yêu cầu'}
          </h1>
          <div className="text-6xl font-bold my-6">{score}%</div>
          <p className="opacity-90 mb-6">
            {passed ? 'Bạn đã hoàn thành xuất sắc bài thi cuối khóa!' : 'Đừng nản lòng, hãy ôn tập và thử lại!'}
          </p>
        </div>

        <div className="flex gap-4 mt-6">
          <button onClick={() => navigate(`/employee/course/${courseId}`)}
            className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium">
            Quay lại khóa học
          </button>
          {passed && (
            <button onClick={() => navigate('/employee/certificates')}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium flex items-center justify-center gap-2">
              <Trophy size={16} /> Xem chứng chỉ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
