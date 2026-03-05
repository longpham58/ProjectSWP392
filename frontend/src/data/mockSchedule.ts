export interface CourseSchedule {
  id: number;
  courseId: number;
  sessionNumber: number;
  title: string;
  date: string;
  time: string;
  slot: number; // 1 = 7-9, 2 = 9-11, 3 = 11-13, 4 = 13-15
  location: string;
  instructor: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
}

export const mockCourseSchedule: CourseSchedule[] = [
  // Thứ 2 - Slot 1 (7-9)
  {
    id: 1,
    courseId: 1,
    sessionNumber: 1,
    title: 'ITMS001-M01',
    date: '2026-03-02',
    time: '07:00 - 09:00',
    slot: 1,
    location: 'Phòng ban 1',
    instructor: 'John Smith',
    status: 'completed',
    dayOfWeek: 1,
  },
  // Thứ 2 - Slot 3 (11-13)
  {
    id: 2,
    courseId: 2,
    sessionNumber: 1,
    title: 'ITMS002-M01',
    date: '2026-03-02',
    time: '11:00 - 13:00',
    slot: 3,
    location: 'Phòng ban 2',
    instructor: 'Sarah Johnson',
    status: 'completed',
    dayOfWeek: 1,
  },
  // Thứ 3 - Slot 2 (9-11)
  {
    id: 3,
    courseId: 1,
    sessionNumber: 2,
    title: 'ITMS001-M02',
    date: '2026-03-03',
    time: '09:00 - 11:00',
    slot: 2,
    location: 'Phòng ban 1',
    instructor: 'John Smith',
    status: 'completed',
    dayOfWeek: 2,
  },
  // Thứ 4 - Slot 1 (7-9)
  {
    id: 4,
    courseId: 1,
    sessionNumber: 3,
    title: 'ITMS001-M03',
    date: '2026-03-04',
    time: '07:00 - 09:00',
    slot: 1,
    location: 'Phòng ban 1',
    instructor: 'John Smith',
    status: 'upcoming',
    dayOfWeek: 3,
  },
  // Thứ 4 - Slot 4 (13-15)
  {
    id: 5,
    courseId: 2,
    sessionNumber: 2,
    title: 'ITMS002-M02',
    date: '2026-03-04',
    time: '13:00 - 15:00',
    slot: 4,
    location: 'Phòng ban 2',
    instructor: 'Sarah Johnson',
    status: 'upcoming',
    dayOfWeek: 3,
  },
  // Thứ 5 - Slot 2 (9-11)
  {
    id: 6,
    courseId: 1,
    sessionNumber: 4,
    title: 'ITMS001-M04',
    date: '2026-03-05',
    time: '09:00 - 11:00',
    slot: 2,
    location: 'Phòng ban 1',
    instructor: 'John Smith',
    status: 'upcoming',
    dayOfWeek: 4,
  },
  // Thứ 6 - Slot 1 (7-9)
  {
    id: 7,
    courseId: 2,
    sessionNumber: 3,
    title: 'ITMS002-M03',
    date: '2026-03-06',
    time: '07:00 - 09:00',
    slot: 1,
    location: 'Phòng ban 2',
    instructor: 'Sarah Johnson',
    status: 'upcoming',
    dayOfWeek: 5,
  },
  // Thứ 6 - Slot 3 (11-13)
  {
    id: 8,
    courseId: 1,
    sessionNumber: 5,
    title: 'ITMS001-M05',
    date: '2026-03-06',
    time: '11:00 - 13:00',
    slot: 3,
    location: 'Phòng ban 1',
    instructor: 'John Smith',
    status: 'upcoming',
    dayOfWeek: 5,
  },
  // Thứ 7 - Slot 2 (9-11)
  {
    id: 9,
    courseId: 2,
    sessionNumber: 4,
    title: 'ITMS002-M04',
    date: '2026-03-07',
    time: '09:00 - 11:00',
    slot: 2,
    location: 'Phòng ban 2',
    instructor: 'Sarah Johnson',
    status: 'cancelled',
    dayOfWeek: 6,
  },
];
