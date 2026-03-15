import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8080/api';

export interface TrainerFeedbackDto {
  id: number;
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
  submittedAt: string;
}

export interface FeedbackReplyRequest {
  reply: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Get feedback for trainer's courses
 */
export const getTrainerFeedback = async (): Promise<TrainerFeedbackDto[]> => {
  const response = await axios.get<ApiResponse<TrainerFeedbackDto[]>>(
    `${API_BASE_URL}/trainer/feedback`
  );
  return response.data.data;
};

/**
 * Reply to feedback
 */
export const replyToFeedback = async (
  feedbackId: number,
  replyRequest: FeedbackReplyRequest
): Promise<void> => {
  await axios.post<ApiResponse<string>>(
    `${API_BASE_URL}/trainer/feedback/${feedbackId}/reply`,
    replyRequest
  );
};

// Export as trainerFeedbackApi object for easier importing
export const trainerFeedbackApi = {
  getTrainerFeedback,
  replyToFeedback
};