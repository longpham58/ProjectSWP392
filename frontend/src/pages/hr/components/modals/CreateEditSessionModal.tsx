import React, { useState, useEffect } from 'react';
import { useTrainerScheduleStore } from '../../../../stores/trainerSchedule.store';
import { CreateSessionRequest, UpdateSessionRequest, TrainerScheduleDto } from '../../../../api/trainerSchedule.api';
import { TIME_SLOTS } from '../../../../data/mockTrainerData';

interface CreateEditSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSession?: TrainerScheduleDto | null;
}

const CreateEditSessionModal: React.FC<CreateEditSessionModalProps> = ({
  isOpen,
  onClose,
  editingSession
}) => {
  const { 
    courses, 
    loading, 
    error, 
    fetchCourses, 
    createSession, 
    updateSession,
    clearError 
  } = useTrainerScheduleStore();

  const [formData, setFormData] = useState({
    courseId: '',
    date: '',
    timeStart: '',
    timeEnd: '',
    location: '',
    locationType: 'OFFLINE' as 'ONLINE' | 'OFFLINE',
    meetingLink: '',
    meetingPassword: '',
    maxCapacity: '',
    status: 'SCHEDULED' as 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED',
    notes: '',
    cancellationReason: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Load courses when modal opens
  useEffect(() => {
    if (isOpen && courses.length === 0) {
      fetchCourses();
    }
  }, [isOpen, courses.length, fetchCourses]);

  // Populate form when editing
  useEffect(() => {
    if (editingSession) {
      setFormData({
        courseId: editingSession.courseId.toString(),
        date: editingSession.date,
        timeStart: editingSession.timeStart,
        timeEnd: editingSession.timeEnd,
        location: editingSession.location,
        locationType: editingSession.locationType,
        meetingLink: editingSession.meetingLink || '',
        meetingPassword: '',
        maxCapacity: editingSession.maxCapacity.toString(),
        status: editingSession.status,
        notes: '',
        cancellationReason: ''
      });
    } else {
      // Reset form for create
      setFormData({
        courseId: '',
        date: '',
        timeStart: '',
        timeEnd: '',
        location: '',
        locationType: 'OFFLINE',
        meetingLink: '',
        meetingPassword: '',
        maxCapacity: '30',
        status: 'SCHEDULED',
        notes: '',
        cancellationReason: ''
      });
    }
    setFormErrors({});
    clearError();
  }, [editingSession, clearError]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!editingSession && !formData.courseId) {
      errors.courseId = 'Vui lòng chọn khóa học';
    }
    if (!formData.date) {
      errors.date = 'Vui lòng chọn ngày';
    }
    if (!formData.timeStart) {
      errors.timeStart = 'Vui lòng chọn giờ bắt đầu';
    }
    if (!formData.timeEnd) {
      errors.timeEnd = 'Vui lòng chọn giờ kết thúc';
    }
    if (formData.timeStart && formData.timeEnd && formData.timeStart >= formData.timeEnd) {
      errors.timeEnd = 'Giờ kết thúc phải sau giờ bắt đầu';
    }
    if (!formData.location.trim()) {
      errors.location = 'Vui lòng nhập địa điểm';
    }
    if (!formData.maxCapacity || parseInt(formData.maxCapacity) <= 0) {
      errors.maxCapacity = 'Vui lòng nhập sức chứa hợp lệ';
    }
    if (formData.locationType === 'ONLINE' && !formData.meetingLink.trim()) {
      errors.meetingLink = 'Vui lòng nhập link meeting cho lớp online';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    
    try {
      if (editingSession) {
        // Update session
        const updateRequest: UpdateSessionRequest = {
          date: formData.date,
          timeStart: formData.timeStart,
          timeEnd: formData.timeEnd,
          location: formData.location,
          locationType: formData.locationType,
          meetingLink: formData.meetingLink || undefined,
          meetingPassword: formData.meetingPassword || undefined,
          maxCapacity: parseInt(formData.maxCapacity),
          status: formData.status,
          notes: formData.notes || undefined,
          cancellationReason: formData.cancellationReason || undefined
        };
        
        await updateSession(editingSession.id, updateRequest);
      } else {
        // Create session
        const createRequest: CreateSessionRequest = {
          courseId: parseInt(formData.courseId),
          date: formData.date,
          timeStart: formData.timeStart,
          timeEnd: formData.timeEnd,
          location: formData.location,
          locationType: formData.locationType,
          meetingLink: formData.meetingLink || undefined,
          meetingPassword: formData.meetingPassword || undefined,
          maxCapacity: parseInt(formData.maxCapacity),
          status: formData.status,
          notes: formData.notes || undefined
        };
        
        await createSession(createRequest);
      }
      
      onClose();
    } catch (error) {
      // Error is handled by store
      console.error('Error submitting session:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSlotSelect = (slot: number) => {
    const timeSlot = TIME_SLOTS[slot as keyof typeof TIME_SLOTS];
    if (timeSlot) {
      setFormData(prev => ({
        ...prev,
        timeStart: timeSlot.start,
        timeEnd: timeSlot.end
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {editingSession ? 'Chỉnh sửa phiên học' : 'Tạo phiên học mới'}
            </h2>
            <button 
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
            >
              <span className="text-xl">×</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="text-red-800">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course Selection - Only for create */}
            {!editingSession && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Khóa học *
                </label>
                <select
                  value={formData.courseId}
                  onChange={(e) => handleInputChange('courseId', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formErrors.courseId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Chọn khóa học</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
                {formErrors.courseId && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.courseId}</p>
                )}
              </div>
            )}

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ngày học *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  formErrors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.date && (
                <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>
              )}
            </div>

            {/* Quick Slot Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Chọn nhanh slot
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(TIME_SLOTS).map(([slot, timeSlot]) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => handleSlotSelect(parseInt(slot))}
                    className="px-3 py-2 text-xs border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-300 transition"
                  >
                    Slot {slot}
                    <br />
                    {timeSlot.start}-{timeSlot.end}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Start */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Giờ bắt đầu *
              </label>
              <input
                type="time"
                value={formData.timeStart}
                onChange={(e) => handleInputChange('timeStart', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  formErrors.timeStart ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.timeStart && (
                <p className="text-red-500 text-sm mt-1">{formErrors.timeStart}</p>
              )}
            </div>

            {/* Time End */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Giờ kết thúc *
              </label>
              <input
                type="time"
                value={formData.timeEnd}
                onChange={(e) => handleInputChange('timeEnd', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  formErrors.timeEnd ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.timeEnd && (
                <p className="text-red-500 text-sm mt-1">{formErrors.timeEnd}</p>
              )}
            </div>

            {/* Location Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hình thức *
              </label>
              <select
                value={formData.locationType}
                onChange={(e) => handleInputChange('locationType', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="OFFLINE">Offline (Tại lớp)</option>
                <option value="ONLINE">Online</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {formData.locationType === 'ONLINE' ? 'Tên phòng/lớp' : 'Phòng học'} *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  formErrors.location ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={formData.locationType === 'ONLINE' ? 'Ví dụ: Zoom Room 1' : 'Ví dụ: Phòng 101'}
              />
              {formErrors.location && (
                <p className="text-red-500 text-sm mt-1">{formErrors.location}</p>
              )}
            </div>

            {/* Meeting Link - Only for online */}
            {formData.locationType === 'ONLINE' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Link meeting *
                </label>
                <input
                  type="url"
                  value={formData.meetingLink}
                  onChange={(e) => handleInputChange('meetingLink', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    formErrors.meetingLink ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://zoom.us/j/..."
                />
                {formErrors.meetingLink && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.meetingLink}</p>
                )}
              </div>
            )}

            {/* Meeting Password - Only for online */}
            {formData.locationType === 'ONLINE' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mật khẩu meeting
                </label>
                <input
                  type="text"
                  value={formData.meetingPassword}
                  onChange={(e) => handleInputChange('meetingPassword', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Tùy chọn"
                />
              </div>
            )}

            {/* Max Capacity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sức chứa tối đa *
              </label>
              <input
                type="number"
                value={formData.maxCapacity}
                onChange={(e) => handleInputChange('maxCapacity', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  formErrors.maxCapacity ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="30"
                min="1"
              />
              {formErrors.maxCapacity && (
                <p className="text-red-500 text-sm mt-1">{formErrors.maxCapacity}</p>
              )}
            </div>

            {/* Status - Only for edit */}
            {editingSession && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SCHEDULED">Đã lên lịch</option>
                  <option value="ONGOING">Đang diễn ra</option>
                  <option value="COMPLETED">Đã hoàn thành</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
              </div>
            )}

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ghi chú
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Ghi chú thêm về phiên học..."
              />
            </div>

            {/* Cancellation Reason - Only for edit and cancelled status */}
            {editingSession && formData.status === 'CANCELLED' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lý do hủy
                </label>
                <textarea
                  value={formData.cancellationReason}
                  onChange={(e) => handleInputChange('cancellationReason', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Lý do hủy phiên học..."
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 mt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition font-medium"
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium disabled:opacity-50"
              disabled={submitting || loading}
            >
              {submitting ? 'Đang xử lý...' : (editingSession ? 'Cập nhật' : 'Tạo mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEditSessionModal;