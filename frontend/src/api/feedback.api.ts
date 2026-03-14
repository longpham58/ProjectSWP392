import axios from "../lib/axios";

export interface FeedbackDto {
  id?: number;
  courseId: number;
  userId: number;
  courseRating: number;
  trainerRating: number;
  contentRating: number;
  overallRating: number;
  comments: string;
  suggestions: string;
  wouldRecommend: boolean;
  isAnonymous: boolean;
  userName?: string;
  userEmail?: string;
  submittedAt?: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}

export const feedbackApi = {
  /**
   * Get all feedback for a course
   */
  getCourseFeedback: (courseId: number) =>
    axios.get<ApiResponse<FeedbackDto[]>>(`/feedback/course/${courseId}`),

  /**
   * Get user's feedback for a course
   */
  getUserFeedback: (userId: number, courseId: number) =>
    axios.get<ApiResponse<FeedbackDto>>(`/feedback/user/${userId}/course/${courseId}`),

  /**
   * Check if user has submitted feedback
   */
  hasUserSubmittedFeedback: (userId: number, courseId: number) =>
    axios.get<ApiResponse<boolean>>(`/feedback/user/${userId}/course/${courseId}/exists`),

  /**
   * Submit feedback for a course
   */
  submitFeedback: (feedback: FeedbackDto) =>
    axios.post<ApiResponse<FeedbackDto>>("/feedback/submit", feedback),
};
