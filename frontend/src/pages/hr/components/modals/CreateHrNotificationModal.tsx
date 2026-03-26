import React, { useState, useEffect } from 'react';
import * as hrNotificationApi from '../../../../api/notification-hr.api';

interface CreateHrNotificationModalProps {
  onClose: () => void;
}

type ClassItem = { code: string; name: string };
type TrainerItem = { id: string; fullName: string; username: string };

const CreateHrNotificationModal: React.FC<CreateHrNotificationModalProps> = ({ onClose }) => {
  const [recipientCategory, setRecipientCategory] = useState<'EMPLOYEES' | 'TRAINERS' | ''>('');
  const [recipientType, setRecipientType] = useState<'ALL' | 'BY_CLASS' | ''>('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedTrainers, setSelectedTrainers] = useState<string[]>([]);
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'LOW'>('NORMAL');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [trainers, setTrainers] = useState<TrainerItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingTrainers, setLoadingTrainers] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingClasses(true);
      setLoadingTrainers(true);
      try {
        const [classData, trainerData] = await Promise.all([
          hrNotificationApi.getHrClasses(),
          hrNotificationApi.getHrTrainers()
        ]);
        console.log('Classes from DB:', classData);
        console.log('Trainers from DB:', trainerData);
        setClasses(classData);
        setTrainers(trainerData);
      } catch (err: any) {
        console.error('Failed to fetch data:', err);
        console.error('Status:', err?.response?.status);
        console.error('Response:', err?.response?.data);
      } finally {
        setLoadingClasses(false);
        setLoadingTrainers(false);
      }
    };
    fetchData();
  }, []);

  const toggleClass = (code: string) => {
    setSelectedClasses(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
    setErrors(e => ({ ...e, selectedClasses: '' }));
  };

  const toggleAllClasses = () => {
    setSelectedClasses(prev => prev.length === classes.length ? [] : classes.map(c => c.code));
  };

  const toggleTrainer = (id: string) => {
    setSelectedTrainers(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
    setErrors(e => ({ ...e, selectedTrainers: '' }));
  };

  const toggleAllTrainers = () => {
    setSelectedTrainers(prev => prev.length === trainers.length ? [] : trainers.map(t => t.id));
  };

  const getRecipientTypeForAPI = () => {
    if (recipientCategory === 'EMPLOYEES') return recipientType === 'ALL' ? 'ALL_EMPLOYEES' : 'STUDENTS';
    if (recipientCategory === 'TRAINERS') return recipientType === 'ALL' ? 'ALL_TRAINERS' : 'TRAINERS';
    return 'ALL_EMPLOYEES';
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!recipientCategory || !recipientType) newErrors.recipient = 'Vui lòng chọn người nhận';
    if (!title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề';
    if (!content.trim()) newErrors.content = 'Vui lòng nhập nội dung';
    if (recipientCategory === 'EMPLOYEES' && recipientType === 'BY_CLASS' && selectedClasses.length === 0)
      newErrors.selectedClasses = 'Vui lòng chọn ít nhất một lớp học';
    if (recipientCategory === 'TRAINERS' && recipientType === 'BY_CLASS' && selectedTrainers.length === 0)
      newErrors.selectedTrainers = 'Vui lòng chọn ít nhất một giảng viên';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = (isDraft: boolean) => ({
    title,
    message: content,
    type: 'GENERAL',
    priority,
    recipientType: getRecipientTypeForAPI() as any,
    classCodes: recipientCategory === 'EMPLOYEES' && recipientType === 'BY_CLASS' ? selectedClasses : undefined,
    trainerIds: recipientCategory === 'TRAINERS' && recipientType === 'BY_CLASS' ? selectedTrainers : undefined,
    isDraft
  });

  const handleSend = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      await hrNotificationApi.createHrNotification(buildPayload(false));
      alert('Đã gửi thông báo thành công!');
      onClose();
    } catch (err: any) {
      alert('Gửi thất bại! ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!title.trim() && !content.trim()) { alert('Vui lòng nhập ít nhất tiêu đề hoặc nội dung'); return; }
    try {
      setLoading(true);
      await hrNotificationApi.createHrNotification(buildPayload(true));
      alert('Đã lưu nháp thành công!');
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
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">HR</div>
          <h2 className="text-2xl font-bold text-gray-900">Soạn thông báo mới</h2>
        </div>

        {/* Recipient Selection - 2 dropdowns */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Gửi đến *</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Nhân viên</label>
              <select
                value={recipientCategory === 'EMPLOYEES' ? recipientType : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setRecipientCategory('EMPLOYEES');
                    setRecipientType(e.target.value as 'ALL' | 'BY_CLASS');
                    setSelectedClasses([]);
                    setSelectedTrainers([]);
                    setErrors(er => ({ ...er, recipient: '', selectedClasses: '' }));
                  } else {
                    setRecipientCategory('');
                    setRecipientType('');
                  }
                }}
                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  recipientCategory === 'EMPLOYEES' ? 'border-green-500 bg-green-50' : 'border-gray-300'
                }`}
              >
                <option value="">-- Chọn --</option>
                <option value="ALL">Tất cả nhân viên</option>
                <option value="BY_CLASS">Nhân viên theo lớp</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Giảng viên</label>
              <select
                value={recipientCategory === 'TRAINERS' ? recipientType : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setRecipientCategory('TRAINERS');
                    setRecipientType(e.target.value as 'ALL' | 'BY_CLASS');
                    setSelectedClasses([]);
                    setSelectedTrainers([]);
                    setErrors(er => ({ ...er, recipient: '', selectedTrainers: '' }));
                  } else {
                    setRecipientCategory('');
                    setRecipientType('');
                  }
                }}
                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  recipientCategory === 'TRAINERS' ? 'border-green-500 bg-green-50' : 'border-gray-300'
                }`}
              >
                <option value="">-- Chọn --</option>
                <option value="ALL">Tất cả giảng viên</option>
                <option value="BY_CLASS">Chọn giảng viên cụ thể</option>
              </select>
            </div>
          </div>
          {errors.recipient && <p className="text-red-500 text-sm mt-2">{errors.recipient}</p>}
        </div>

        {/* Class list - shown when EMPLOYEES + BY_CLASS */}
        {recipientCategory === 'EMPLOYEES' && recipientType === 'BY_CLASS' && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Chọn lớp học *</label>
            {loadingClasses ? (
              <div className="text-center py-4 text-gray-500">Đang tải...</div>
            ) : classes.length === 0 ? (
              <div className="text-center py-4 text-gray-400">Không có lớp học nào trong database</div>
            ) : (
              <>
                <div className="mb-2 p-3 bg-green-50 rounded-lg border-2 border-green-200">
                  <label className="flex items-center cursor-pointer gap-3">
                    <input type="checkbox" checked={selectedClasses.length === classes.length && classes.length > 0}
                      onChange={toggleAllClasses} className="w-4 h-4 text-green-600 rounded" />
                    <div>
                      <span className="font-semibold text-green-900">Chọn tất cả lớp học</span>
                      <p className="text-xs text-green-700">Tất cả {classes.length} lớp</p>
                    </div>
                  </label>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {classes.map(c => (
                    <div key={c.code} className={`p-3 rounded-lg border-2 transition cursor-pointer ${
                      selectedClasses.includes(c.code) ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                    }`} onClick={() => toggleClass(c.code)}>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={selectedClasses.includes(c.code)}
                          onChange={() => toggleClass(c.code)} className="w-4 h-4 text-green-600 rounded" />
                        <div>
                          <span className="font-medium text-gray-900">{c.code}</span>
                          <p className="text-sm text-gray-500">{c.name}</p>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
                {selectedClasses.length > 0 && (
                  <p className="mt-2 text-sm text-green-700">Đã chọn {selectedClasses.length} lớp</p>
                )}
                {errors.selectedClasses && <p className="text-red-500 text-sm mt-1">{errors.selectedClasses}</p>}
              </>
            )}
          </div>
        )}

        {/* Trainer list - shown when TRAINERS + BY_CLASS */}
        {recipientCategory === 'TRAINERS' && recipientType === 'BY_CLASS' && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Chọn giảng viên *</label>
            {loadingTrainers ? (
              <div className="text-center py-4 text-gray-500">Đang tải...</div>
            ) : trainers.length === 0 ? (
              <div className="text-center py-4 text-gray-400">Không có giảng viên nào trong database</div>
            ) : (
              <>
                <div className="mb-2 p-3 bg-green-50 rounded-lg border-2 border-green-200">
                  <label className="flex items-center cursor-pointer gap-3">
                    <input type="checkbox" checked={selectedTrainers.length === trainers.length && trainers.length > 0}
                      onChange={toggleAllTrainers} className="w-4 h-4 text-green-600 rounded" />
                    <div>
                      <span className="font-semibold text-green-900">Chọn tất cả giảng viên</span>
                      <p className="text-xs text-green-700">Tất cả {trainers.length} giảng viên</p>
                    </div>
                  </label>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {trainers.map(t => (
                    <div key={t.id} className={`p-3 rounded-lg border-2 transition cursor-pointer ${
                      selectedTrainers.includes(t.id) ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                    }`} onClick={() => toggleTrainer(t.id)}>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={selectedTrainers.includes(t.id)}
                          onChange={() => toggleTrainer(t.id)} className="w-4 h-4 text-green-600 rounded" />
                        <div>
                          <span className="font-medium text-gray-900">{t.fullName}</span>
                          <p className="text-sm text-gray-500">@{t.username}</p>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
                {selectedTrainers.length > 0 && (
                  <p className="mt-2 text-sm text-green-700">Đã chọn {selectedTrainers.length} giảng viên</p>
                )}
                {errors.selectedTrainers && <p className="text-red-500 text-sm mt-1">{errors.selectedTrainers}</p>}
              </>
            )}
          </div>
        )}

        {/* Priority */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Mức độ ưu tiên</label>
          <div className="flex gap-3">
            {(['NORMAL', 'HIGH', 'LOW'] as const).map(p => (
              <button key={p} onClick={() => setPriority(p)}
                className={`px-6 py-2 rounded-lg border-2 transition ${
                  priority === p
                    ? p === 'HIGH' ? 'border-red-500 bg-red-50 text-red-700'
                      : p === 'LOW' ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}>
                {p === 'NORMAL' ? 'Bình thường' : p === 'HIGH' ? 'Khẩn cấp' : 'Thông tin'}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề *</label>
          <input type="text" value={title}
            onChange={(e) => { setTitle(e.target.value); setErrors(er => ({ ...er, title: '' })); }}
            placeholder="Nhập tiêu đề thông báo"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        {/* Content */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nội dung *</label>
          <textarea value={content}
            onChange={(e) => { setContent(e.target.value); setErrors(er => ({ ...er, content: '' })); }}
            placeholder="Nhập nội dung thông báo..." rows={6}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${errors.content ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
          <p className="text-sm text-gray-500 mt-1">{content.length} ký tự</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium">
            Hủy
          </button>
          <button onClick={handleSaveDraft} disabled={loading}
            className="px-6 py-3 border-2 border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition font-medium">
            Lưu nháp
          </button>
          <button onClick={handleSend} disabled={loading}
            className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium disabled:opacity-50">
            {loading ? 'Đang gửi...' : 'Gửi ngay'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateHrNotificationModal;
