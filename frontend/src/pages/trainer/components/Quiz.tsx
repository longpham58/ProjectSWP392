import { useState, useRef } from 'react';
import { mockQuizzes, mockQuizAttempts, Quiz, QuizQuestion, EXCEL_TEMPLATE_INFO } from '../../../mocks/mockQuizData';
import { mockCoursesList } from '../../../mocks/mockTrainerData';

export default function QuizComponent() {
  const [quizzes, setQuizzes] = useState<Quiz[]>(mockQuizzes);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft'>('all');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [passingScore, setPassingScore] = useState(70);
  const [dueDate, setDueDate] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  const handleCreateQuiz = () => {
    if (!title || !courseCode || !description) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const course = mockCoursesList.find(c => c.code === courseCode);
    const newQuiz: Quiz = {
      id: Date.now().toString(),
      title,
      courseCode,
      courseName: course?.name || '',
      description,
      duration,
      totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
      passingScore,
      status: 'draft',
      createdDate: new Date().toLocaleDateString('vi-VN'),
      dueDate: dueDate || undefined,
      attempts: 0,
      questions
    };


    setQuizzes([newQuiz, ...quizzes]);
    setSuccessMessage('Tạo quiz thành công!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    resetForm();
    setShowCreateModal(false);
  };

  const handleImportExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Kiểm tra file Excel
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
      return;
    }

    // Mock: Parse Excel file (trong thực tế sẽ dùng thư viện như xlsx)
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // Mock data từ Excel
        const importedQuestions: QuizQuestion[] = [
          {
            id: Date.now().toString() + '1',
            question: 'Python là ngôn ngữ lập trình gì?',
            type: 'multiple-choice',
            options: ['Ngôn ngữ biên dịch', 'Ngôn ngữ thông dịch', 'Ngôn ngữ Assembly', 'Ngôn ngữ máy'],
            correctAnswer: 'Ngôn ngữ thông dịch',
            points: 10,
            explanation: 'Python là ngôn ngữ thông dịch'
          },
          {
            id: Date.now().toString() + '2',
            question: 'Biến trong Python có cần khai báo kiểu không?',
            type: 'true-false',
            options: ['Đúng', 'Sai'],
            correctAnswer: 'Sai',
            points: 10
          }
        ];

        setQuestions([...questions, ...importedQuestions]);
        setSuccessMessage(`Import thành công ${importedQuestions.length} câu hỏi từ Excel!`);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        setShowImportModal(false);
      } catch (error) {
        alert('Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDownloadTemplate = () => {
    // Mock: Tạo file template
    alert('Đang tải template Excel...\n\nTemplate sẽ có các cột:\n' + EXCEL_TEMPLATE_INFO.columns.join(', '));
  };

  const handlePublishQuiz = (quizId: string) => {
    if (confirm('Bạn có chắc muốn xuất bản quiz này? Học viên sẽ có thể làm bài.')) {
      setQuizzes(quizzes.map(q => 
        q.id === quizId ? { ...q, status: 'published' as const } : q
      ));
      setSuccessMessage('Xuất bản quiz thành công!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleDeleteQuiz = (quizId: string) => {
    if (confirm('Bạn có chắc muốn xóa quiz này?')) {
      setQuizzes(quizzes.filter(q => q.id !== quizId));
      setSuccessMessage('Xóa quiz thành công!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const resetForm = () => {
    setTitle('');
    setCourseCode('');
    setDescription('');
    setDuration(60);
    setPassingScore(70);
    setDueDate('');
    setQuestions([]);
  };

  const getFilteredQuizzes = () => {
    if (activeTab === 'all') return quizzes;
    return quizzes.filter(q => q.status === activeTab);
  };

  const filteredQuizzes = getFilteredQuizzes();
  const quizAttempts = selectedQuiz ? mockQuizAttempts.filter(a => a.quizId === selectedQuiz.id) : [];

  return (
    <div className="quiz-container">
      <div className="section-header">
        <h2>📝 Quản lý Quiz</h2>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          + Tạo Quiz Mới
        </button>
      </div>

      {showSuccess && (
        <div className="success-message">
          <span className="success-icon">✅</span>
          <span>{successMessage}</span>
        </div>
      )}

      <p className="section-subtitle">
        Tạo và quản lý các bài kiểm tra trực tuyến cho học viên
      </p>

      <div className="quiz-tabs">
        <button
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Tất cả ({quizzes.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'published' ? 'active' : ''}`}
          onClick={() => setActiveTab('published')}
        >
          Đã xuất bản ({quizzes.filter(q => q.status === 'published').length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'draft' ? 'active' : ''}`}
          onClick={() => setActiveTab('draft')}
        >
          Nháp ({quizzes.filter(q => q.status === 'draft').length})
        </button>
      </div>


      <div className="quiz-list">
        {filteredQuizzes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>Chưa có quiz nào</h3>
            <p>Tạo quiz mới để bắt đầu kiểm tra học viên</p>
          </div>
        ) : (
          filteredQuizzes.map((quiz) => (
            <div key={quiz.id} className={`quiz-card ${quiz.status}`}>
              <div className="quiz-card-header">
                <div className="quiz-info">
                  <h3>{quiz.title}</h3>
                  <div className="quiz-meta">
                    <span className="course-badge">{quiz.courseCode}</span>
                    <span className="status-badge-quiz {quiz.status}">
                      {quiz.status === 'published' ? '✓ Đã xuất bản' : 
                       quiz.status === 'draft' ? '📝 Nháp' : '🔒 Đã đóng'}
                    </span>
                  </div>
                </div>
                <div className="quiz-stats">
                  <div className="stat-item">
                    <span className="stat-label">Thời gian</span>
                    <span className="stat-value">{quiz.duration} phút</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Câu hỏi</span>
                    <span className="stat-value">{quiz.questions.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Lượt làm</span>
                    <span className="stat-value">{quiz.attempts}</span>
                  </div>
                </div>
              </div>

              <p className="quiz-description">{quiz.description}</p>

              <div className="quiz-details">
                <span>📊 Tổng điểm: {quiz.totalPoints}</span>
                <span>🎯 Điểm đạt: {quiz.passingScore}</span>
                <span>📅 Tạo: {quiz.createdDate}</span>
                {quiz.dueDate && <span>⏰ Hạn: {quiz.dueDate}</span>}
              </div>

              <div className="quiz-actions">
                <button 
                  className="btn-icon"
                  onClick={() => {
                    setSelectedQuiz(quiz);
                    setShowDetailModal(true);
                  }}
                >
                  👁️ Xem chi tiết
                </button>
                {quiz.status === 'published' && (
                  <button 
                    className="btn-icon"
                    onClick={() => {
                      setSelectedQuiz(quiz);
                      setShowResultsModal(true);
                    }}
                  >
                    📊 Kết quả
                  </button>
                )}
                {quiz.status === 'draft' && (
                  <button 
                    className="btn-icon publish"
                    onClick={() => handlePublishQuiz(quiz.id)}
                  >
                    ✓ Xuất bản
                  </button>
                )}
                <button 
                  className="btn-icon delete"
                  onClick={() => handleDeleteQuiz(quiz.id)}
                >
                  🗑️ Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content quiz-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowCreateModal(false)}>✕</button>
            <h3>📝 Tạo Quiz Mới</h3>

            <div className="form-group">
              <label>Tiêu đề quiz *</label>
              <input 
                type="text" 
                placeholder="Kiểm tra giữa kỳ - Python" 
                className="input-field"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Chọn khóa học *</label>
              <select 
                className="select-field"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
              >
                <option value="">Chọn khóa học</option>
                {mockCoursesList.map((course) => (
                  <option key={course.code} value={course.code}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                placeholder="Mô tả nội dung quiz..."
                className="textarea-field"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Thời gian (phút)</label>
                <input 
                  type="number" 
                  className="input-field"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  min="1"
                />
              </div>

              <div className="form-group">
                <label>Điểm đạt (%)</label>
                <input 
                  type="number" 
                  className="input-field"
                  value={passingScore}
                  onChange={(e) => setPassingScore(Number(e.target.value))}
                  min="0"
                  max="100"
                />
              </div>

              <div className="form-group">
                <label>Hạn nộp</label>
                <input 
                  type="date" 
                  className="input-field"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>


            <div className="questions-section">
              <div className="section-title">
                <h4>Câu hỏi ({questions.length})</h4>
                <button 
                  className="btn-secondary"
                  onClick={() => setShowImportModal(true)}
                >
                  📥 Import từ Excel
                </button>
              </div>

              {questions.length === 0 ? (
                <div className="empty-questions">
                  <p>Chưa có câu hỏi nào. Hãy import từ Excel hoặc thêm thủ công.</p>
                </div>
              ) : (
                <div className="questions-list">
                  {questions.map((q, index) => (
                    <div key={q.id} className="question-item">
                      <div className="question-header">
                        <span className="question-number">Câu {index + 1}</span>
                        <span className="question-points">{q.points} điểm</span>
                      </div>
                      <p className="question-text">{q.question}</p>
                      <span className="question-type">{q.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => {
                resetForm();
                setShowCreateModal(false);
              }}>
                Hủy
              </button>
              <button className="btn-primary" onClick={handleCreateQuiz}>
                💾 Lưu Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Excel Modal */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-content import-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowImportModal(false)}>✕</button>
            <h3>📥 Import Câu hỏi từ Excel</h3>

            <div className="import-instructions">
              <h4>Hướng dẫn:</h4>
              <ol>
                <li>Tải file template Excel mẫu</li>
                <li>Điền câu hỏi theo định dạng trong template</li>
                <li>Upload file Excel đã hoàn thành</li>
              </ol>

              <div className="template-info">
                <h5>Định dạng file Excel:</h5>
                <ul>
                  <li><strong>Cột A:</strong> STT</li>
                  <li><strong>Cột B:</strong> Câu hỏi</li>
                  <li><strong>Cột C:</strong> Loại (multiple-choice/true-false/short-answer)</li>
                  <li><strong>Cột D-G:</strong> Đáp án A, B, C, D</li>
                  <li><strong>Cột H:</strong> Đáp án đúng (A/B/C/D hoặc text)</li>
                  <li><strong>Cột I:</strong> Điểm</li>
                  <li><strong>Cột J:</strong> Giải thích (tùy chọn)</li>
                </ul>
              </div>
            </div>

            <div className="import-actions">
              <button className="btn-secondary" onClick={handleDownloadTemplate}>
                📄 Tải Template Excel
              </button>

              <div className="upload-section">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept=".xlsx,.xls"
                  onChange={handleImportExcel}
                  style={{ display: 'none' }}
                />
                <button 
                  className="btn-primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  📤 Chọn file Excel
                </button>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowImportModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Detail Modal */}
      {showDetailModal && selectedQuiz && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content quiz-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowDetailModal(false)}>✕</button>
            
            <div className="quiz-detail-header">
              <h2>{selectedQuiz.title}</h2>
              <span className={`status-badge-quiz ${selectedQuiz.status}`}>
                {selectedQuiz.status === 'published' ? '✓ Đã xuất bản' : '📝 Nháp'}
              </span>
            </div>

            <div className="quiz-detail-info">
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Khóa học:</span>
                  <span className="info-value">{selectedQuiz.courseCode} - {selectedQuiz.courseName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Thời gian:</span>
                  <span className="info-value">{selectedQuiz.duration} phút</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Tổng điểm:</span>
                  <span className="info-value">{selectedQuiz.totalPoints}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Điểm đạt:</span>
                  <span className="info-value">{selectedQuiz.passingScore}%</span>
                </div>
              </div>
            </div>

            <div className="quiz-questions-detail">
              <h3>Danh sách câu hỏi ({selectedQuiz.questions.length})</h3>
              {selectedQuiz.questions.map((q, index) => (
                <div key={q.id} className="question-detail-card">
                  <div className="question-detail-header">
                    <span className="question-number">Câu {index + 1}</span>
                    <span className="question-points">{q.points} điểm</span>
                  </div>
                  <p className="question-text"><strong>{q.question}</strong></p>
                  {q.options && (
                    <div className="question-options">
                      {q.options.map((opt, i) => (
                        <div key={i} className={`option ${opt === q.correctAnswer ? 'correct' : ''}`}>
                          {String.fromCharCode(65 + i)}. {opt}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="question-answer">
                    <strong>Đáp án đúng:</strong> {q.correctAnswer}
                  </div>
                  {q.explanation && (
                    <div className="question-explanation">
                      <strong>Giải thích:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Results Modal */}
      {showResultsModal && selectedQuiz && (
        <div className="modal-overlay" onClick={() => setShowResultsModal(false)}>
          <div className="modal-content results-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowResultsModal(false)}>✕</button>
            
            <h2>📊 Kết quả Quiz: {selectedQuiz.title}</h2>

            <div className="results-stats">
              <div className="stat-card">
                <div className="stat-value">{quizAttempts.length}</div>
                <div className="stat-label">Lượt làm bài</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {quizAttempts.filter(a => a.status === 'passed').length}
                </div>
                <div className="stat-label">Đạt</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {quizAttempts.filter(a => a.status === 'failed').length}
                </div>
                <div className="stat-label">Không đạt</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {quizAttempts.length > 0 
                    ? Math.round(quizAttempts.reduce((sum, a) => sum + a.percentage, 0) / quizAttempts.length)
                    : 0}%
                </div>
                <div className="stat-label">Điểm TB</div>
              </div>
            </div>

            <div className="results-table">
              <table>
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Học viên</th>
                    <th>Mã SV</th>
                    <th>Điểm</th>
                    <th>Phần trăm</th>
                    <th>Kết quả</th>
                    <th>Thời gian</th>
                    <th>Ngày nộp</th>
                  </tr>
                </thead>
                <tbody>
                  {quizAttempts.map((attempt, index) => (
                    <tr key={attempt.id}>
                      <td>{index + 1}</td>
                      <td>{attempt.studentName}</td>
                      <td>{attempt.studentId}</td>
                      <td>{attempt.score}/{attempt.totalPoints}</td>
                      <td>{attempt.percentage}%</td>
                      <td>
                        <span className={`result-badge ${attempt.status}`}>
                          {attempt.status === 'passed' ? '✓ Đạt' : '✗ Không đạt'}
                        </span>
                      </td>
                      <td>{attempt.timeSpent} phút</td>
                      <td>{attempt.submittedDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowResultsModal(false)}>
                Đóng
              </button>
              <button className="btn-primary">
                📥 Xuất Excel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
