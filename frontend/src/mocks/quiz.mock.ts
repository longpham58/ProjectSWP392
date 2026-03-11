import type { CourseModule, Test, TestAttempt, FinalExam, Quiz, Document, Video, UserModuleProgress } from '../types/quiz.types';

// Mock Documents
const mockDocuments: Document[] = [
  // Course 1 - Information Security
  { id: 1, title: 'Giới thiệu An ninh thông tin.pdf', type: 'PDF', url: '/docs/intro-security.pdf', size: '2.5 MB' },
  { id: 2, title: 'Các loại mối đe dọa.pdf', type: 'PDF', url: '/docs/threats.pdf', size: '3.1 MB' },
  { id: 3, title: 'Bảo mật mạng.pptx', type: 'PPTX', url: '/docs/network-security.pptx', size: '5.2 MB' },
  
  // Course 2 - Workplace Ethics
  { id: 4, title: 'Quy tắc đạo đức công ty.pdf', type: 'PDF', url: '/docs/ethics-handbook.pdf', size: '1.8 MB' },
  { id: 5, title: 'Tuân thủ pháp luật.docx', type: 'DOCX', url: '/docs/compliance.docx', size: '1.2 MB' },
  { id: 6, title: 'Hành vi chuyên nghiệp.pptx', type: 'PPTX', url: '/docs/professional-behavior.pptx', size: '2.8 MB' },
  
  // Course 3 - Leadership
  { id: 7, title: 'Kỹ năng lãnh đạo.pdf', type: 'PDF', url: '/docs/leadership-skills.pdf', size: '3.5 MB' },
  { id: 8, title: 'Quản lý nhóm.pdf', type: 'PDF', url: '/docs/team-management.pdf', size: '2.9 MB' },
  { id: 9, title: 'Ra quyết định chiến lược.pptx', type: 'PPTX', url: '/docs/strategic-decisions.pptx', size: '4.1 MB' },
];

// Mock Videos
const mockVideos: Video[] = [
  // Course 1 - Information Security
  { id: 1, title: 'Giới thiệu về An ninh thông tin', duration: '15:30', url: '/videos/intro-security.mp4', thumbnail: 'https://via.placeholder.com/320x180', type: 'VIDEO' },
  { id: 2, title: 'Các mối đe dọa phổ biến', duration: '22:45', url: '/videos/threats.mp4', thumbnail: 'https://via.placeholder.com/320x180', type: 'VIDEO' },
  { id: 3, title: 'Bảo vệ dữ liệu cá nhân', duration: '18:20', url: '/videos/data-protection.mp4', thumbnail: 'https://via.placeholder.com/320x180', type: 'VIDEO' },

  // Course 2 - Workplace Ethics
  { id: 4, title: 'Đạo đức trong công việc', duration: '12:15', url: '/videos/work-ethics.mp4', thumbnail: 'https://via.placeholder.com/320x180', type: 'VIDEO' },
  { id: 5, title: 'Xử lý xung đột lợi ích', duration: '16:30', url: '/videos/conflicts.mp4', thumbnail: 'https://via.placeholder.com/320x180', type: 'VIDEO' },
  { id: 6, title: 'Văn hóa công ty', duration: '14:45', url: '/videos/company-culture.mp4', thumbnail: 'https://via.placeholder.com/320x180', type: 'VIDEO' },

  // Course 3 - Leadership
  { id: 7, title: 'Phong cách lãnh đạo', duration: '20:30', url: '/videos/leadership-styles.mp4', thumbnail: 'https://via.placeholder.com/320x180', type: 'VIDEO' },
  { id: 8, title: 'Động viên nhân viên', duration: '18:15', url: '/videos/motivation.mp4', thumbnail: 'https://via.placeholder.com/320x180', type: 'VIDEO' },
  { id: 9, title: 'Quản lý thay đổi', duration: '25:40', url: '/videos/change-management.mp4', thumbnail: 'https://via.placeholder.com/320x180', type: 'VIDEO' },
];

// Mock Quizzes
export const mockQuizzes: Quiz[] = [
  {
    id: 1,
    moduleId: 1,
    title: 'Quiz: Kiến thức cơ bản về An ninh',
    description: 'Kiểm tra hiểu biết về an ninh thông tin',
    quizType: 'PRACTICE',
    durationMinutes: 15,
    maxAttempts: 3,
    passingScore: 70,
    totalQuestions: 5,
    questions: [
      {
        id: 1,
        question: 'An ninh thông tin là gì?',
        options: ['Bảo vệ dữ liệu', 'Bảo vệ thông tin khỏi truy cập trái phép', 'Mã hóa dữ liệu', 'Sao lưu dữ liệu'],
        correctAnswer: 1
      },
      {
        id: 2,
        question: 'CIA trong an ninh là gì?',
        options: ['Central Intelligence Agency', 'Confidentiality, Integrity, Availability', 'Computer Information Access', 'Cyber Internet Attack'],
        correctAnswer: 1
      },
      {
        id: 3,
        question: 'Phishing là gì?',
        options: ['Câu cá', 'Tấn công lừa đảo qua email', 'Virus máy tính', 'Firewall'],
        correctAnswer: 1
      },
      {
        id: 4,
        question: 'Mật khẩu mạnh nên có?',
        options: ['Chỉ chữ thường', 'Chỉ số', 'Kết hợp chữ, số, ký tự đặc biệt', 'Tên của bạn'],
        correctAnswer: 2
      },
      {
        id: 5,
        question: 'Firewall dùng để?',
        options: ['Chống cháy', 'Bảo vệ mạng', 'Tăng tốc internet', 'Lưu trữ dữ liệu'],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 2,
    moduleId: 2,
    title: 'Quiz: Mối đe dọa an ninh',
    description: 'Kiểm tra kiến thức về các mối đe dọa',
    quizType: 'PRACTICE',
    durationMinutes: 15,
    maxAttempts: 3,
    passingScore: 70,
    totalQuestions: 5,
    questions: [
      {
        id: 6,
        question: 'Malware là gì?',
        options: ['Phần mềm hợp pháp', 'Phần mềm độc hại', 'Phần mềm gián điệp', 'Phần mềm diệt virus'],
        correctAnswer: 1
      },
      {
        id: 7,
        question: 'Ransomware là gì?',
        options: ['Phần mềm quảng cáo', 'Phần mã hóa dữ liệu để đòi tiền', 'Phần mềm gián điệp', 'Phần mềm đào tiền ảo'],
        correctAnswer: 1
      },
      {
        id: 8,
        question: 'SQL Injection là gì?',
        options: ['Tấn công vào cơ sở dữ liệu', 'Tấn công từ chối dịch vụ', 'Tấn công man-in-the-middle', 'Tấn công vào mạng wifi'],
        correctAnswer: 0
      },
      {
        id: 9,
        question: 'DDoS là gì?',
        options: ['Tấn công trực tiếp', 'Tấn công từ chối dịch vụ phân tán', 'Tấn công lừa đảo', 'Tấn công vào database'],
        correctAnswer: 1
      },
      {
        id: 10,
        question: 'Zero-day vulnerability là gì?',
        options: ['Lỗ hổng đã được vá', 'Lỗ hổng chưa được vá', 'Lỗ hổng không nguy hiểm', 'Lỗ hổng chỉ xảy ra vào ngày mai'],
        correctAnswer: 1
      }
    ]
  }
];

export const mockQuizAttempts: any[] = [
  // Quiz 1 attempts for user 1
  {
    id: 1,
    userId: 1,
    quizId: 1,
    score: 80,
    passed: true,
    completedAt: '2026-03-01T10:30:00',
    timeTakenMinutes: 10
  }
];

// Mock Tests (3 tests per course)
export const mockTests: Test[] = [
  // Course 1 Tests
  {
    id: 1,
    courseId: 1,
    title: 'Test 1: Kiến thức nền tảng An ninh',
    description: 'Đánh giá kiến thức cơ bản về an ninh thông tin',
    passingScore: 70,
    duration: 30,
    maxAttempts: 3,
    questions: [
      { id: 1, question: 'CIA trong an ninh là gì?', options: ['Central Intelligence Agency', 'Confidentiality, Integrity, Availability', 'Computer Information Access', 'Cyber Internet Attack'], correctAnswer: 1 },
      { id: 2, question: 'Phishing là gì?', options: ['Câu cá', 'Tấn công lừa đảo qua email', 'Virus máy tính', 'Firewall'], correctAnswer: 1 },
      { id: 3, question: 'Mật khẩu mạnh nên có?', options: ['Chỉ chữ thường', 'Chỉ số', 'Kết hợp chữ, số, ký tự đặc biệt', 'Tên của bạn'], correctAnswer: 2 },
      { id: 4, question: 'Two-factor authentication là?', options: ['Xác thực 2 lớp', 'Mật khẩu kép', 'Đăng nhập 2 lần', 'Có 2 tài khoản'], correctAnswer: 0 },
      { id: 5, question: 'Firewall dùng để?', options: ['Chống cháy', 'Bảo vệ mạng', 'Tăng tốc internet', 'Lưu trữ dữ liệu'], correctAnswer: 1 }
    ]
  },
  {
    id: 2,
    courseId: 1,
    title: 'Test 2: Mối đe dọa và Phòng chống',
    description: 'Đánh giá khả năng nhận biết và phòng chống mối đe dọa',
    passingScore: 70,
    duration: 30,
    maxAttempts: 3,
    questions: [
      { id: 6, question: 'Malware là gì?', options: ['Phần mềm tốt', 'Phần mềm độc hại', 'Phần mềm miễn phí', 'Phần mềm bản quyền'], correctAnswer: 1 },
      { id: 7, question: 'Ransomware làm gì?', options: ['Mã hóa dữ liệu và đòi tiền chuộc', 'Xóa dữ liệu', 'Sao chép dữ liệu', 'Nén dữ liệu'], correctAnswer: 0 },
      { id: 8, question: 'Social engineering là?', options: ['Kỹ thuật xã hội', 'Lừa đảo tâm lý', 'Mạng xã hội', 'Kỹ sư xã hội'], correctAnswer: 1 },
      { id: 9, question: 'VPN dùng để?', options: ['Tăng tốc mạng', 'Bảo mật kết nối', 'Chặn quảng cáo', 'Tải file nhanh'], correctAnswer: 1 },
      { id: 10, question: 'Backup dữ liệu nên?', options: ['Không cần thiết', 'Thỉnh thoảng', 'Định kỳ và tự động', 'Khi nhớ'], correctAnswer: 2 }
    ]
  },
  {
    id: 3,
    courseId: 1,
    title: 'Test 3: Thực hành An ninh',
    description: 'Đánh giá kỹ năng áp dụng an ninh thông tin',
    passingScore: 70,
    duration: 30,
    maxAttempts: 3,
    questions: [
      { id: 11, question: 'Khi nhận email lạ nên?', options: ['Mở ngay', 'Xóa hoặc báo spam', 'Chuyển tiếp', 'Reply'], correctAnswer: 1 },
      { id: 12, question: 'USB lạ cắm vào máy?', options: ['An toàn', 'Nguy hiểm, có thể chứa malware', 'Không sao', 'Tốt'], correctAnswer: 1 },
      { id: 13, question: 'Cập nhật phần mềm?', options: ['Không cần', 'Quan trọng cho bảo mật', 'Tùy thích', 'Làm chậm máy'], correctAnswer: 1 },
      { id: 14, question: 'Chia sẻ mật khẩu?', options: ['Với bạn bè', 'Với đồng nghiệp', 'Không bao giờ', 'Với sếp'], correctAnswer: 2 },
      { id: 15, question: 'WiFi công cộng?', options: ['An toàn tuyệt đối', 'Nguy hiểm, dùng VPN', 'Không sao', 'Tốt hơn WiFi nhà'], correctAnswer: 1 }
    ]
  },
  // Course 2 Tests
  {
    id: 4,
    courseId: 2,
    title: 'Test 1: Đạo đức cơ bản',
    description: 'Đánh giá hiểu biết về đạo đức công ty',
    passingScore: 70,
    duration: 30,
    maxAttempts: 3,
    questions: [
      { id: 16, question: 'Đạo đức nghề nghiệp là?', options: ['Quy tắc ứng xử', 'Luật pháp', 'Hợp đồng', 'Lương thưởng'], correctAnswer: 0 },
      { id: 17, question: 'Xung đột lợi ích nên?', options: ['Giấu đi', 'Báo cáo và tránh', 'Không quan trọng', 'Tự giải quyết'], correctAnswer: 1 },
      { id: 18, question: 'Thông tin mật công ty?', options: ['Chia sẻ tự do', 'Bảo mật nghiêm ngặt', 'Đăng mạng xã hội', 'Kể bạn bè'], correctAnswer: 1 },
      { id: 19, question: 'Quà tặng từ đối tác?', options: ['Nhận thoải mái', 'Cân nhắc và báo cáo', 'Từ chối hết', 'Giấu đi'], correctAnswer: 1 },
      { id: 20, question: 'Phân biệt đối xử?', options: ['Bình thường', 'Vi phạm nghiêm trọng', 'Không sao', 'Tùy trường hợp'], correctAnswer: 1 }
    ]
  },
  {
    id: 5,
    courseId: 2,
    title: 'Test 2: Tuân thủ quy định',
    description: 'Đánh giá hiểu biết về tuân thủ',
    passingScore: 70,
    duration: 30,
    maxAttempts: 3,
    questions: [
      { id: 21, question: 'Vi phạm quy định nên?', options: ['Giấu đi', 'Báo cáo ngay', 'Không quan trọng', 'Tự xử lý'], correctAnswer: 1 },
      { id: 22, question: 'Whistleblowing là?', options: ['Thổi còi', 'Tố cáo sai phạm', 'Làm ồn', 'Phàn nàn'], correctAnswer: 1 },
      { id: 23, question: 'Hối lộ là?', options: ['Quà tặng', 'Vi phạm pháp luật', 'Bình thường', 'Văn hóa'], correctAnswer: 1 },
      { id: 24, question: 'Bảo vệ người tố cáo?', options: ['Không cần', 'Rất quan trọng', 'Tùy trường hợp', 'Không thực tế'], correctAnswer: 1 },
      { id: 25, question: 'Tuân thủ pháp luật?', options: ['Tùy chọn', 'Bắt buộc', 'Không cần', 'Linh hoạt'], correctAnswer: 1 }
    ]
  },
  {
    id: 6,
    courseId: 2,
    title: 'Test 3: Hành vi chuyên nghiệp',
    description: 'Đánh giá hành vi chuyên nghiệp',
    passingScore: 70,
    duration: 30,
    maxAttempts: 3,
    questions: [
      { id: 26, question: 'Tôn trọng đồng nghiệp?', options: ['Không cần', 'Rất quan trọng', 'Tùy người', 'Không thực tế'], correctAnswer: 1 },
      { id: 27, question: 'Giao tiếp hiệu quả?', options: ['Không quan trọng', 'Cần thiết', 'Tùy thích', 'Không cần học'], correctAnswer: 1 },
      { id: 28, question: 'Làm việc nhóm?', options: ['Làm một mình tốt hơn', 'Kỹ năng quan trọng', 'Không cần', 'Lãng phí thời gian'], correctAnswer: 1 },
      { id: 29, question: 'Phản hồi tiêu cực?', options: ['Bỏ qua', 'Lắng nghe và cải thiện', 'Phản đối', 'Tức giận'], correctAnswer: 1 },
      { id: 30, question: 'Đúng giờ?', options: ['Không quan trọng', 'Thể hiện chuyên nghiệp', 'Tùy hứng', 'Không cần'], correctAnswer: 1 }
    ]
  },
  // Course 3 Tests
  {
    id: 7,
    courseId: 3,
    title: 'Test 1: Kỹ năng lãnh đạo cơ bản',
    description: 'Đánh giá kỹ năng lãnh đạo',
    passingScore: 70,
    duration: 30,
    maxAttempts: 3,
    questions: [
      { id: 31, question: 'Lãnh đạo khác quản lý?', options: ['Giống nhau', 'Khác nhau', 'Không liên quan', 'Tùy công ty'], correctAnswer: 1 },
      { id: 32, question: 'Tầm nhìn quan trọng?', options: ['Không', 'Rất quan trọng', 'Tùy', 'Không cần'], correctAnswer: 1 },
      { id: 33, question: 'Động viên nhân viên?', options: ['Chỉ bằng tiền', 'Nhiều cách khác nhau', 'Không cần', 'Tự động viên'], correctAnswer: 1 },
      { id: 34, question: 'Lắng nghe nhân viên?', options: ['Lãng phí thời gian', 'Rất quan trọng', 'Không cần', 'Tùy thích'], correctAnswer: 1 },
      { id: 35, question: 'Phát triển nhân viên?', options: ['Không cần', 'Trách nhiệm của lãnh đạo', 'Tự lo', 'Không quan trọng'], correctAnswer: 1 }
    ]
  },
  {
    id: 8,
    courseId: 3,
    title: 'Test 2: Ra quyết định',
    description: 'Đánh giá kỹ năng ra quyết định',
    passingScore: 70,
    duration: 30,
    maxAttempts: 3,
    questions: [
      { id: 36, question: 'Quyết định dựa trên?', options: ['Cảm tính', 'Dữ liệu và phân tích', 'Ý kiến cá nhân', 'Ngẫu nhiên'], correctAnswer: 1 },
      { id: 37, question: 'Rủi ro trong quyết định?', options: ['Tránh hết', 'Đánh giá và quản lý', 'Bỏ qua', 'Không quan trọng'], correctAnswer: 1 },
      { id: 38, question: 'Tham vấn ý kiến?', options: ['Không cần', 'Nên làm', 'Lãng phí thời gian', 'Yếu đuối'], correctAnswer: 1 },
      { id: 39, question: 'Quyết định sai?', options: ['Giấu đi', 'Học hỏi và điều chỉnh', 'Đổ lỗi', 'Bỏ qua'], correctAnswer: 1 },
      { id: 40, question: 'Thời điểm quyết định?', options: ['Càng nhanh càng tốt', 'Cân nhắc kỹ nhưng đúng lúc', 'Trì hoãn', 'Tùy hứng'], correctAnswer: 1 }
    ]
  },
  {
    id: 9,
    courseId: 3,
    title: 'Test 3: Quản lý thay đổi',
    description: 'Đánh giá kỹ năng quản lý thay đổi',
    passingScore: 70,
    duration: 30,
    maxAttempts: 3,
    questions: [
      { id: 41, question: 'Thay đổi là?', options: ['Xấu', 'Cần thiết', 'Tránh', 'Nguy hiểm'], correctAnswer: 1 },
      { id: 42, question: 'Kháng cự thay đổi?', options: ['Bình thường', 'Cần hiểu và xử lý', 'Bỏ qua', 'Trừng phạt'], correctAnswer: 1 },
      { id: 43, question: 'Truyền thông thay đổi?', options: ['Không cần', 'Rất quan trọng', 'Tùy', 'Lãng phí'], correctAnswer: 1 },
      { id: 44, question: 'Đào tạo khi thay đổi?', options: ['Không cần', 'Cần thiết', 'Tùy', 'Tốn kém'], correctAnswer: 1 },
      { id: 45, question: 'Đánh giá sau thay đổi?', options: ['Không cần', 'Quan trọng', 'Tùy', 'Lãng phí'], correctAnswer: 1 }
    ]
  }
];

export const mockTestAttempts: TestAttempt[] = [
  ];

// Mock Course Modules
export const mockCourseModules: CourseModule[] = [
  // Course 1 Modules
  { id: 1, courseId: 1, title: 'Module 1: Giới thiệu An ninh thông tin', description: 'Tìm hiểu khái niệm và tầm quan trọng', order: 1, documents: [mockDocuments[0]], videos: [mockVideos[0], mockVideos[1]], quizzes: [mockQuizzes[0]], completed: true },
  { id: 2, courseId: 1, title: 'Module 2: Mối đe dọa và Lỗ hổng', description: 'Nhận biết các mối đe dọa phổ biến', order: 2, documents: [mockDocuments[1]], videos: [mockVideos[1]], quizzes: [], completed: false },
  { id: 3, courseId: 1, title: 'Module 3: Bảo mật mạng', description: 'Các biện pháp bảo vệ mạng', order: 3, documents: [mockDocuments[2]], videos: [mockVideos[2]], quizzes: [], completed: false },
  // Course 2 Modules
  { id: 4, courseId: 2, title: 'Module 1: Đạo đức công ty', description: 'Hiểu về quy tắc đạo đức', order: 1, documents: [mockDocuments[3]], videos: [mockVideos[3], mockVideos[4]], quizzes: [], completed: false },
  { id: 5, courseId: 2, title: 'Module 2: Tuân thủ pháp luật', description: 'Các quy định pháp luật', order: 2, documents: [mockDocuments[4]], videos: [mockVideos[4]], quizzes: [], completed: false },
  { id: 6, courseId: 2, title: 'Module 3: Hành vi chuyên nghiệp', description: 'Chuẩn mực hành vi', order: 3, documents: [mockDocuments[5]], videos: [mockVideos[5]], quizzes: [], completed: false },
  // Course 3 Modules
  { id: 7, courseId: 3, title: 'Module 1: Kỹ năng lãnh đạo cơ bản', description: 'Các kỹ năng cần thiết', order: 1, documents: [mockDocuments[6]], videos: [mockVideos[6], mockVideos[7]], quizzes: [], completed: false },
  { id: 8, courseId: 3, title: 'Module 2: Quản lý nhóm', description: 'Kỹ năng quản lý nhóm', order: 2, documents: [mockDocuments[7]], videos: [mockVideos[7]], quizzes: [], completed: false },
  { id: 9, courseId: 3, title: 'Module 3: Ra quyết định chiến lược', description: 'Kỹ năng ra quyết định', order: 3, documents: [mockDocuments[8]], videos: [mockVideos[8]], quizzes: [], completed: false }
];

// Mock User Module Progress
export const mockUserModuleProgress: UserModuleProgress[] = [
  // Course 1 - Information Security (userId: 1)
  {
    id: 1,
    userId: 1,
    moduleId: 1,
    moduleTitle: 'Module 1: Giới thiệu An ninh thông tin',
    courseId: 1,
    courseName: 'An ninh thông tin',
    enrollmentId: 1,
    isCompleted: true,
    completedAt: '2026-02-10T14:30:00',
    progressPercentage: 100,
    timeSpentMinutes: 45,
    lastAccessedAt: '2026-02-10T14:30:00',
    createdAt: '2026-02-01T09:00:00'
  },
  {
    id: 2,
    userId: 1,
    moduleId: 2,
    moduleTitle: 'Module 2: Mối đe dọa và Lỗ hổng',
    courseId: 1,
    courseName: 'An ninh thông tin',
    enrollmentId: 1,
    isCompleted: false,
    completedAt: null,
    progressPercentage: 65,
    timeSpentMinutes: 30,
    lastAccessedAt: '2026-03-05T10:15:00',
    createdAt: '2026-02-05T09:00:00'
  },
  {
    id: 3,
    userId: 1,
    moduleId: 3,
    moduleTitle: 'Module 3: Bảo mật mạng',
    courseId: 1,
    courseName: 'An ninh thông tin',
    enrollmentId: 1,
    isCompleted: false,
    completedAt: null,
    progressPercentage: 0,
    timeSpentMinutes: 0,
    lastAccessedAt: null,
    createdAt: '2026-02-10T09:00:00'
  },
  // Course 2 - Workplace Ethics (userId: 1)
  {
    id: 4,
    userId: 1,
    moduleId: 4,
    moduleTitle: 'Module 1: Đạo đức công ty',
    courseId: 2,
    courseName: 'Đạo đức nghề nghiệp',
    enrollmentId: 2,
    isCompleted: true,
    completedAt: '2026-02-20T16:00:00',
    progressPercentage: 100,
    timeSpentMinutes: 35,
    lastAccessedAt: '2026-02-20T16:00:00',
    createdAt: '2026-02-15T09:00:00'
  },
  {
    id: 5,
    userId: 1,
    moduleId: 5,
    moduleTitle: 'Module 2: Tuân thủ pháp luật',
    courseId: 2,
    courseName: 'Đạo đức nghề nghiệp',
    enrollmentId: 2,
    isCompleted: false,
    completedAt: null,
    progressPercentage: 40,
    timeSpentMinutes: 20,
    lastAccessedAt: '2026-03-01T11:30:00',
    createdAt: '2026-02-18T09:00:00'
  },
  {
    id: 6,
    userId: 1,
    moduleId: 6,
    moduleTitle: 'Module 3: Hành vi chuyên nghiệp',
    courseId: 2,
    courseName: 'Đạo đức nghề nghiệp',
    enrollmentId: 2,
    isCompleted: false,
    completedAt: null,
    progressPercentage: 0,
    timeSpentMinutes: 0,
    lastAccessedAt: null,
    createdAt: '2026-02-22T09:00:00'
  },
  // Course 3 - Leadership (userId: 1)
  {
    id: 7,
    userId: 1,
    moduleId: 7,
    moduleTitle: 'Module 1: Kỹ năng lãnh đạo cơ bản',
    courseId: 3,
    courseName: 'Kỹ năng lãnh đạo',
    enrollmentId: 3,
    isCompleted: false,
    completedAt: null,
    progressPercentage: 80,
    timeSpentMinutes: 50,
    lastAccessedAt: '2026-03-08T09:00:00',
    createdAt: '2026-03-01T09:00:00'
  },
  {
    id: 8,
    userId: 1,
    moduleId: 8,
    moduleTitle: 'Module 2: Quản lý nhóm',
    courseId: 3,
    courseName: 'Kỹ năng lãnh đạo',
    enrollmentId: 3,
    isCompleted: false,
    completedAt: null,
    progressPercentage: 20,
    timeSpentMinutes: 15,
    lastAccessedAt: '2026-03-07T14:00:00',
    createdAt: '2026-03-05T09:00:00'
  },
  {
    id: 9,
    userId: 1,
    moduleId: 9,
    moduleTitle: 'Module 3: Ra quyết định chiến lược',
    courseId: 3,
    courseName: 'Kỹ năng lãnh đạo',
    enrollmentId: 3,
    isCompleted: false,
    completedAt: null,
    progressPercentage: 0,
    timeSpentMinutes: 0,
    lastAccessedAt: null,
    createdAt: '2026-03-08T09:00:00'
  }
];

export const mockFinalExam: FinalExam = {
  id: 1,
  courseId: 1,
  title: 'Bài thi cuối khóa: An ninh thông tin',
  description: 'Bài thi tổng hợp toàn bộ kiến thức',
  passingScore: 75,
  duration: 60,
  unlocked: false,
  questions: [...mockTests[0].questions, ...mockTests[1].questions, ...mockTests[2].questions]
};
