import React, { useState, useEffect, useRef } from 'react';
import {
  CourseDto, ModuleDto, MaterialDto,
  getTrainerCourses, getCourseModules,
  createModule, deleteModule, deleteMaterial, uploadMaterial
} from '../../../api/trainerCourse.api';
import { ImportQuizModal } from './modals/ImportQuizModal';
import { CreateQuizModal } from './modals/CreateQuizModal';
import { QuizListModal } from './modals/QuizListModal';
import { CourseQuizListModal } from './modals/CourseQuizListModal';

const ViewCourseSection: React.FC = () => {
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseDto | null>(null);
  const [modules, setModules] = useState<ModuleDto[]>([]);
  const [expandedModules, setExpandedModules] = useState<number[]>([]);
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [showImportQuizModal, setShowImportQuizModal] = useState(false);
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);
  const [showQuizListModal, setShowQuizListModal] = useState(false);
  const [showCourseQuizListModal, setShowCourseQuizListModal] = useState(false);
  const [selectedModuleForActions, setSelectedModuleForActions] = useState<ModuleDto | null>(null);
  const [uploadingModuleId, setUploadingModuleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [modulesLoading, setModulesLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getTrainerCourses()
      .then(data => {
        setCourses(data);
        if (data.length > 0) setSelectedCourse(data[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    setModulesLoading(true);
    getCourseModules(selectedCourse.id)
      .then(data => {
        setModules(data);
        setExpandedModules(data.length > 0 ? [data[0].id] : []);
      })
      .finally(() => setModulesLoading(false));
  }, [selectedCourse]);

  const toggleModule = (id: number) =>
    setExpandedModules(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleAddModule = async (title: string, description: string, displayOrder: number) => {
    if (!selectedCourse) return;
    const mod = await createModule(selectedCourse.id, title, description, displayOrder);
    setModules(prev => [...prev, mod]);
    setShowAddModuleModal(false);
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!confirm('Bạn có chắc muốn xóa module này?')) return;
    await deleteModule(moduleId);
    setModules(prev => prev.filter(m => m.id !== moduleId));
  };

  const handleDeleteMaterial = async (moduleId: number, materialId: number) => {
    if (!confirm('Bạn có chắc muốn xóa tài liệu này?')) return;
    await deleteMaterial(materialId);
    setModules(prev => prev.map(m =>
      m.id === moduleId ? { ...m, materials: m.materials.filter(mat => mat.id !== materialId) } : m
    ));
  };

  const handleUpload = async (moduleId: number, file: File) => {
    setUploadingModuleId(moduleId);
    try {
      const material = await uploadMaterial(moduleId, file);
      setModules(prev => prev.map(m =>
        m.id === moduleId ? { ...m, materials: [...m.materials, material] } : m
      ));
    } finally {
      setUploadingModuleId(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải...</div>;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Xem khóa học</h1>
        <p className="text-gray-500 mt-1">Quản lý khóa học và tài liệu học tập</p>
      </div>

      {/* Course Selection */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Khóa học của bạn</h2>
        {courses.length === 0 ? (
          <p className="text-gray-500">Bạn chưa được phân công khóa học nào.</p>
        ) : (
          <div className="space-y-3">
            {courses.map(course => (
              <div
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                  selectedCourse?.id === course.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{course.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-gray-600">{course.code}</span>
                      {course.durationHours && (
                        <span className="text-sm text-gray-600">{course.durationHours}h</span>
                      )}
                      {course.status && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                          {course.status}
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedCourse?.id === course.id && (
                    <span className="text-blue-500 text-xl">&#10003;</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modules Section */}
      {selectedCourse && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Module & Nội dung</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCourseQuizListModal(true)}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition text-sm font-medium"
              >
                📋 Xem tất cả Quiz
              </button>
              <button
                onClick={() => setShowAddModuleModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
              >
                + Thêm Module
              </button>
            </div>
          </div>

          {modulesLoading ? (
            <div className="text-center py-8 text-gray-500">Đang tải module...</div>
          ) : modules.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">Chưa có module nào</p>
              <button
                onClick={() => setShowAddModuleModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
              >
                Tạo Module đầu tiên
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map(module => (
                <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Module Header */}
                  <div className="bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{module.title}</h3>
                        {module.description && (
                          <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">{module.materials.length} tài liệu</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Import Quiz button */}
                        <button
                          onClick={() => {
                            setSelectedModuleForActions(module);
                            setShowImportQuizModal(true);
                          }}
                          className="px-3 py-1.5 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition"
                          title="Import câu hỏi từ Excel"
                        >
                          Import Quiz
                        </button>
                        
                        {/* Create Quiz Manually button */}
                        <button
                          onClick={() => {
                            setSelectedModuleForActions(module);
                            setShowCreateQuizModal(true);
                          }}
                          className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition"
                          title="Tạo quiz thủ công"
                        >
                          Tạo Quiz
                        </button>
                        
                        {/* View Quiz button */}
                        <button
                          onClick={() => {
                            setSelectedModuleForActions(module);
                            setShowQuizListModal(true);
                          }}
                          className="px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition"
                          title="Xem danh sách quiz"
                        >
                          Xem Quiz
                        </button>
                        
                        {/* Upload button */}
                        <label
                          className="px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition cursor-pointer"
                          title="Tải tài liệu lên"
                        >
                          {uploadingModuleId === module.id ? 'Đang tải...' : '↑ Upload'}
                          <input
                            type="file"
                            className="hidden"
                            disabled={uploadingModuleId !== null}
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleUpload(module.id, file);
                                e.target.value = '';
                              }
                            }}
                          />
                        </label>
                        <button
                          onClick={() => toggleModule(module.id)}
                          className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition"
                        >
                          {expandedModules.includes(module.id) ? '▲' : '▼'}
                        </button>
                        <button
                          onClick={() => handleDeleteModule(module.id)}
                          className="px-3 py-1.5 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200 transition"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Materials List */}
                  {expandedModules.includes(module.id) && (
                    <div className="p-4 bg-blue-50">
                      {module.materials.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">Chưa có tài liệu nào</p>
                      ) : (
                        <div className="space-y-2">
                          {module.materials.map(mat => (
                            <div key={mat.id} className="bg-white rounded-lg p-3 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center text-xs font-bold text-blue-700">
                                  {mat.type}
                                </span>
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">{mat.title}</p>
                                  <p className="text-xs text-gray-500">
                                    {mat.fileSize ? `${(mat.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
                                    {mat.createdAt ? ` • ${new Date(mat.createdAt).toLocaleDateString('vi-VN')}` : ''}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {mat.fileUrl && (
                                  <a
                                    href={`${(import.meta as any).env.VITE_API_URL.replace('/api', '')}${mat.fileUrl}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition"
                                  >
                                    Tải xuống
                                  </a>
                                )}
                                <button
                                  onClick={() => handleDeleteMaterial(module.id, mat.id)}
                                  className="px-3 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200 transition"
                                >
                                  Xóa
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Module Modal */}
      {showAddModuleModal && (
        <AddModuleModal
          moduleCount={modules.length}
          onClose={() => setShowAddModuleModal(false)}
          onAdd={handleAddModule}
        />
      )}

      {/* Import Quiz Modal */}
      {showImportQuizModal && selectedModuleForActions && selectedCourse && (
        <ImportQuizModal
          isOpen={showImportQuizModal}
          onClose={() => {
            setShowImportQuizModal(false);
            setSelectedModuleForActions(null);
          }}
          courseId={selectedCourse.id}
          moduleId={selectedModuleForActions.id}
          onSuccess={() => {
            console.log('Quiz imported successfully');
          }}
        />
      )}

      {/* Create Quiz Modal */}
      {showCreateQuizModal && selectedModuleForActions && selectedCourse && (
        <CreateQuizModal
          isOpen={showCreateQuizModal}
          onClose={() => {
            setShowCreateQuizModal(false);
            setSelectedModuleForActions(null);
          }}
          courseId={selectedCourse.id}
          moduleId={selectedModuleForActions.id}
          moduleTitle={selectedModuleForActions.title}
          onSuccess={() => {
            console.log('Quiz created successfully');
          }}
        />
      )}

      {/* Quiz List Modal (by module) */}
      {showQuizListModal && selectedModuleForActions && (
        <QuizListModal
          isOpen={showQuizListModal}
          onClose={() => {
            setShowQuizListModal(false);
            setSelectedModuleForActions(null);
          }}
          moduleId={selectedModuleForActions.id}
          moduleTitle={selectedModuleForActions.title}
        />
      )}

      {/* Course Quiz List Modal (all quizzes for course) */}
      {showCourseQuizListModal && selectedCourse && (
        <CourseQuizListModal
          isOpen={showCourseQuizListModal}
          onClose={() => setShowCourseQuizListModal(false)}
          courseId={selectedCourse.id}
          courseName={selectedCourse.name}
        />
      )}
    </div>
  );
};

const AddModuleModal: React.FC<{
  moduleCount: number;
  onClose: () => void;
  onAdd: (title: string, description: string, displayOrder: number) => Promise<void>;
}> = ({ moduleCount, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState(moduleCount + 1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Vui lòng nhập tên module';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await onAdd(title, description, displayOrder);
    } finally {
      setSaving(false);
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
              value={title}
              onChange={e => { setTitle(e.target.value); setErrors({}); }}
              placeholder="Nhập tên module"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Thứ tự hiển thị</label>
            <input
              type="number"
              value={displayOrder}
              onChange={e => setDisplayOrder(parseInt(e.target.value) || 1)}
              min="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium">
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium disabled:opacity-50"
          >
            {saving ? 'Đang tạo...' : 'Tạo Module'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewCourseSection;
