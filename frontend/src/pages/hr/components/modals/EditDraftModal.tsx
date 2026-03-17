import React, { useState, useEffect } from 'react';
import * as hrNotificationApi from '../../../../api/notification-hr.api';

interface EditDraftModalProps {
  draft: {
    id: number;
    title: string;
    message: string;
    priority: string;
    recipientType?: string;
    classCodes?: string;
  };
  onClose: () => void;
  onSave: (updatedData: any) => void;
  onSend: (id: number) => void;
}

type ClassItem = { code: string; name: string };
type TrainerItem = { id: string; fullName: string; username: string };

const parseRecipient = (recipientType?: string) => {
  switch (recipientType) {
    case 'ALL_EMPLOYEES': return { category: 'EMPLOYEES' as const, type: 'ALL' as const };
    case 'STUDENTS':      return { category: 'EMPLOYEES' as const, type: 'BY_CLASS' as const };
    case 'ALL_TRAINERS':  return { category: 'TRAINERS' as const, type: 'ALL' as const };
    case 'TRAINERS':      return { category: 'TRAINERS' as const, type: 'BY_CLASS' as const };
    default:              return { category: 'EMPLOYEES' as const, type: 'ALL' as const };
  }
};

const EditDraftModal: React.FC<EditDraftModalProps> = ({ draft, onClose, onSave, onSend }) => {
  const initial = parseRecipient(draft.recipientType);
  const [recipientCategory, setRecipientCategory] = useState<'EMPLOYEES' | 'TRAINERS'>(initial.category);
  const [recipientType, setRecipientType] = useState<'ALL' | 'BY_CLASS'>(initial.type);
  const [selectedClasses, setSelectedClasses] = useState<string[]>(
    draft.classCodes ? draft.classCodes.split(',').filter(Boolean) : []
  );
  const [selectedTrainers, setSelectedTrainers] = useState<string[]>([]);
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'LOW'>((draft.priority as any) || 'NORMAL');
  const [title, setTitle] = useState(draft.title);
  const [content, setContent] = useState(draft.message);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [trainers, setTrainers] = useState<TrainerItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingTrainers, setLoadingTrainers] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingClasses(true);
      setLoadingTrainers(true);
      try {
        const [classData, trainerData] = await Promise.all([
          hrNotificationApi.getHrClasses(),
          hrNotificationApi.getHrTrainers()
        ]);
        setClasses(classData);
        setTrainers(trainerData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoadingClasses(false);
        setLoadingTrainers(false);
      }
    };
    fetchData();
  }, []);

  const toggleClass = (code: string) =>
    setSelectedClasses(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);

  const toggleAllClasses = () =>
    setSelectedClasses(prev => prev.length === classes.length ? [] : classes.map(c => c.code));

  const toggleTrainer = (id: string) =>
    setSelectedTrainers(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);

  const toggleAllTrainers = () =>
    setSelectedTrainers(prev => prev.length === trainers.length ? [] : trainers.map(t => t.id));

  const getRecipientTypeForAPI = () => {
    if (recipientCategory === 'EMPLOYEES') return recipientType === 'ALL' ? 'ALL_EMPLOYEES' : 'STUDENTS';
    return recipientType === 'ALL' ? 'ALL_TRAINERS' : 'TRAINERS';
  };

  const handleSave = () => {
    onSave({
      title, message: content, type: 'GENERAL', priority,
      recipientType: getRecipientTypeForAPI(),
      classCodes: recipientCategory === 'EMPLOYEES' && recipientType === 'BY_CLASS' ? selectedClasses : undefined,
      trainerIds: recipientCategory === 'TRAINERS' && recipientType === 'BY_CLASS' ? selectedTrainers : undefined,
      isDraft: true
    });
  };

  const handleSend = () => {
    if (!title.trim() || !content.trim()) { alert('Vui lòng nhập đầy đủ tiêu đề và nội dung'); return; }
    if (recipientCategory === 'EMPLOYEES' && recipientType === 'BY_CLASS' && selectedClasses.length === 0) {
      alert('Vui lòng chọn ít nhất một lớp học'); return;
    }
    if (recipientCategory === 'TRAINERS' && recipientType === 'BY_CLASS' && selectedTrainers.length === 0) {
      alert('Vui lòng chọn ít nhất một giảng viên'); return;
    }
    handleSave();
    onSend(draft.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xl">📝</div>
          <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa bản nháp</h2>
        </div>

        {/* Recipient Selection - 2 dropdowns */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Gửi đến *</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">👥 Nhân viên</label>
              <select
                value={recipientCategory === 'EMPLOYEES' ? recipientType : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setRecipientCategory('EMPLOYEES');
                    setRecipientType(e.target.value as 'ALL' | 'BY_CLASS');
                    setSelectedClasses([]);
                    setSelectedTrainers([]);
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
              <label className="block text-sm font-medium text-gray-600 mb-2">👨‍🏫 Giảng viên</label>
              <select
                value={recipientCategory === 'TRAINERS' ? recipientType : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setRecipientCategory('TRAINERS');
                    setRecipientType(e.target.value as 'ALL' | 'BY_CLASS');
                    setSelectedClasses([]);
                    setSelectedTrainers([]);
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
        </div>

        {/* Class list */}
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
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={selectedClasses.length === classes.length && classes.length > 0}
                      onChange={toggleAllClasses} className="w-4 h-4 text-green-600 rounded" />
                    <span className="font-semibold text-green-900">Chọn tất cả ({classes.length} lớp)</span>
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
                {selectedClasses.length > 0 && <p className="mt-2 text-sm text-green-700">Đã chọn {selectedClasses.length} lớp</p>}
              </>
            )}
          </div>
        )}

        {/* Trainer list */}
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
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={selectedTrainers.length === trainers.length && trainers.length > 0}
                      onChange={toggleAllTrainers} className="w-4 h-4 text-green-600 rounded" />
                    <span className="font-semibold text-green-900">Chọn tất cả ({trainers.length} giảng viên)</span>
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
                {selectedTrainers.length > 0 && <p className="mt-2 text-sm text-green-700">Đã chọn {selectedTrainers.length} giảng viên</p>}
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
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề thông báo"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
        </div>

        {/* Content */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nội dung *</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)}
            placeholder="Nhập nội dung thông báo..." rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none" />
          <p className="text-sm text-gray-500 mt-1">{content.length} ký tự</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium">Hủy</button>
          <button onClick={handleSave} className="px-6 py-3 border-2 border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition font-medium">Lưu nháp</button>
          <button onClick={handleSend} className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium">Gửi ngay</button>
        </div>
      </div>
    </div>
  );
};

export default EditDraftModal;
