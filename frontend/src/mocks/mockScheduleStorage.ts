import type { ScheduleEvent } from './mockTrainerData';

export type HrTrainerSchedule = {
  id: string;
  trainerUsername: string;
  courseCode: string;
  courseName: string;
  room: string;
  // 2..8 (2=Mon ... 8=Sun) to match trainer calendar
  day: number;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  date?: string; // YYYY-MM-DD (optional, for HR view)
  status?: 'Scheduled' | 'Locked' | 'Completed' | 'Cancel';
  color?: string;
};

const STORAGE_KEY = 'itms_mock_trainer_schedules_v1';
export const SCHEDULES_UPDATED_EVENT = 'itms:schedulesUpdated';

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function computeDayFromDate(date: string): number {
  // JS: 0=Sun..6=Sat => map to 2..8 (Mon..Sun)
  const d = new Date(date);
  const jsDay = d.getDay();
  return jsDay === 0 ? 8 : jsDay + 1;
}

function seedIfMissing(existing: HrTrainerSchedule[] | null): HrTrainerSchedule[] {
  // Only seed when storage key is missing/uninitialized.
  // If user deleted all schedules and storage contains [], keep it empty.
  if (existing) return existing;

  // Seed a few schedules for trainer001 so UI has data immediately.
  const seeded: HrTrainerSchedule[] = [
    {
      id: 'seed-1',
      trainerUsername: 'trainer001',
      courseCode: 'PYTHON-001',
      courseName: 'Python cơ bản',
      room: 'Phòng A1',
      day: 2,
      startTime: '08:00',
      endTime: '10:00',
      status: 'Scheduled',
      color: '#60D5F2',
    },
    {
      id: 'seed-2',
      trainerUsername: 'trainer001',
      courseCode: 'JAVA-002',
      courseName: 'Java nâng cao',
      room: 'Phòng B2',
      day: 3,
      startTime: '13:00',
      endTime: '15:00',
      status: 'Scheduled',
      color: '#7FE5B8',
    },
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

export function getAllTrainerSchedules(): HrTrainerSchedule[] {
  const parsed = safeParse<HrTrainerSchedule[]>(localStorage.getItem(STORAGE_KEY));
  return seedIfMissing(parsed);
}

export function addTrainerSchedule(input: Omit<HrTrainerSchedule, 'id' | 'day'> & { id?: string; day?: number }): HrTrainerSchedule {
  const all = getAllTrainerSchedules();
  const id = input.id ?? `sch-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const day =
    typeof input.day === 'number'
      ? input.day
      : input.date
        ? computeDayFromDate(input.date)
        : 2;

  const schedule: HrTrainerSchedule = {
    id,
    trainerUsername: input.trainerUsername,
    courseCode: input.courseCode,
    courseName: input.courseName,
    room: input.room,
    day,
    startTime: input.startTime,
    endTime: input.endTime,
    date: input.date,
    status: input.status ?? 'Scheduled',
    color: input.color,
  };

  const next = [schedule, ...all];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(SCHEDULES_UPDATED_EVENT));
  return schedule;
}

export function updateTrainerSchedule(
  id: string,
  patch: Partial<Omit<HrTrainerSchedule, 'id' | 'day'>> & { day?: number }
): HrTrainerSchedule | null {
  const all = getAllTrainerSchedules();
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) return null;

  const current = all[idx];
  const nextDay =
    typeof patch.day === 'number'
      ? patch.day
      : patch.date
        ? computeDayFromDate(patch.date)
        : current.day;

  const updated: HrTrainerSchedule = {
    ...current,
    ...patch,
    day: nextDay,
    id: current.id,
  };

  const next = [...all];
  next[idx] = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(SCHEDULES_UPDATED_EVENT));
  return updated;
}

export function deleteTrainerSchedule(id: string): boolean {
  const all = getAllTrainerSchedules();
  const next = all.filter((s) => s.id !== id);
  if (next.length === all.length) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(SCHEDULES_UPDATED_EVENT));
  return true;
}

export function getTrainerScheduleEvents(trainerUsername: string): ScheduleEvent[] {
  if (!trainerUsername) return [];

  const schedules = getAllTrainerSchedules().filter((s) => s.trainerUsername === trainerUsername);
  return schedules.map((s) => ({
    id: s.id,
    courseCode: s.courseCode,
    courseName: s.courseName,
    room: s.room,
    day: s.day,
    startTime: s.startTime,
    endTime: s.endTime,
    color: s.color,
  }));
}

