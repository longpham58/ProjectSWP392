import axios from "../lib/axios";

/* =====================
   Types
===================== */

export interface Certificate {
  id: number;
  courseId: number;
  courseName: string;
  studentName: string;
  completionDate: string;
  score: number;
  instructor: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}

/* =====================
   API calls
===================== */

export const certificateApi = {

  // Get certificates of a user
  getByUser: (userId: number) =>
    axios.get<ApiResponse<Certificate[]>>(`/certificates/user/${userId}`),

};