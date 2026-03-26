import React, { useState } from 'react';
import { quizImportApi } from '../../../../api/quiz-import.api';
import { quizManagementApi, CreateQuizRequest, QuizQuestionDto } from '../../../../api/quiz-management.api';

interface ImportQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: number;
  moduleId?: number;
  onSuccess: () => void;
}

interface ParsedQuizData {
  title: string;
  description: string;
  durationMinutes: number;
  passingScore: number;
  quizType: string;
  maxAttempts: number;
  randomizeQuestions: boolean;
  showCorrectAnswers: boolean;
  questions: Omit<QuizQuestionDto, 'id'>[];
}

export const ImportQuizModal: React.FC<ImportQuizModalProps> = ({
  isOpen,
  onClose,
  courseId,
  moduleId,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedQuizData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string>('');

  // Editable quiz data for step 2
  const [editableQuizData, setEditableQuizData] = useState({
    title: '',
    description: '',
    quizType: 'ASSESSMENT',
    durationMinutes: 60,
    maxAttempts: 3,
    passingScore: 70,
    randomizeQuestions: false,
    showCorrectAnswers: true,
  });

  const [editableQuestions, setEditableQuestions] = useState<Omit<QuizQuestionDto, 'id'>[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        setError('Chỉ chấp nhận file Excel (.xlsx, .xls)');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await quizImportApi.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'quiz_template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading template:', error);
      setError('Không thể tải template');
    }
  };

  const parseExcelFile = async () => {
    if (!file) {
      setError('Vui lòng chọn file Excel');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const data = await quizImportApi.parseExcel(file);

      setParsedData(data as any);
      setEditableQuizData({
        title: data.title || '',
        description: data.description || '',
        quizType: data.quizType || 'ASSESSMENT',
        durationMinutes: data.durationMinutes || 60,
        maxAttempts: data.maxAttempts || 3,
        passingScore: data.passingScore || 70,
        randomizeQuestions: data.randomizeQuestions || false,
        showCorrectAnswers: data.showCorrectAnswers !== false,
      });
      setEditableQuestions(data.questions || []);

      setCurrentStep(2);
    } catch (error: any) {
      console.error('Error parsing Excel:', error);
      const serverMsg = error?.response?.data?.message;
      setError(serverMsg
        ? `Lỗi: ${serverMsg}`
        : 'Có lỗi xảy ra khi đọc file Excel. Vui lòng kiểm tra định dạng file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleQuizDataChange = (field: string, value: any) => {
    setEditableQuizData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    setEditableQuestions(prev => prev.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    ));
  };

  const addQuestion = () => {
    setEditableQuestions(prev => [...prev, {
      questionText: '',
      questionType: 'MULTIPLE_CHOICE',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      marks: 1,
      explanation: '',
      displayOrder: prev.length + 1,
    }]);
  };

  const removeQuestion = (index: number) => {
    if (editableQuestions.length > 1) {
      setEditableQuestions(prev => prev.filter((_, i) => i !== index)
        .map((q, i) => ({ ...q, displayOrder: i + 1 })));
    }
  };

  const validateStep2 = () => {
    if (!editableQuizData.title.trim()) {
      setError('Vui lòng nhập tên quiz');
      return false;
    }
    
    for (let i = 0; i < editableQuestions.length; i++) {
      const q = editableQuestions[i];
      if (!q.questionText.trim()) {
        setError(`Câu hỏi ${i + 1}: Vui lòng nhập nội dung câu hỏi`);
        return false;
      }
      if (!q.optionA.trim() || !q.optionB.trim() || !q.optionC.trim() || !q.optionD.trim()) {
        setError(`Câu hỏi ${i + 1}: Vui lòng nhập đầy đủ 4 đáp án`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setIsCreating(true);
    setError('');

    try {
      const createRequest: CreateQuizRequest = {
        ...editableQuizData,
        courseId,
        moduleId,
        questions: editableQuestions,
      };

      await quizManagementApi.createQuiz(createRequest);
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Error creating quiz:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tạo quiz');
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFile(null);
    setParsedData(null);
    setEditableQuizData({
      title: '',
      description: '',
      quizType: 'ASSESSMENT',
      durationMinutes: 60,
      maxAttempts: 3,
      passingScore: 70,
      randomizeQuestions: false,
      showCorrectAnswers: true,
    });
    setEditableQuestions([]);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleBack = () => {
    setCurrentStep(1);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Import Quiz từ Excel</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center mb-6">
          <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="ml-2">Upload File</span>
          </div>
          <div className="flex-1 h-px bg-gray-300 mx-4"></div>
          <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="ml-2">Xem trước & Chỉnh sửa</span>
          </div>
        </div>

        {/* Step 1: Upload File */}
        {currentStep === 1 && (
          <div className="space-y-4">
            {/* Download Template Button */}
            <div className="text-center">
              <button
                onClick={handleDownloadTemplate}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
              >
                Tải Template Excel
              </button>
              <p className="text-xs text-gray-500 mt-1">
                Tải template để xem định dạng file Excel cần thiết
              </p>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn file Excel
              </label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {file && (
                <p className="text-sm text-green-600 mt-1">
                  &#10003; Đã chọn: {file.name}
                </p>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm">
              <h4 className="font-medium text-blue-800 mb-2">Hướng dẫn:</h4>
              <ul className="text-blue-700 space-y-1 text-xs">
                <li>1. Tải template Excel bằng nút bên trên</li>
                <li>2. Điền thông tin quiz và câu hỏi vào template</li>
                <li>3. Upload file và xem trước trước khi tạo quiz</li>
                <li>4. Đáp án đúng nhập dạng A, B, C, hoặc D</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 2: Preview & Edit */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Quiz Information */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Thông tin Quiz</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên Quiz *
                  </label>
                  <input
                    type="text"
                    value={editableQuizData.title}
                    onChange={(e) => handleQuizDataChange('title', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại Quiz
                  </label>
                  <select
                    value={editableQuizData.quizType}
                    onChange={(e) => handleQuizDataChange('quizType', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ASSESSMENT">Đánh giá</option>
                    <option value="PRACTICE">Luyện tập</option>
                    <option value="FINAL_EXAM">Thi cuối kỳ</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={editableQuizData.description}
                  onChange={(e) => handleQuizDataChange('description', e.target.value)}
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thời gian (phút)
                  </label>
                  <input
                    type="number"
                    value={editableQuizData.durationMinutes}
                    onChange={(e) => handleQuizDataChange('durationMinutes', parseInt(e.target.value))}
                    min="1"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số lần làm tối đa
                  </label>
                  <input
                    type="number"
                    value={editableQuizData.maxAttempts}
                    onChange={(e) => handleQuizDataChange('maxAttempts', parseInt(e.target.value))}
                    min="1"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Điểm qua môn (%)
                  </label>
                  <input
                    type="number"
                    value={editableQuizData.passingScore}
                    onChange={(e) => handleQuizDataChange('passingScore', parseInt(e.target.value))}
                    min="0"
                    max="100"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Câu hỏi ({editableQuestions.length})</h3>
                <button
                  onClick={addQuestion}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition text-sm"
                >
                  + Thêm câu hỏi
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {editableQuestions.map((question, index) => (
                  <div key={index} className="border border-gray-100 rounded p-3">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-sm">Câu hỏi {index + 1}</h4>
                      {editableQuestions.length > 1 && (
                        <button
                          onClick={() => removeQuestion(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Xóa
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <textarea
                        value={question.questionText}
                        onChange={(e) => handleQuestionChange(index, 'questionText', e.target.value)}
                        rows={2}
                        className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nội dung câu hỏi"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={question.optionA}
                          onChange={(e) => handleQuestionChange(index, 'optionA', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Đáp án A"
                        />
                        <input
                          type="text"
                          value={question.optionB}
                          onChange={(e) => handleQuestionChange(index, 'optionB', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Đáp án B"
                        />
                        <input
                          type="text"
                          value={question.optionC}
                          onChange={(e) => handleQuestionChange(index, 'optionC', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Đáp án C"
                        />
                        <input
                          type="text"
                          value={question.optionD}
                          onChange={(e) => handleQuestionChange(index, 'optionD', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Đáp án D"
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-gray-700">Đáp án đúng:</label>
                          <select
                            value={question.correctAnswer}
                            onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                            className="p-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-gray-700">Điểm:</label>
                          <input
                            type="number"
                            value={question.marks}
                            onChange={(e) => handleQuestionChange(index, 'marks', parseInt(e.target.value))}
                            min="1"
                            className="w-16 p-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-6">
          <div>
            {currentStep === 2 && (
              <button
                onClick={handleBack}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                ← Quay lại
              </button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              disabled={isUploading || isCreating}
            >
              Hủy
            </button>
            
            {currentStep === 1 ? (
              <button
                onClick={parseExcelFile}
                disabled={!file || isUploading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Đang đọc file...' : 'Tiếp theo →'}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isCreating}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Đang tạo...' : 'Tạo Quiz'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};