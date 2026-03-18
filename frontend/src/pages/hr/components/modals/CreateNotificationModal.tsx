import React, { useState, useEffect } from 'react';
import * as hrNotificationApi from '../../../../api/notification-hr.api';

interface CreateNotificationModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateNotificationModal: React.FC<CreateNotificationModalProps> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  
  const [recipient, setRecipient] = useState<'STUDENTS' | 'TRAINERS'>('STUDENTS');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedTrainers, setSelectedTrainers] = useState<string[]>([]);
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'LOW'>('NORMAL');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const [availableClasses, setAvailableClasses] = useState<Array<{ code: string; name: string }>>([]);
  const [availableTrainers, setAvailableTrainers] = useState<Array<{ id: string; fullName: string; username: string }>>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingTrainers, setLoadingTrainers] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      setLoadingCourses(true);
      try {
        const response = await hrNotificationApi.getHrClasses();
        if (response && Array.isArray(response)) {
          setAvailableClasses(response);
        } else {
          setAvailableClasses([]);
        }
      } catch (err: any) {
        setAvailableClasses([]);
      } finally {
        setLoadingCourses(false);
      }
    };

    const fetchTrainers = async () => {
      setLoadingTrainers(true);
      try {
        const response = await hrNotificationApi.getHrTrainers();
        if (response && Array.isArray(response)) {
          setAvailableTrainers(response);
        } else {
          setAvailableTrainers([]);
        }
      } catch (err: any) {
        setAvailableTrainers([]);
      } finally {
        setLoadingTrainers(false);
      }
    };

    fetchClasses();
    fetchTrainers();
  }, []);

  const toggleClass = (classCode: string) => {
    setSelectedClasses(prev => prev.includes(classCode) ? prev.filter(c => c !== classCode) : [...prev, classCode]);
    setErrors({ ...errors, selectedClasses: '' });
  };

  const toggleAllClasses = () => {
    if (selectedClasses.length === availableClasses.length) {
      setSelectedClasses([]);
    } else {
      setSelectedClasses(availableClasses.map(c => c.code));
    }
    setErrors({ ...errors, selectedClasses: '' });
  };

  const toggleTrainer = (id: string) => {
    setSelectedTrainers(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
    setErrors({ ...errors, selectedTrainers: '' });
  };

  const toggleAllTrainers = () => {
    if (selectedTrainers.length === availableTrainers.length) {
      setSelectedTrainers([]);
    } else {
      setSelectedTrainers(availableTrainers.map(t => t.id));
    }
    setErrors({ ...errors, selectedTrainers: '' });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề';
    if (!content.trim()) newErrors.content = 'Vui lòng nhập nội dung';
    if (recipient === 'STUDENTS' && selectedClasses.length === 0) newErrors.selectedClasses = 'Vui lòng chọn ít nhất một lớp học';
    if (recipient === 'TRAINERS' && selectedTrainers.length === 0) newErrors.selectedTrainers = 'Vui lòng chọn ít nhất một giảng viên';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = (isDraft: boolean) => ({
    title,
    message: content,
    type: 'GENERAL',
    priority,
    recipientType: recipient,
    classCodes: recipient === 'STUDENTS' ? selectedClasses : undefined,
    trainerIds: recipient === 'TRAINERS' ? selectedTrainers : undefined,
    isDraft
  });

  const handleSend = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await hrNotificationApi.createHrNotification(buildPayload(false));
      alert('Đã gửi thông báo thành công!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      alert('Gửi thông báo thất bại! ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!title.trim() && !content.trim()) {
      alert('Vui lòng nhập ít nhất tiêu đề hoặc nội dung');
      return;
    }
    setLoading(true);
    try {
      await hrNotificationApi.createHrNotification(buildPayload(true));
      alert('Đã lưu nháp thành công!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      alert('Lưu nháp thất bại! ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">N</div>
          <h2 className="text-2xl font-bold text-gray-900">Soạn thông báo mới</h2>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Gửi đến *</label>
          <div className="flex gap-4">
            <button
              onClick={() => setRecipient('STUDENTS')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${recipient === 'STUDENTS' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-gray-400'}`}
            >
              <div className="flex items-center gap-2"><span>Học viên</span></div>
              <div className="text-xs text-gray-600 mt-1">(Gửi đến các lớp học)</div>
            </button>
            <button
              onClick={() => setRecipient('TRAINERS')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${recipient === 'TRAINERS' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-gray-400'}`}
            >
              <div className="flex items-center gap-2"><span>Giảng viên</span></div>
              <div className="text-xs text-gray-600 mt-1">(Gửi đến giảng viên)</div>
            </button>
          </div>
        </div>

        {recipient === 'STUDENTS' && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Chọn lớp học *</label>
            {loadingCourses ? <div className="text-center py-4 text-gray-500">Đang tải danh sách lớp học...</div> : availableClasses.length === 0 ? <div className="text-center py-4 text-gray-500">Không có lớp học nào</div> : (
              <>
                <div className="mb-3 p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" checked={selectedClasses.length === availableClasses.length} onChange={toggleAllClasses} className="w-5 h-5 text-blue-600 rounded mr-3" />
                    <div className="flex-1">
                      <span className="font-semibold text-blue-900">Chọn tất cả lớp học</span>
                      <p className="text-sm text-blue-700 mt-1">Gửi thông báo đến tất cả {availableClasses.length} lớp học</p>
                    </div>
                  </label>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {availableClasses.map((course) => (
                    <div key={course.code} className={`p-3 rounded-lg border-2 transition ${selectedClasses.includes(course.code) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                      <label className="flex items-center cursor-pointer">
                        <input type="checkbox" checked={selectedClasses.includes(course.code)} onChange={() => toggleClass(course.code)} className="w-5 h-5 text-blue-600 rounded mr-3" />
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">{course.code}</span>
                          <p className="text-sm text-gray-600">{course.name}</p>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
                {errors.selectedClasses && <p className="text-red-500 text-sm mt-2">{errors.selectedClasses}</p>}
              </>
            )}
          </div>
        )}

        {recipient === 'TRAINERS' && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Chọn giảng viên *</label>
            {loadingTrainers ? <div className="text-center py-4 text-gray-500">Đang tải danh sách giảng viên...</div> : availableTrainers.length === 0 ? <div className="text-center py-4 text-gray-500">Không có giảng viên nào</div> : (
              <>
                <div className="mb-3 p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" checked={selectedTrainers.length === availableTrainers.length} onChange={toggleAllTrainers} className="w-5 h-5 text-blue-600 rounded mr-3" />
                    <div className="flex-1">
                      <span className="font-semibold text-blue-900">Chọn tất cả giảng viên</span>
                      <p className="text-sm text-blue-700 mt-1">Gửi thông báo đến tất cả {availableTrainers.length} giảng viên</p>
                    </div>
                  </label>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {availableTrainers.map((trainer) => (
                    <div key={trainer.id} className={`p-3 rounded-lg border-2 transition ${selectedTrainers.includes(trainer.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                      <label className="flex items-center cursor-pointer">
                        <input type="checkbox" checked={selectedTrainers.includes(trainer.id)} onChange={() => toggleTrainer(trainer.id)} className="w-5 h-5 text-blue-600 rounded mr-3" />
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">{trainer.fullName}</span>
                          <p className="text-sm text-gray-600">{trainer.username}</p>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
                {errors.selectedTrainers && <p className="text-red-500 text-sm mt-2">{errors.selectedTrainers}</p>}
              </>
            )}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Mức độ ưu tiên</label>
          <div className="flex gap-3">
            <button onClick={() => setPriority('NORMAL')} className={`px-6 py-2 rounded-lg border-2 transition ${priority === 'NORMAL' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300'}`}>Bình thường</button>
            <button onClick={() => setPriority('HIGH')} className={`px-6 py-2 rounded-lg border-2 transition ${priority === 'HIGH' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-300'}`}>Khẩn cấp</button>
            <button onClick={() => setPriority('LOW')} className={`px-6 py-2 rounded-lg border-2 transition ${priority === 'LOW' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300'}`}>Thông tin</button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề *</label>
          <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); setErrors({ ...errors, title: '' }); }} placeholder="Nhập tiêu đề thông báo" className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`} />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nội dung *</label>
          <textarea value={content} onChange={(e) => { setContent(e.target.value); setErrors({ ...errors, content: '' }); }} placeholder="Nhập nội dung thông báo..." rows={8} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none ${errors.content ? 'border-red-500' : 'border-gray-300'}`} />
          {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium" disabled={loading}>Hủy</button>
          <button onClick={handleSaveDraft} className="px-6 py-3 border-2 border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition font-medium" disabled={loading}>Lưu nháp</button>
          <button onClick={handleSend} className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium disabled:opacity-50" disabled={loading}>{loading ? 'Đang gửi...' : 'Gửi ngay'}</button>
        </div>
      </div>
    </div>
  );
};

export default CreateNotificationModal;
