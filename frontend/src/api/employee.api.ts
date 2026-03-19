import axios from "../lib/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CourseSummary {
  id: number;
  title: string;
  category: string;
  durationHours: number;
  trainerName: string;
  enrolledStudents: number;
  progress: number;
  enrollmentStatus: string | null;
}

export interface LessonDto {
  id: number;
  title: string;
  durationMinutes: number;
  status: string;
  type: string;
  fileUrl: string;
  isDownloadable: boolean;
}

export interface ModuleDto {
  id: number;
  title: string;
  displayOrder: number;
  lessons: LessonDto[];
}

export interface CourseDetailResponse {
  id: number;
  title: string;
  summary: string;
  description: string;
  category: string;
  durationHours: number;
  trainerName: string;
  enrolledStudents: number;
  enrollmentStatus: string | null;
  progress: number;
  modules: ModuleDto[];
}

export interface EnrollmentResponse {
  id: number;
  userId: number;
  courseId: number;
  progress: number;
  status: string;
  enrolledAt: string;
}

export interface FeedbackDto {
  id: number;
  courseId: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CommentDto {
  id: number;
  courseId: number;
  userId: number;
  userName: string;
  content: string;
  parentId: number | null;
  likeCount: number;
  createdAt: string;
  replies: CommentDto[];
}

export interface CommentPageResponse {
  comments: CommentDto[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export interface NotificationDto {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  readStatus: boolean;
  createdAt: string;
}

export interface ScheduleDto {
  id: number;
  courseId: number;
  courseCode: string;
  courseName: string;
  sessionName: string;
  sessionNumber: number;
  date: string;
  timeStart: string;
  timeEnd: string;
  location: string;
  locationType: string;
  meetingLink: string;
  trainerName: string;
  status: string;
}

export interface QuizOptionDto {
  id: number;
  optionText: string;
  displayOrder: number;
  isCorrect: boolean | null;
}

export interface QuizQuestionDto {
  id: number;
  question: string;
  displayOrder: number;
  options: QuizOptionDto[];
}

export interface QuizDto {
  id: number;
  title: string;
  description: string;
  quizOrder: number;
  passingScore: number;
  timeLimitMinutes: number;
  maxAttempts: number;
  totalQuestions: number;
  isFinalExam: boolean;
  questions: QuizQuestionDto[];
  locked: boolean;
  passed: boolean;
  bestScore: number;
  attemptCount: number;
  exhausted: boolean;
  passedRegularCount: number;
  totalRegularCount: number;
}

export interface QuizResultDto {
  attemptId: number;
  quizId: number;
  quizTitle: string;
  score: number;
  passed: boolean;
  passingScore: number;
  submittedAt: string;
  answers: any[];
  courseCompleted: boolean;
  certificateCode: string;
}

export interface CertificateDto {
  id: number;
  courseId: number;
  courseName: string;
  courseCategory: string;
  trainerName: string;
  certificateCode: string;
  issueDate: string;
  grade: string;
  score: number;
  isValid: boolean;
}

// ─── API ──────────────────────────────────────────────────────────────────────

const BASE = "/employee";

export const employeeApi = {
  // Dashboard
  getDashboard: (userId: number) =>
    axios.get(`${BASE}/dashboard/${userId}`),

  // Courses
  browseCourses: (userId: number, keyword?: string, category?: string) =>
    axios.get<{ data: CourseSummary[] }>(`${BASE}/courses`, { params: { userId, keyword, category } }),

  getCourseDetail: (courseId: number, userId: number) =>
    axios.get<{ data: CourseDetailResponse }>(`${BASE}/courses/${courseId}`, { params: { userId } }),

  enroll: (courseId: number, userId: number) =>
    axios.post<{ data: EnrollmentResponse }>(`${BASE}/courses/${courseId}/enroll`, { userId }),

  cancelEnrollment: (courseId: number, userId: number) =>
    axios.put<{ data: EnrollmentResponse }>(`${BASE}/courses/${courseId}/cancel`, null, { params: { userId } }),

  getMyLearning: (userId: number) =>
    axios.get<{ data: CourseSummary[] }>(`${BASE}/my-learning/${userId}`),

  markLessonCompleted: (courseId: number, userId: number, lessonId: number) =>
    axios.put<{ data: EnrollmentResponse }>(`${BASE}/courses/${courseId}/lessons/complete`, { userId, lessonId }),

  // Feedback
  getFeedbacks: (courseId: number) =>
    axios.get<{ data: FeedbackDto[] }>(`${BASE}/courses/${courseId}/feedbacks`),

  upsertFeedback: (courseId: number, payload: { userId: number; rating: number; comment: string }) =>
    axios.post<{ data: FeedbackDto }>(`${BASE}/courses/${courseId}/feedbacks`, payload),

  deleteFeedback: (courseId: number, feedbackId: number, userId: number) =>
    axios.delete(`${BASE}/courses/${courseId}/feedbacks/${feedbackId}`, { params: { userId } }),

  // Comments
  getComments: (courseId: number, page: number, size: number) =>
    axios.get<{ data: CommentPageResponse }>(`${BASE}/courses/${courseId}/comments`, { params: { page, size } }),

  addComment: (courseId: number, payload: { userId: number; content: string; parentId?: number }) =>
    axios.post<{ data: CommentDto }>(`${BASE}/courses/${courseId}/comments`, payload),

  deleteComment: (commentId: number, userId: number) =>
    axios.delete(`${BASE}/comments/${commentId}`, { params: { userId } }),

  likeComment: (commentId: number, userId: number) =>
    axios.post<{ data: CommentDto }>(`${BASE}/comments/${commentId}/like`, null, { params: { userId } }),

  // Notifications
  getNotifications: (userId: number) =>
    axios.get<{ data: NotificationDto[] }>(`${BASE}/notifications/${userId}`),

  markNotificationRead: (notificationId: number, userId: number) =>
    axios.put<{ data: NotificationDto }>(`${BASE}/notifications/${notificationId}/read`, null, { params: { userId } }),

  deleteNotification: (notificationId: number, userId: number) =>
    axios.delete(`${BASE}/notifications/${notificationId}`, { params: { userId } }),

  // Schedule
  getSchedule: (userId: number) =>
    axios.get<{ data: ScheduleDto[] }>(`${BASE}/schedule/${userId}`),

  // Quiz
  getQuizzes: (courseId: number, userId: number) =>
    axios.get<{ data: QuizDto[] }>(`${BASE}/courses/${courseId}/quizzes`, { params: { userId } }),

  getQuiz: (courseId: number, quizId: number, userId: number) =>
    axios.get<{ data: QuizDto }>(`${BASE}/courses/${courseId}/quizzes/${quizId}`, { params: { userId } }),

  submitQuiz: (courseId: number, quizId: number, payload: { userId: number; answers: Record<number, number> }) =>
    axios.post<{ data: QuizResultDto }>(`${BASE}/courses/${courseId}/quizzes/${quizId}/submit`, payload),

  getAttemptResult: (attemptId: number, userId: number) =>
    axios.get<{ data: QuizResultDto }>(`${BASE}/quiz-attempts/${attemptId}`, { params: { userId } }),

  // Certificates
  getCertificates: (userId: number) =>
    axios.get<{ data: CertificateDto[] }>(`${BASE}/certificates/${userId}`),

  // Profile
  getProfile: (userId: number) =>
    axios.get(`${BASE}/profile/${userId}`),

  updateProfile: (userId: number, payload: { fullName: string; phone: string; avatarUrl?: string }) =>
    axios.put(`${BASE}/profile/${userId}`, payload),

  changePassword: (userId: number, payload: { oldPassword: string; newPassword: string }) =>
    axios.put(`${BASE}/profile/${userId}/change-password`, payload),
};
