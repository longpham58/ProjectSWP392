import React, { useState } from 'react';
import { mockCourses } from '../../../data/mockCourses';
import { mockCourseModules, Module, Material } from '../../../data/mockTrainerData';

const ViewCourseSection: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState(mockCourses[0]);
  const [modules, setModules] = useState<Module[]>(mockCourseModules);
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState<number | null>(null);
  const [expandedModules, setExpandedModules] = useState<number[]>([1]);

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleAddModule = (newModule: Omit<Module, 'id'>) => {
    const module: Module = {
      ...newModule,
      id: Math.max(...modules.map(m => m.id), 0) + 1,
      materials: []
    };
    setModules([...modules, module]);
    setShowAddModuleModal(false);
    alert('Đã thêm module thành công!');
  };

  const handleDeleteModule = (moduleId: number) => {
    if (confirm('Bạn có chắc muốn xóa module này?')) {
      setModules(modules.filter(m => m.id !== moduleId));
      alert('Đã xóa module thành công!');
    }
  };

  const handleDeleteMaterial = (moduleId: number, materialId: number) => {
    if (confirm('Bạn có chắc muốn xóa tài liệu này?')) {
      setModules(modules.map(m =>
        m.id === moduleId
          ? { ...m, materials: m.materials.filter(mat => mat.id !== materialId) }
          : m
      ));
      alert('Đã xóa tài liệu thành công!');
    }
  };

  const handleAddMaterial = (moduleId: number, file: File) => {
    const newMaterial: Material = {
      id: Date.now(),
      name: file.name,
      type: file.type.includes('pdf') ? 'PDF' : file.type.includes('video') ? 'VIDEO' : 'DOCUMENT',
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      uploadDate: new Date().toLocaleDateString('vi-VN')
    };

    setModules(modules.map(m =>
      m.id === moduleId
        ? { ...m, materials: [...m.materials, newMaterial] }
        : m
    ));
    alert('Đã thêm tài liệu thành công!');
  };

  const trainerCourses = mockCourses.filter(c => c.trainer === 'John Smith');

  return (
    <div className="p-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white text-xl font-bold">
              T
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">View Course</h1>
            </div>
          </div>
          <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium">
            View Course
          </button>
        </div>
      </div>

      {/* Course Selection */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          Khóa học của bạn
        </h2>
        <div className="space-y-3">
          {trainerCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => setSelectedCourse(course)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                selectedCourse.id === course.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{course.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-600">{course.code}</span>
                    <span className="text-sm text-gray-600">{course.duration_hours}h</span>
                  </div>
                </div>
                {selectedCourse.id === course.id && (
                  <span className="text-blue-500 text-xl">✓</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modules Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Module & Nội dung
          </h2>
          <button
            onClick={() => setShowAddModuleModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
          >
            + Thêm Module
          </button>
        </div>

        {/* Modules List */}
        <div className="space-y-4">
          {modules.map((module) => (
            <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Module Header */}
              <div className="bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{module.name}</h3>
                    {module.description && (
                      <p className="text-sm text-gray-700 mt-1">{module.description}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      {module.materials.length} nội dung • Cập nhật: {module.deadline || 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleModule(module.id)}
                      className="p-2 hover:bg-gray-200 rounded transition"
                      title="Toggle favorite"
                    >
                      
                    </button>
                    <button 
                      onClick={() => setShowAddMaterialModal(module.id)}
                      className="p-2 hover:bg-gray-200 rounded transition"
                      title="Add material"
                    >
                      +
                    </button>
                    <button 
                      onClick={() => handleDeleteModule(module.id)}
                      className="p-2 hover:bg-gray-200 rounded transition"
                      title="Delete module"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {/* Module Materials */}
              {expandedModules.includes(module.id) && (
                <div className="p-4 bg-pink-50">
                  {module.materials.length > 0 ? (
                    <div className="space-y-3">
                      {module.materials.map((material) => (
                        <div
                          key={material.id}
                          className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
                              {material.type === 'PDF' && 'PDF'}
                              {material.type === 'VIDEO' && 'VIDEO'}
                              {material.type === 'DOCUMENT' && 'DOC'}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{material.name}</h4>
                              <p className="text-sm text-gray-600">
                                {material.size || 'N/A'} • {material.uploadDate}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => window.open('#', '_blank')}
                              className="p-2 hover:bg-gray-100 rounded transition"
                              title="Download"
                            >
                              Download
                            </button>
                            <button 
                              onClick={() => handleDeleteMaterial(module.id, material.id)}
                              className="p-2 hover:bg-gray-100 rounded transition"
                              title="Delete"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-3">Empty</div>
                      <p>Chưa có nội dung nào</p>
                    </div>
                  )}
                </div>
              )}

              {/* Toggle Button */}
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 transition text-sm font-medium text-gray-700"
              >
                {expandedModules.includes(module.id) ? (
                  <>
                    ▲ Thu gọn
                  </>
                ) : (
                  <>
                    ▼ Xem nội dung
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Materials Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          Tải lên nội dung
        </h2>

        {modules.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <div className="text-6xl text-gray-400 mb-4">Empty</div>
            <p className="text-lg font-medium text-gray-700 mb-2">Chưa có module nào</p>
            <p className="text-sm text-gray-500 mb-4">Vui lòng tạo module trước khi upload tài liệu</p>
            <button
              onClick={() => setShowAddModuleModal(true)}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Tạo Module
            </button>
          </div>
        ) : (
          <>
            {/* Select Module */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Chọn Module để tải tài liệu *
              </label>
              <select
                value={showAddMaterialModal || ''}
                onChange={(e) => {
                  const moduleId = parseInt(e.target.value);
                  if (moduleId) {
                    setShowAddMaterialModal(moduleId);
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn module --</option>
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.name} ({module.materials.length} tài liệu)
                  </option>
                ))}
              </select>
            </div>

            {/* Upload Area */}
            <div className={`border-2 border-dashed rounded-lg p-12 text-center transition ${
              showAddMaterialModal 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400'
            }`}>
              {showAddMaterialModal ? (
                <>
                  <div className="text-6xl text-blue-500 mb-4">Upload</div>
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Tải tài liệu lên {modules.find(m => m.id === showAddMaterialModal)?.name}
                  </p>
                  <input
                    type="file"
                    id="file-upload-module"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && showAddMaterialModal) {
                        handleAddMaterial(showAddMaterialModal, file);
                        setShowAddMaterialModal(null);
                        e.target.value = '';
                      }
                    }}
                  />
                  <label htmlFor="file-upload-module" className="cursor-pointer">
                    <span className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                      Chọn file
                    </span>
                  </label>
                  <button
                    onClick={() => setShowAddMaterialModal(null)}
                    className="ml-3 inline-block px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Hủy
                  </button>
                </>
              ) : (
                <>
                  <div className="text-6xl text-gray-400 mb-4">↑</div>
                  <p className="text-lg font-medium text-gray-700 mb-2">Chọn module ở trên để bắt đầu</p>
                  <p className="text-sm text-gray-500">Tài liệu sẽ được thêm vào module bạn chọn</p>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add Module Modal */}
      {showAddModuleModal && (
        <AddModuleModal 
          onClose={() => setShowAddModuleModal(false)}
          onAdd={handleAddModule}
        />
      )}
    </div>
  );
};

// Add Module Modal
const AddModuleModal: React.FC<{ 
  onClose: () => void;
  onAdd: (module: Omit<Module, 'id'>) => void;
}> = ({ onClose, onAdd }) => {
  const [moduleName, setModuleName] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState(1);
  const [deadline, setDeadline] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!moduleName.trim()) {
      newErrors.moduleName = 'Vui lòng nhập tên module';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Vui lòng nhập mô tả';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onAdd({
        name: moduleName,
        description,
        order,
        deadline: deadline || undefined,
        materials: []
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">+ Thêm Module mới</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tên Module *</label>
            <input
              type="text"
              value={moduleName}
              onChange={(e) => {
                setModuleName(e.target.value);
                setErrors({ ...errors, moduleName: '' });
              }}
              placeholder="Module 1"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.moduleName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.moduleName && (
              <p className="text-red-500 text-sm mt-1">{errors.moduleName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả ngắn gọn *</label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors({ ...errors, description: '' });
              }}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Thứ tự hiển thị</label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
              min="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Deadline (tùy chọn)</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Hủy
          </button>
          <button 
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
          >
            Tạo Module
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewCourseSection;
