import React, { useState } from 'react';
import { trainerCourseApi } from '../../../../api/trainerCourse.api';

interface CreateTrialCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleId: number;
  moduleTitle: string;
  onSuccess: () => void;
}

export const CreateTrialCourseModal: React.FC<CreateTrialCourseModalProps> = ({
  isOpen,
  onClose,
  moduleId,
  moduleTitle,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: `Khóa học thử - ${moduleTitle}`,
    description: `Khóa học thử nghiệm cho module ${moduleTitle}`,
    duration: 2, // hours
    maxStudents: 10,
    objectives: 'Giúp học viên làm quen với nội dung module',
    prerequisites: 'Không yêu cầu kiến thức trước',
  });
  
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');

    try {
      // Create trial course data
      const courseData = {
        code: `TRIAL-${moduleId}-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        objectives: formData.objectives,
        prerequisites: formData.prerequisites,
        durationHours: formData.duration,
        category: 'Trial',
        level: 'BEGINNER',
        status: 'DRAFT',
        passingScore: 60,
        maxAttempts: 3,
        // Link to module
        moduleId: moduleId,
        // Trial course specific settings
        isTrial: true,
        maxStudents: formData.maxStudents,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      };

      // Note: You'll need to implement this API endpoint
      // await trainerCourseApi.createTrialCourse(courseData);
      
      // For now, simulate success
      console.log('Creating trial course:', courseData);
      
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Error creating trial course:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tạo khóa học thử');
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: `Khóa học thử - ${moduleTitle}`,
      description: `Khóa học thử nghiệm cho module ${moduleTitle}`,
      duration: 2,
      maxStudents: 10,
      objectives: 'Giúp học viên làm quen với nội dung module',
      prerequisites: 'Không yêu cầu kiến thức trước',
    });
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Tạo Khóa Học Thử</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Course Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên khóa học *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Duration and Max Students */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời lượng (giờ) *
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                min="1"
                max="8"
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số học viên tối đa *
              </label>
              <input
                type="number"
                name="maxStudents"
                value={formData.maxStudents}
                onChange={handleInputChange}
                min="5"
                max="50"
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Objectives */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mục tiêu khóa học
            </label>
            <textarea
              name="objectives"
              value={formData.objectives}
              onChange={handleInputChange}
              rows={2}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Prerequisites */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yêu cầu trước khi học
            </label>
            <textarea
              name="prerequisites"
              value={formData.prerequisites}
              onChange={handleInputChange}
              rows={2}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm">
            <h4 className="font-medium text-blue-800 mb-2">Lưu ý:</h4>
            <ul className="text-blue-700 space-y-1 text-xs">
              <li>• Khóa học thử sẽ có thời hạn 7 ngày</li>
              <li>• Trạng thái ban đầu là DRAFT, bạn có thể chỉnh sửa sau</li>
              <li>• Khóa học sẽ được liên kết với module "{moduleTitle}"</li>
              <li>• Điểm qua môn mặc định là 60%</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              disabled={isCreating}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Đang tạo...' : 'Tạo Khóa Học Thử'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};