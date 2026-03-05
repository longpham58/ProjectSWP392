export interface Certificate {
  id: number;
  courseId: number;
  courseName: string;
  studentName: string;
  completionDate: string;
  score: number;
  instructor: string;
}

export const mockCertificates: Certificate[] = [
  {
    id: 1,
    courseId: 1,
    courseName: "Introduction to Information Security",
    studentName: "Nguyễn Văn A",
    completionDate: "2026-02-15",
    score: 95,
    instructor: "John Smith"
  },
  {
    id: 2,
    courseId: 2,
    courseName: "Workplace Ethics & Compliance",
    studentName: "Nguyễn Văn A",
    completionDate: "2026-02-20",
    score: 88,
    instructor: "Sarah Johnson"
  },
  {
    id: 3,
    courseId: 1,
    courseName: "Introduction to Information Security",
    studentName: "Nguyễn Văn A",
    completionDate: "2026-01-28",
    score: 92,
    instructor: "John Smith"
  }
];
