import React, { useState } from 'react';
import { quizManagementApi, CreateQuizRequest, QuizQuestionDto } from '../../../../api/quiz-management.api';

interface CreateQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: number;
  moduleId?: number;
  moduleTitle: string;
  onSuccess: () => void;
}

export const CreateQuizModal: React.FC<CreateQuizModalProps> = ({
  isOpen,
  onClose,
  courseId,
  moduleId,
  moduleTitle,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    quizType: 'ASSESSMENT',
    durationMinutes: 60,
    maxAttempts: 3,
    passingScore: 70,
    randomizeQuestions: false,
    showCorrectAnswers: true,
  });
  
  const [questions, setQuestions] = useState<Omit<QuizQuestionDto, 'id'>[]>([
    {
      questionText: '',
      questionType: 'MULTIPLE_CHOICE',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      marks: 1,
      explanation: '',
      displayOrder: 1,
    }
  ]);
  
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string>('');

  const handleQuizDataChange = (field: string, value: any) => {
    setQuizData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    setQuestions(prev => prev.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    ));
  };

  const addQuestion = () => {
    setQuestions(prev => [...prev, {
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
    if (questions.length > 1) {
      setQuestions(prev => prev.filter((_, i) => i !== index)
        .map((q, i) => ({ ...q, displayOrder: i + 1 })));
    }
  };

  const validateStep1 = () => {
    if (!quizData.title.trim()) {
      setError('Vui lòng nhập tên quiz');
      return false;
    }
    if (quizData.durationMinutes < 1) {
      setError('Thời gian làm bài phải lớn hơn 0');
      return false;
    }
    if (quizData.passingScore < 0 || quizData.passingScore > 100) {
      setError('Điểm qua môn phải từ 0-100');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setError(`Câu hỏi ${i + 1}: Vui lòng nhập nội dung câu hỏi`);
        return false;
      }
      if (!q.optionA.trim() || !q.optionB.trim() || !q.optionC.trim() || !q.optionD.trim()) {
        setError(`Câu hỏi ${i + 1}: Vui lòng nhập đầy đủ 4 đáp án`);
        return false;
      }
      if (!['A', 'B', 'C', 'D'].includes(q.correctAnswer)) {
        setError(`Câu hỏi ${i + 1}: Đáp án đúng phải là A, B, C hoặc D`);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setIsCreating(true);
    setError('');

    try {
      const createRequest: CreateQuizRequest = {
        ...quizData,
        courseId,
        moduleId,
        questions,
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
    setQuizData({
      title: '',
      description: '',
      quizType: 'ASSESSMENT',
      durationMinutes: 60,
      maxAttempts: 3,
      passingScore: 70,
      randomizeQuestions: false,
      showCorrectAnswers: true,
    });
    setQuestions([{
      questionText: '',
      questionType: 'MULTIPLE_CHOICE',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      marks: 1,
      explanation: '',
      displayOrder: 1,
    }]);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Tạo Quiz cho Module: {moduleTitle}
          </h2>
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
            <span className="ml-2">Thông tin Quiz</span>
          </div>
          <div className="flex-1 h-px bg-gray-300 mx-4"></div>
          <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="ml-2">Câu hỏi</span>
          </div>
        </div>

        {/* Step 1: Quiz Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Quiz *
                </label>
                <input
                  type="text"
                  value={quizData.title}
                  onChange={(e) => handleQuizDataChange('title', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập tên quiz"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại Quiz
                </label>
                <select
                  value={quizData.quizType}
                  onChange={(e) => handleQuizDataChange('quizType', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ASSESSMENT">Đánh giá</option>
                  <option value="PRACTICE">Luyện tập</option>
                  <option value="FINAL_EXAM">Thi cuối kỳ</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                value={quizData.description}
                onChange={(e) => handleQuizDataChange('description', e.target.value)}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mô tả về quiz này"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thời gian (phút) *
                </label>
                <input
                  type="number"
                  value={quizData.durationMinutes}
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
                  value={quizData.maxAttempts}
                  onChange={(e) => handleQuizDataChange('maxAttempts', parseInt(e.target.value))}
                  min="1"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Điểm qua môn (%) *
                </label>
                <input
                  type="number"
                  value={quizData.passingScore}
                  onChange={(e) => handleQuizDataChange('passingScore', parseInt(e.target.value))}
                  min="0"
                  max="100"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={quizData.randomizeQuestions}
                  onChange={(e) => handleQuizDataChange('randomizeQuestions', e.target.checked)}
                  className="mr-2"
                />
                Trộn thứ tự câu hỏi
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={quizData.showCorrectAnswers}
                  onChange={(e) => handleQuizDataChange('showCorrectAnswers', e.target.checked)}
                  className="mr-2"
                />
                Hiển thị đáp án đúng
              </label>
            </div>
          </div>
        )}

        {/* Step 2: Questions */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Câu hỏi ({questions.length})</h3>
              <button
                onClick={addQuestion}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                + Thêm câu hỏi
              </button>
            </div>

            {questions.map((question, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Câu hỏi {index + 1}</h4>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Xóa
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nội dung câu hỏi *
                    </label>
                    <textarea
                      value={question.questionText}
                      onChange={(e) => handleQuestionChange(index, 'questionText', e.target.value)}
                      rows={2}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập nội dung câu hỏi"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Đáp án A *
                      </label>
                      <input
                        type="text"
                        value={question.optionA}
                        onChange={(e) => handleQuestionChange(index, 'optionA', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Đáp án A"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Đáp án B *
                      </label>
                      <input
                        type="text"
                        value={question.optionB}
                        onChange={(e) => handleQuestionChange(index, 'optionB', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Đáp án B"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Đáp án C *
                      </label>
                      <input
                        type="text"
                        value={question.optionC}
                        onChange={(e) => handleQuestionChange(index, 'optionC', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Đáp án C"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Đáp án D *
                      </label>
                      <input
                        type="text"
                        value={question.optionD}
                        onChange={(e) => handleQuestionChange(index, 'optionD', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Đáp án D"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Đáp án đúng *
                      </label>
                      <select
                        value={question.correctAnswer}
                        onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Điểm số
                      </label>
                      <input
                        type="number"
                        value={question.marks}
                        onChange={(e) => handleQuestionChange(index, 'marks', parseInt(e.target.value))}
                        min="1"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giải thích (tùy chọn)
                    </label>
                    <textarea
                      value={question.explanation}
                      onChange={(e) => handleQuestionChange(index, 'explanation', e.target.value)}
                      rows={2}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Giải thích đáp án đúng"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mt-4">
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
              disabled={isCreating}
            >
              Hủy
            </button>
            
            {currentStep === 1 ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Tiếp theo →
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