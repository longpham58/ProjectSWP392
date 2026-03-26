import axios from "../lib/axios";

/* =====================
   Types
===================== */

export interface Certificate {
  id: number;
  courseId: number;
  courseName: string;
  courseCategory: string;
  trainerName: string;
  certificateCode: string;
  studentName: string;
  completionDate: string;
  issueDate: string;
  score: number;
  grade: string;
  instructor: string;
  isValid: boolean;
}

export interface StudentCompletion {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  attendedSessions: number;
  totalSessions: number;
  attendanceRate: number;
  eligible: boolean;
  hasCertificate: boolean;
}

export interface CourseCompletion {
  courseId: number;
  courseCode: string;
  courseName: string;
  courseCategory: string;
  endDate: string;
  status: string;
  totalStudents: number;
  eligibleStudents: number;
  alreadyCertified: number;
  students: StudentCompletion[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

/* =====================
   API calls
===================== */

export const certificateApi = {

  // Employee: get own certificates
  getByUser: (userId: number) =>
    axios.get<ApiResponse<Certificate[]>>(`/certificates/user/${userId}`),

  // HR: get all ended courses with student completion info
  getCompletedCourses: () =>
    axios.get<ApiResponse<CourseCompletion[]>>(`/certificates/hr/completed-courses`),

  // HR: issue certificates to all eligible students of a course
  issueCertificates: (courseId: number) =>
    axios.post<ApiResponse<{ issued: number }>>(`/certificates/hr/issue/${courseId}`),
};