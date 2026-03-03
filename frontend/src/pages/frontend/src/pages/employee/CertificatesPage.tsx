import { useState } from 'react';
import { mockCertificates, mockCourses } from '../../mocks/course.mock';
import { NoCertificates } from '../../components/common/EmptyState';
import { useToast } from '../../components/common/Toast';
import type { Certificate } from '../../types/course.types';

export default function CertificatesPage() {
  const [certificates] = useState(mockCertificates);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const { showToast } = useToast();

  const completedCourses = mockCourses.filter(c => c.status === 'completed');

  const handleDownloadCertificate = (cert: Certificate) => {
    showToast(`Chứng chỉ "${cert.courseName}" đã được gửi đến email: employee@itms.com`, 'success');
  };

  const handlePreviewCertificate = (cert: Certificate) => {
    setSelectedCert(cert);
  };

  const handleShareCertificate = (cert: Certificate) => {
    showToast(`Chia sẻ chứng chỉ "${cert.courseName}" thành công!`, 'success');
  };

  if (certificates.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Kết quả & Chứng chỉ</h1>
        <NoCertificates />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Kết quả & Chứng chỉ</h1>
        <p className="text-gray-600">Các kết quả học tập và chứng chỉ bạn đã đạt được</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Certificates Earned */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-5xl">🏆</span>
            <span className="text-4xl font-bold">{certificates.length}</span>
          </div>
          <div className="text-lg font-medium">Bạn đã có {certificates.length} chứng chỉ</div>
        </div>

        {/* Achievement Score */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Chia sẻ thành tích</div>
            <div className="text-xs opacity-90">
              Chia sẻ chứng chỉ lên mạng xã hội để khoe thành tích của bạn
            </div>
          </div>
          <button className="bg-white text-green-600 px-6 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors w-full">
            Chia sẻ
          </button>
        </div>
      </div>

      {/* Certificates List */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Lập trình Python cơ bản</h2>
          <p className="text-sm text-gray-600 mt-1">Điểm: 95/100</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {completedCourses.map(course => (
              <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{course.title}</h3>
                    <div className="text-sm text-gray-600 mt-1">
                      Điểm: {course.score}/100
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const cert = certificates.find(c => c.courseId === course.id);
                        if (cert) handlePreviewCertificate(cert);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                    >
                      Tải Chứng chỉ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All Certificates */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Tất cả chứng chỉ</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map(cert => (
              <div key={cert.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 mb-4 text-center">
                  <div className="text-4xl mb-2">🎓</div>
                  <div className="font-bold text-lg mb-1">{cert.courseName}</div>
                  <div className="text-sm text-gray-600">{cert.studentName}</div>
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(cert.completionDate).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="mt-3 text-2xl font-bold text-blue-600">
                    {cert.score}/100
                  </div>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => handleDownloadCertificate(cert)}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    📥 Tải về Email
                  </button>
                  <button
                    onClick={() => handlePreviewCertificate(cert)}
                    className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors text-sm"
                  >
                    👁️ Xem trước
                  </button>
                  <button
                    onClick={() => handleShareCertificate(cert)}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm"
                  >
                    📤 Chia sẻ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Certificate Preview Modal */}
      {selectedCert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Xem trước chứng chỉ</h3>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              {/* Certificate Preview */}
              <div className="border-4 border-blue-600 rounded-lg p-8 bg-gradient-to-br from-blue-50 to-white">
                <div className="text-center">
                  <div className="text-4xl mb-4">🎓</div>
                  <h2 className="text-3xl font-bold text-blue-600 mb-2">CHỨNG CHỈ</h2>
                  <p className="text-gray-600 mb-6">Chứng nhận hoàn thành khóa học</p>
                  
                  <div className="my-8">
                    <p className="text-sm text-gray-600 mb-2">Chứng chỉ này được trao cho</p>
                    <h3 className="text-2xl font-bold mb-4">{selectedCert.studentName}</h3>
                    
                    <p className="text-sm text-gray-600 mb-2">Đã hoàn thành xuất sắc khóa học</p>
                    <h4 className="text-xl font-semibold text-blue-600 mb-4">{selectedCert.courseName}</h4>
                    
                    <div className="flex justify-center gap-8 my-6">
                      <div>
                        <p className="text-sm text-gray-600">Điểm số</p>
                        <p className="text-2xl font-bold text-green-600">{selectedCert.score}/100</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Ngày hoàn thành</p>
                        <p className="text-lg font-semibold">
                          {new Date(selectedCert.completionDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t">
                      <p className="text-sm text-gray-600">Giảng viên</p>
                      <p className="font-semibold">{selectedCert.instructor}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => handleDownloadCertificate(selectedCert)}
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700 transition-colors"
                >
                  📥 Tải về Email
                </button>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded hover:bg-gray-300 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
