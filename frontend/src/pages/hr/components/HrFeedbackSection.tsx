import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const HrFeedbackSection: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdminModal, setShowAdminModal] = useState<number | null>(null);
  const [adminComments, setAdminComments] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/hr/feedback/reports');
      if (response.data.success) {
        setReports(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Không thể tải danh sách báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: number) => {
    try {
      const response = await axios.put(`/api/hr/feedback/${id}/resolve`);
      if (response.data.success) {
        toast.success('Đã đánh dấu đã xử lý');
        fetchReports();
      }
    } catch (error) {
      toast.error('Lỗi khi xử lý báo cáo');
    }
  };

  const handleSendToAdmin = async (id: number) => {
    if (!adminComments.trim()) {
      toast.warning('Vui lòng nhập nội dung gửi Admin');
      return;
    }

    try {
      const report = reports.find(r => r.id === id);
      const response = await axios.post('/api/hr/feedback/to-admin', {
        comments: `[HR Escalation] ${adminComments}\n\nOriginal Report: ${report.comments}`,
        isViolation: true
      });

      if (response.data.success) {
        toast.success('Đã gửi cho Admin thành công');
        setShowAdminModal(null);
        setAdminComments('');
        fetchReports();
      }
    } catch (error) {
      toast.error('Lỗi khi gửi cho Admin');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Báo cáo vi phạm</h1>
        <p className="text-gray-600 mt-1">Xem và xử lý các báo cáo từ Trainer gửi về bộ phận HR</p>
      </div>

      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="bg-white rounded-lg p-10 text-center text-gray-500 border border-dashed border-gray-300">
            Không có báo cáo vi phạm nào cần xử lý.
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">Người gửi: {report.userName || 'Trainer'}</span>
                    <span className="text-sm text-gray-500">• {new Date(report.submittedAt).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      report.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {report.status === 'RESOLVED' ? 'Đã giải quyết' : 'Đang chờ'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {report.status !== 'RESOLVED' && (
                    <>
                      <button 
                        onClick={() => handleResolve(report.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-medium transition"
                      >
                        Đã xử lý
                      </button>
                      <button 
                        onClick={() => setShowAdminModal(report.id)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium transition"
                      >
                        Gửi Admin
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 rounded p-4 text-gray-800 whitespace-pre-wrap">
                {report.comments}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Admin Escalation Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">Chuyển tiếp cho Admin</h2>
            <textarea
              className="w-full border rounded-lg p-3 h-40 mb-4 resize-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ghi chú thêm cho Admin về báo cáo này..."
              value={adminComments}
              onChange={(e) => setAdminComments(e.target.value)}
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setShowAdminModal(null)}
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium"
              >
                Hủy
              </button>
              <button 
                onClick={() => handleSendToAdmin(showAdminModal)}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium"
              >
                Gửi Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HrFeedbackSection;
