import type { SessionAttendance, AttendanceSummary } from '../api/attendance.api';

// Mock Session Attendance Data
export const mockSessionAttendance: SessionAttendance[] = [
  // Course 1 - Information Security
  {
    sessionId: 1,
    sessionName: 'Session 1: Introduction to Information Security',
    sessionNumber: 1,
    date: '2026-03-01',
    timeStart: '09:00',
    timeEnd: '11:00',
    location: 'Room 101',
    status: 'COMPLETED',
    attended: true,
    markedComplete: true,
    markedBy: 'Trainer John',
    completionStatus: 'COMPLETED',
    totalSessions: 3,
    attendedSessions: 1,
    remainingSessions: 2
  },
  {
    sessionId: 2,
    sessionName: 'Session 2: Threats and Vulnerabilities',
    sessionNumber: 2,
    date: '2026-03-08',
    timeStart: '09:00',
    timeEnd: '11:00',
    location: 'Room 101',
    status: 'COMPLETED',
    attended: true,
    markedComplete: true,
    markedBy: 'Trainer John',
    completionStatus: 'COMPLETED',
    totalSessions: 3,
    attendedSessions: 2,
    remainingSessions: 1
  },
  {
    sessionId: 3,
    sessionName: 'Session 3: Network Security',
    sessionNumber: 3,
    date: '2026-03-15',
    timeStart: '09:00',
    timeEnd: '11:00',
    location: 'Room 101',
    status: 'SCHEDULED',
    attended: false,
    markedComplete: false,
    markedBy: null,
    completionStatus: 'NOT_MARKED',
    totalSessions: 3,
    attendedSessions: 2,
    remainingSessions: 1
  },
  // Course 2 - Workplace Ethics
  {
    sessionId: 4,
    sessionName: 'Session 1: Company Ethics',
    sessionNumber: 1,
    date: '2026-03-02',
    timeStart: '14:00',
    timeEnd: '16:00',
    location: 'Room 202',
    status: 'COMPLETED',
    attended: true,
    markedComplete: true,
    markedBy: 'Trainer Mary',
    completionStatus: 'COMPLETED',
    totalSessions: 3,
    attendedSessions: 1,
    remainingSessions: 2
  },
  {
    sessionId: 5,
    sessionName: 'Session 2: Legal Compliance',
    sessionNumber: 2,
    date: '2026-03-09',
    timeStart: '14:00',
    timeEnd: '16:00',
    location: 'Room 202',
    status: 'COMPLETED',
    attended: false,
    markedComplete: false,
    markedBy: null,
    completionStatus: 'NOT_MARKED',
    totalSessions: 3,
    attendedSessions: 1,
    remainingSessions: 2
  },
  {
    sessionId: 6,
    sessionName: 'Session 3: Professional Behavior',
    sessionNumber: 3,
    date: '2026-03-16',
    timeStart: '14:00',
    timeEnd: '16:00',
    location: 'Room 202',
    status: 'SCHEDULED',
    attended: false,
    markedComplete: false,
    markedBy: null,
    completionStatus: 'NOT_MARKED',
    totalSessions: 3,
    attendedSessions: 1,
    remainingSessions: 2
  },
  // Course 3 - Leadership
  {
    sessionId: 7,
    sessionName: 'Session 1: Basic Leadership Skills',
    sessionNumber: 1,
    date: '2026-03-03',
    timeStart: '10:00',
    timeEnd: '12:00',
    location: 'Room 303',
    status: 'COMPLETED',
    attended: true,
    markedComplete: true,
    markedBy: 'Trainer David',
    completionStatus: 'COMPLETED',
    totalSessions: 3,
    attendedSessions: 1,
    remainingSessions: 2
  },
  {
    sessionId: 8,
    sessionName: 'Session 2: Team Management',
    sessionNumber: 2,
    date: '2026-03-10',
    timeStart: '10:00',
    timeEnd: '12:00',
    location: 'Room 303',
    status: 'COMPLETED',
    attended: false,
    markedComplete: false,
    markedBy: null,
    completionStatus: 'NOT_MARKED',
    totalSessions: 3,
    attendedSessions: 1,
    remainingSessions: 2
  },
  {
    sessionId: 9,
    sessionName: 'Session 3: Strategic Decision Making',
    sessionNumber: 3,
    date: '2026-03-17',
    timeStart: '10:00',
    timeEnd: '12:00',
    location: 'Room 303',
    status: 'SCHEDULED',
    attended: false,
    markedComplete: false,
    markedBy: null,
    completionStatus: 'NOT_MARKED',
    totalSessions: 3,
    attendedSessions: 1,
    remainingSessions: 2
  }
];

// Mock Attendance Summary
export const mockAttendanceSummary: AttendanceSummary[] = [
  { totalSessions: 3, attendedSessions: 2, remainingSessions: 1 }, // Course 1
  { totalSessions: 3, attendedSessions: 1, remainingSessions: 2 }, // Course 2
  { totalSessions: 3, attendedSessions: 1, remainingSessions: 2 }, // Course 3
];

// Helper function to get mock attendance for a course
export const getMockSessionAttendance = (courseId: number): SessionAttendance[] => {
  return mockSessionAttendance.filter(s => {
    // Map courseId to session IDs
    const courseSessionRanges: Record<number, [number, number]> = {
      1: [1, 3],
      2: [4, 6],
      3: [7, 9]
    };
    const [start, end] = courseSessionRanges[courseId] || [1, 0];
    return s.sessionId >= start && s.sessionId <= end;
  });
};

// Helper function to get mock attendance summary for a course
export const getMockAttendanceSummary = (courseId: number): AttendanceSummary | null => {
  const summaries: Record<number, AttendanceSummary> = {
    1: { totalSessions: 3, attendedSessions: 2, remainingSessions: 1 },
    2: { totalSessions: 3, attendedSessions: 1, remainingSessions: 2 },
    3: { totalSessions: 3, attendedSessions: 1, remainingSessions: 2 }
  };
  return summaries[courseId] || null;
};
