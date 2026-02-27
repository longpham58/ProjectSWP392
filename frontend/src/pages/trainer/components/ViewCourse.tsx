import { useState } from 'react';
import { mockModules, mockCoursesList, Module, Quiz, QuizQuestion } from '../../../mocks/mockTrainerData';

export default function ViewCourse() {
  const [selectedCourse, setSelectedCourse] = useState(mockCoursesList[0]?.code || '');
  const [modules, setModules] = useState<Module[]>(mockModules);
  const [showAddModule, setShowAddModule] = useState(false);
  const [showUploadMaterial, setShowUploadMaterial] = useState<string | null>(null);
  const [showEditModule, setShowEditModule] = useState<Module | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Quiz states
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [quizType, setQuizType] = useState<'module' | 'final'>('module');
  const [selectedModuleForQuiz, setSelectedModuleForQuiz] = useState<string | null>(null);
  const [showQuizDetail, setShowQuizDetail] = useState<Quiz | null>(null);
  const [finalQuiz, setFinalQuiz] = useState<Quiz | null>(null);
  
  // Quiz form states
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [quizDuration, setQuizDuration] = useState(30);
  const [quizPassingScore, setQuizPassingScore] = useState(70);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  
  // Question form states
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<'multiple-choice' | 'true-false' | 'essay'>('multiple-choice');
  const [questionOptions, setQuestionOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);
  const [questionPoints, setQuestionPoints] = useState(10);

  // Form states
  const [moduleName, setModuleName] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');
  const [materialName, setMaterialName] = useState('');
  const [materialDescription, setMaterialDescription] = useState('');

  const handleAddModule = () => {
    if (!moduleName.trim()) {
      alert('Vui lòng nhập tên module');
      return;
    }

    const newModule: Module = {
      id: Date.now().toString(),
      name: moduleName,
      description: moduleDescription,
      files: []
    };

    setModules([...modules, newModule]);
    setModuleName('');
    setModuleDescription('');
    setShowAddModule(false);
    
    showSuccessMessage('Thêm module thành công!');
  };

  const handleEditModule = () => {
    if (!showEditModule || !moduleName.trim()) return;

    setModules(modules.map(m => 
      m.id === showEditModule.id 
        ? { ...m, name: moduleName, description: moduleDescription }
        : m
    ));

    setShowEditModule(null);
    setModuleName('');
    setModuleDescription('');
    
    showSuccessMessage('Cập nhật module thành công!');
  };

  const handleDeleteModule = (moduleId: string) => {
    if (confirm('Bạn có chắc muốn xóa module này?')) {
      setModules(modules.filter(m => m.id !== moduleId));
      showSuccessMessage('Xóa module thành công!');
    }
  };

  const handleUploadMaterial = () => {
    if (!showUploadMaterial || !materialName.trim()) {
      alert('Vui lòng nhập tên tài liệu');
      return;
    }

    const newFile = {
      name: materialName,
      size: '2.5 MB',
      type: 'pdf'
    };

    setModules(modules.map(m => 
      m.id === showUploadMaterial 
        ? { ...m, files: [...m.files, newFile] }
        : m
    ));

    setMaterialName('');
    setMaterialDescription('');
    setShowUploadMaterial(null);
    
    showSuccessMessage('Tải lên tài liệu thành công!');
  };

  const handleDeleteFile = (moduleId: string, fileName: string) => {
    if (confirm('Bạn có chắc muốn xóa tài liệu này?')) {
      setModules(modules.map(m => 
        m.id === moduleId 
          ? { ...m, files: m.files.filter(f => f.name !== fileName) }
          : m
      ));
      showSuccessMessage('Xóa tài liệu thành công!');
    }
  };

  const openEditModule = (module: Module) => {
    setShowEditModule(module);
    setModuleName(module.name);
    setModuleDescription(module.description || '');
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Quiz functions
  const handleCreateQuiz = (type: 'module' | 'final', moduleId?: string) => {
    setQuizType(type);
    setSelectedModuleForQuiz(moduleId || null);
    setQuestions([]);
    setQuizTitle('');
    setQuizDescription('');
    setQuizDuration(30);
    setQuizPassingScore(70);
    setShowCreateQuiz(true);
  };

  const handleAddQuestion = () => {
    if (!questionText.trim()) {
      alert('Vui lòng nhập câu hỏi');
      return;
    }

    if (questionType === 'multiple-choice' && questionOptions.some(opt => !opt.trim())) {
      alert('Vui lòng điền đầy đủ các đáp án');
      return;
    }

    const newQuestion: QuizQuestion = {
      id: Date.now().toString(),
      question: questionText,
      type: questionType,
      options: questionType !== 'essay' ? questionOptions.filter(opt => opt.trim()) : undefined,
      correctAnswer: questionType !== 'essay' ? correctAnswer : undefined,
      points: questionPoints
    };

    setQuestions([...questions, newQuestion]);
    
    // Reset form
    setQuestionText('');
    setQuestionOptions(['', '', '', '']);
    setCorrectAnswer(0);
    setQuestionPoints(10);
    setShowAddQuestion(false);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const handleSaveQuiz = () => {
    if (!quizTitle.trim()) {
      alert('Vui lòng nhập tiêu đề quiz');
      return;
    }

    if (questions.length === 0) {
      alert('Vui lòng thêm ít nhất 1 câu hỏi');
      return;
    }

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    const newQuiz: Quiz = {
      id: Date.now().toString(),
      title: quizTitle,
      description: quizDescription,
      type: quizType,
      moduleId: selectedModuleForQuiz || undefined,
      duration: quizDuration,
      passingScore: quizPassingScore,
      questions: questions,
      totalPoints: totalPoints,
      createdAt: new Date().toISOString()
    };

    if (quizType === 'module' && selectedModuleForQuiz) {
      // Add quiz to module
      setModules(modules.map(m => 
        m.id === selectedModuleForQuiz 
          ? { ...m, quiz: newQuiz }
          : m
      ));
      showSuccessMessage('Tạo quiz cho module thành công!');
    } else {
      // Set as final quiz
      setFinalQuiz(newQuiz);
      showSuccessMessage('Tạo final quiz thành công!');
    }

    setShowCreateQuiz(false);
  };

  const handleDeleteQuiz = (moduleId?: string) => {
    if (confirm('Bạn có chắc muốn xóa quiz này?')) {
      if (moduleId) {
        setModules(modules.map(m => 
          m.id === moduleId 
            ? { ...m, quiz: undefined }
            : m
        ));
      } else {
        setFinalQuiz(null);
      }
      showSuccessMessage('Xóa quiz thành công!');
    }
  };

  return (
    <div className="view-course-container">
      <div className="section-header">
        <h2>📚 Quản lý khóa học</h2>
      </div>

      {showSuccess && (
        <div className="success-message">
          <span className="success-icon">✅</span>
          <span>{successMessage}</span>
        </div>
      )}

      <div className="course-selector">
        {mockCoursesList.map((course) => (
          <button
            key={course.code}
            className={`course-btn ${selectedCourse === course.code ? 'active' : ''}`}
            onClick={() => setSelectedCourse(course.code)}
          >
            <span className="course-icon">📘</span>
            <div className="course-info">
              <div className="course-name">{course.name}</div>
              <div className="course-meta">Mã: {course.code} • 👥 {course.students}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="modules-section">
        <div className="section-title">
          <h3>📋 Module và nội dung</h3>
          <button className="btn-primary" onClick={() => setShowAddModule(true)}>
            + Thêm Module
          </button>
        </div>

        {modules.map((module) => (
          <div key={module.id} className="module-card">
            <div className="module-header">
              <h4>{module.name}</h4>
              <div className="module-actions">
                <button className="icon-btn" onClick={() => openEditModule(module)}>✏️</button>
                <button className="icon-btn" onClick={() => handleDeleteModule(module.id)}>🗑️</button>
              </div>
            </div>

            {module.description && (
              <p className="module-description">{module.description}</p>
            )}

            {/* Quiz Section */}
            {module.quiz ? (
              <div className="module-quiz">
                <div className="quiz-header">
                  <span className="quiz-icon">📝</span>
                  <div className="quiz-info">
                    <h5>{module.quiz.title}</h5>
                    <span className="quiz-meta">
                      {module.quiz.questions.length} câu hỏi • {module.quiz.duration} phút • 
                      Điểm đạt: {module.quiz.passingScore}%
                    </span>
                  </div>
                </div>
                <div className="quiz-actions">
                  <button 
                    className="btn-secondary small"
                    onClick={() => setShowQuizDetail(module.quiz!)}
                  >
                    Xem chi tiết
                  </button>
                  <button 
                    className="btn-secondary small delete"
                    onClick={() => handleDeleteQuiz(module.id)}
                  >
                    Xóa quiz
                  </button>
                </div>
              </div>
            ) : (
              <button 
                className="btn-create-quiz"
                onClick={() => handleCreateQuiz('module', module.id)}
              >
                📝 Tạo quiz cho module này
              </button>
            )}

            {module.files.length > 0 ? (
              <div className="module-files">
                {module.files.map((file, idx) => (
                  <div key={idx} className="file-item">
                    <span>📄 {file.name}</span>
                    <span className="file-size">{file.size}</span>
                    <div className="file-actions">
                      <button className="icon-btn">👁️</button>
                      <button 
                        className="icon-btn"
                        onClick={() => handleDeleteFile(module.id, file.name)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <button
              className="btn-upload"
              onClick={() => setShowUploadMaterial(module.id)}
            >
              📤 Tải lên tài liệu
            </button>
          </div>
        ))}
      </div>

      {/* Final Quiz Section */}
      <div className="final-quiz-section">
        <div className="section-title">
          <h3>🎯 Bài kiểm tra cuối khóa (Final Quiz)</h3>
          {!finalQuiz && (
            <button 
              className="btn-primary"
              onClick={() => handleCreateQuiz('final')}
            >
              + Tạo Final Quiz
            </button>
          )}
        </div>

        {finalQuiz ? (
          <div className="final-quiz-card">
            <div className="quiz-header">
              <span className="quiz-icon large">🎯</span>
              <div className="quiz-info">
                <h4>{finalQuiz.title}</h4>
                <p>{finalQuiz.description}</p>
                <span className="quiz-meta">
                  {finalQuiz.questions.length} câu hỏi • {finalQuiz.duration} phút • 
                  Tổng điểm: {finalQuiz.totalPoints} • Điểm đạt: {finalQuiz.passingScore}%
                </span>
              </div>
            </div>
            <div className="quiz-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowQuizDetail(finalQuiz)}
              >
                Xem chi tiết
              </button>
              <button 
                className="btn-secondary"
                onClick={() => handleCreateQuiz('final')}
              >
                Chỉnh sửa
              </button>
              <button 
                className="btn-secondary delete"
                onClick={() => handleDeleteQuiz()}
              >
                Xóa
              </button>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h3>Chưa có bài kiểm tra cuối khóa</h3>
            <p>Tạo bài kiểm tra cuối khóa để đánh giá tổng thể kiến thức học viên</p>
          </div>
        )}
      </div>

      <div className="materials-section">
        <div className="section-title">
          <h3>📎 Tài liệu nội dung</h3>
          <button className="btn-primary">+ Thêm tài liệu</button>
        </div>
        <div className="upload-area">
          <p>Kéo thả file tại đây hoặc click để chọn</p>
        </div>
      </div>

      {showAddModule && (
        <div className="modal-overlay" onClick={() => setShowAddModule(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowAddModule(false)}>✕</button>
            <h3>➕ Thêm Module mới</h3>
            <div className="form-group">
              <label>Tên Module *</label>
              <input 
                type="text" 
                placeholder="Module 1: Giới thiệu" 
                className="input-field"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                placeholder="Mô tả ngắn về module"
                className="textarea-field"
                rows={3}
                value={moduleDescription}
                onChange={(e) => setModuleDescription(e.target.value)}
              ></textarea>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowAddModule(false)}>
                Hủy
              </button>
              <button className="btn-primary" onClick={handleAddModule}>Thêm</button>
            </div>
          </div>
        </div>
      )}

      {showEditModule && (
        <div className="modal-overlay" onClick={() => setShowEditModule(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowEditModule(null)}>✕</button>
            <h3>✏️ Chỉnh sửa Module</h3>
            <div className="form-group">
              <label>Tên Module *</label>
              <input 
                type="text" 
                className="input-field"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                className="textarea-field"
                rows={3}
                value={moduleDescription}
                onChange={(e) => setModuleDescription(e.target.value)}
              ></textarea>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowEditModule(null)}>
                Hủy
              </button>
              <button className="btn-primary" onClick={handleEditModule}>Lưu</button>
            </div>
          </div>
        </div>
      )}

      {showUploadMaterial && (
        <div className="modal-overlay" onClick={() => setShowUploadMaterial(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowUploadMaterial(null)}>✕</button>
            <h3>📤 Tải lên tài liệu</h3>
            <div className="form-group">
              <label>Tên tài liệu *</label>
              <input 
                type="text" 
                placeholder="Bài giảng 1.pdf" 
                className="input-field"
                value={materialName}
                onChange={(e) => setMaterialName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Mô tả</label>
              <textarea 
                placeholder="Mô tả về tài liệu" 
                className="textarea-field" 
                rows={3}
                value={materialDescription}
                onChange={(e) => setMaterialDescription(e.target.value)}
              ></textarea>
            </div>
            <div className="form-group">
              <label>Chọn file</label>
              <input type="file" className="file-input" />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowUploadMaterial(null)}>
                Hủy
              </button>
              <button className="btn-primary" onClick={handleUploadMaterial}>Tải lên</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Quiz Modal */}
      {showCreateQuiz && (
        <div className="modal-overlay" onClick={() => setShowCreateQuiz(false)}>
          <div className="modal-content quiz-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowCreateQuiz(false)}>✕</button>
            <h3>📝 {quizType === 'module' ? 'Tạo Quiz cho Module' : 'Tạo Final Quiz'}</h3>
            
            <div className="form-group">
              <label>Tiêu đề Quiz *</label>
              <input 
                type="text" 
                placeholder="Kiểm tra Module 1" 
                className="input-field"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                placeholder="Mô tả về bài kiểm tra"
                className="textarea-field"
                rows={3}
                value={quizDescription}
                onChange={(e) => setQuizDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="form-group">
              <label>Thời gian làm bài (phút) *</label>
              <input 
                type="number" 
                className="input-field"
                value={quizDuration}
                onChange={(e) => setQuizDuration(Number(e.target.value))}
                min="5"
                max="180"
              />
            </div>

            <div className="form-group">
              <label>Điểm đạt (%) *</label>
              <input 
                type="number" 
                className="input-field"
                value={quizPassingScore}
                onChange={(e) => setQuizPassingScore(Number(e.target.value))}
                min="0"
                max="100"
              />
            </div>

            <div className="questions-section">
              <div className="section-title">
                <h4>Câu hỏi ({questions.length})</h4>
                <button 
                  className="btn-secondary small"
                  onClick={() => setShowAddQuestion(true)}
                >
                  + Thêm câu hỏi
                </button>
              </div>

              {questions.length > 0 ? (
                <div className="questions-list">
                  {questions.map((q, index) => (
                    <div key={q.id} className="question-item">
                      <div className="question-header">
                        <span className="question-number">Câu {index + 1}</span>
                        <span className="question-points">{q.points} điểm</span>
                      </div>
                      <p className="question-text">{q.question}</p>
                      <span className="question-type-badge">
                        {q.type === 'multiple-choice' ? '📋 Trắc nghiệm' : 
                         q.type === 'true-false' ? '✓/✗ Đúng/Sai' : 
                         '✍️ Tự luận'}
                      </span>
                      <button 
                        className="btn-delete-question"
                        onClick={() => handleDeleteQuestion(q.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-questions">
                  <p>Chưa có câu hỏi nào. Hãy thêm câu hỏi cho quiz.</p>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowCreateQuiz(false)}>
                Hủy
              </button>
              <button className="btn-primary" onClick={handleSaveQuiz}>
                Lưu Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {showAddQuestion && (
        <div className="modal-overlay" onClick={() => setShowAddQuestion(false)}>
          <div className="modal-content question-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowAddQuestion(false)}>✕</button>
            <h3>➕ Thêm câu hỏi</h3>

            <div className="form-group">
              <label>Loại câu hỏi *</label>
              <div className="question-type-options">
                <button
                  className={`type-btn ${questionType === 'multiple-choice' ? 'active' : ''}`}
                  onClick={() => setQuestionType('multiple-choice')}
                >
                  📋 Trắc nghiệm
                </button>
                <button
                  className={`type-btn ${questionType === 'true-false' ? 'active' : ''}`}
                  onClick={() => setQuestionType('true-false')}
                >
                  ✓/✗ Đúng/Sai
                </button>
                <button
                  className={`type-btn ${questionType === 'essay' ? 'active' : ''}`}
                  onClick={() => setQuestionType('essay')}
                >
                  ✍️ Tự luận
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Câu hỏi *</label>
              <textarea
                placeholder="Nhập câu hỏi..."
                className="textarea-field"
                rows={3}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
              ></textarea>
            </div>

            {questionType === 'multiple-choice' && (
              <div className="form-group">
                <label>Các đáp án *</label>
                {questionOptions.map((option, index) => (
                  <div key={index} className="option-input-group">
                    <input
                      type="text"
                      placeholder={`Đáp án ${index + 1}`}
                      className="input-field"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...questionOptions];
                        newOptions[index] = e.target.value;
                        setQuestionOptions(newOptions);
                      }}
                    />
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={correctAnswer === index}
                      onChange={() => setCorrectAnswer(index)}
                    />
                    <label>Đúng</label>
                  </div>
                ))}
              </div>
            )}

            {questionType === 'true-false' && (
              <div className="form-group">
                <label>Đáp án đúng *</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="trueFalse"
                      checked={correctAnswer === 0}
                      onChange={() => setCorrectAnswer(0)}
                    />
                    <span>Đúng</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="trueFalse"
                      checked={correctAnswer === 1}
                      onChange={() => setCorrectAnswer(1)}
                    />
                    <span>Sai</span>
                  </label>
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Điểm *</label>
              <input 
                type="number" 
                className="input-field"
                value={questionPoints}
                onChange={(e) => setQuestionPoints(Number(e.target.value))}
                min="1"
                max="100"
              />
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowAddQuestion(false)}>
                Hủy
              </button>
              <button className="btn-primary" onClick={handleAddQuestion}>
                Thêm câu hỏi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Detail Modal */}
      {showQuizDetail && (
        <div className="modal-overlay" onClick={() => setShowQuizDetail(null)}>
          <div className="modal-content quiz-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowQuizDetail(null)}>✕</button>
            
            <div className="quiz-detail-header">
              <div className="quiz-detail-icon">📝</div>
              <div className="quiz-detail-info">
                <h2>{showQuizDetail.title}</h2>
                <p>{showQuizDetail.description}</p>
                <div className="quiz-detail-meta">
                  <span>⏱️ {showQuizDetail.duration} phút</span>
                  <span>📊 Điểm đạt: {showQuizDetail.passingScore}%</span>
                  <span>💯 Tổng điểm: {showQuizDetail.totalPoints}</span>
                  <span>❓ {showQuizDetail.questions.length} câu hỏi</span>
                </div>
              </div>
            </div>

            <div className="quiz-detail-body">
              <h3>Danh sách câu hỏi</h3>
              {showQuizDetail.questions.map((q, index) => (
                <div key={q.id} className="question-preview">
                  <div className="question-preview-header">
                    <span className="question-number">Câu {index + 1}</span>
                    <span className="question-points">{q.points} điểm</span>
                  </div>
                  <p className="question-text">{q.question}</p>
                  
                  {q.type === 'multiple-choice' && q.options && (
                    <div className="question-options">
                      {q.options.map((option, optIndex) => (
                        <div 
                          key={optIndex} 
                          className={`option-item ${optIndex === q.correctAnswer ? 'correct' : ''}`}
                        >
                          <span className="option-letter">{String.fromCharCode(65 + optIndex)}.</span>
                          <span>{option}</span>
                          {optIndex === q.correctAnswer && (
                            <span className="correct-badge">✓ Đáp án đúng</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === 'true-false' && (
                    <div className="question-options">
                      <div className={`option-item ${q.correctAnswer === 0 ? 'correct' : ''}`}>
                        <span>✓ Đúng</span>
                        {q.correctAnswer === 0 && (
                          <span className="correct-badge">✓ Đáp án đúng</span>
                        )}
                      </div>
                      <div className={`option-item ${q.correctAnswer === 1 ? 'correct' : ''}`}>
                        <span>✗ Sai</span>
                        {q.correctAnswer === 1 && (
                          <span className="correct-badge">✓ Đáp án đúng</span>
                        )}
                      </div>
                    </div>
                  )}

                  {q.type === 'essay' && (
                    <div className="essay-note">
                      <span>✍️ Câu hỏi tự luận - Học viên sẽ nhập câu trả lời</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowQuizDetail(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
