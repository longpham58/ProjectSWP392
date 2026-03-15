import React, { useState } from 'react';
import type { NotificationDto, NotificationRequest } from '../../../../api/notification-trainer.api';

interface EditDraftModalProps {
  draft: NotificationDto;
  onClose: () => void;
  onSave: (id: number, updatedData: NotificationRequest) => void;
  onSend: (id: number) => void;
}

const EditDraftModal: React.FC<EditDraftModalProps> = ({ draft, onClose, onSave, onSend }) => {
  const [recipient, setRecipient] = useState<'students' | 'hr'>(
    draft.recipients?.some(r => r.includes('ITM')) ? 'students' : 'hr'
  );
  const [selectedClasses, setSelectedClasses] = useState<string[]>(
    draft.recipients?.filter(r => r.includes('ITM')) || []
  );
  const [priority, setPriority] = useState(
    draft.priority === 'HIGH' ? 'urgent' : draft.priority === 'LOW' ? 'info' : 'normal'
  );
  const [title, setTitle] = useState(draft.title);
  const [content, setContent] = useState(draft.message);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const availableClasses = ['ITM5001-M01', 'ITM5002-M02', 'ITM5003-M03'];

  const toggleClass = (classCode: string) => {
    setSelectedClasses(prev =>
      prev.includes(classCode)
        ? prev.filter(c => c !== classCode)
        : [...prev, classCode]
    );
    setErrors({ ...errors, selectedClasses: '' });
  };

  const toggleAllClasses = () => {
    if (selectedClasses.length === availableClasses.length) {
      setSelectedClasses([]);
    } else {
      setSelectedClasses([...availableClasses]);
    }
    setErrors({ ...errors, selectedClasses: '' });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề';
    }

    if (!content.trim()) {
      newErrors.content = 'Vui lòng nhập nội dung';
    }

    if (recipient === 'students' && selectedClasses.length === 0) {
      newErrors.selectedClasses = 'Vui lòng chọn ít nhất một lớp học';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (title.trim() || content.trim()) {
      const priorityMap = {
        'normal': 'MEDIUM' as const,
        'urgent': 'HIGH' as const,
        'info': 'LOW' as const
      };

      onSave(draft.id, {
        title,
        message: content,
        type: 'GENERAL',
        priority: priorityMap[priority as keyof typeof priorityMap],
        recipientType: recipient === 'students' ? 'STUDENTS' : 'HR',
        classCodes: recipient === 'students' ? selectedClasses : undefined,
        isDraft: true
      });
      alert('Đã cập nhật bản nháp thành công!');
    } else {
      alert('Vui lòng nhập ít nhất tiêu đề hoặc nội dung');
    }
  };

  const handleSend = () => {
    if (validate()) {
      onSend(draft.id);
      alert('Đã gửi thông báo thành công!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
            E
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa bản nháp</h2>
        </div>

        {/* Recipient */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Gửi đến *</label>
          <div className="flex gap-4">
            <button
              onClick={() => setRecipient('students')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
                recipient === 'students'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>Học viên</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">(Gửi đến các lớp học)</div>
            </button>
            <button
              onClick={() => setRecipient('hr')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition ${
                recipient === 'hr'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>HR / Quản lý</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">(Gửi đến bộ phận HR)</div>
            </button>
          </div>
        </div>

        {/* Class Selection */}
        {recipient === 'students' && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Chọn lớp học *</label>
            
            {/* Select All Option */}
            <div className="mb-3 p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedClasses.length === availableClasses.length}
                  onChange={toggleAllClasses}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mr-3"
                />
                <div className="flex-1">
                  <span className="font-semibold text-blue-900">Chọn tất cả lớp học</span>
                  <p className="text-sm text-blue-700 mt-1">
                    Gửi thông báo đến tất cả {availableClasses.length} lớp học
                  </p>
                </div>
              </label>
            </div>

            {/* Individual Classes */}
            <div className="space-y-2">
              {availableClasses.map((classCode) => (
                <div
                  key={classCode}
                  className={`p-3 rounded-lg border-2 transition ${
                    selectedClasses.includes(classCode)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedClasses.includes(classCode)}
                      onChange={() => toggleClass(classCode)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mr-3"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">{classCode}</span>
                    </div>
                  </label>
                </div>
              ))}
            </div>

            {/* Selected Count */}
            {selectedClasses.length > 0 && (
              <div className="mt-3 p-2 bg-green-50 rounded-lg text-sm text-green-700">
                Đã chọn {selectedClasses.length} lớp học
              </div>
            )}

            {errors.selectedClasses && (
              <p className="text-red-500 text-sm mt-2">{errors.selectedClasses}</p>
            )}
          </div>
        )}

        {/* Priority */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Mức độ ưu tiên</label>
          <div className="flex gap-3">
            <button
              onClick={() => setPriority('normal')}
              className={`px-6 py-2 rounded-lg border-2 transition ${
                priority === 'normal'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              Bình thường
            </button>
            <button
              onClick={() => setPriority('urgent')}
              className={`px-6 py-2 rounded-lg border-2 transition ${
                priority === 'urgent'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              Khẩn cấp
            </button>
            <button
              onClick={() => setPriority('info')}
              className={`px-6 py-2 rounded-lg border-2 transition ${
                priority === 'info'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              Thông tin
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setErrors({ ...errors, title: '' });
            }}
            placeholder="Nhắc nhở lịch học"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Content */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nội dung *</label>
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setErrors({ ...errors, content: '' });
            }}
            placeholder="Nhập nội dung thông báo..."
            rows={8}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
              errors.content ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">{errors.content}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">{content.length} ký tự</p>
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
            onClick={handleSave}
            className="px-6 py-3 border-2 border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition font-medium"
          >
            Lưu thay đổi
          </button>
          <button
            onClick={handleSend}
            className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
          >
            Gửi ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditDraftModal;