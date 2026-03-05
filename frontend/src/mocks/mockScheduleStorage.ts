/**
 * In-memory mock storage for trainer schedules (HR schedule management).
 */

export interface TrainerScheduleItem {
  id: string;
  trainerUsername: string;
  courseCode: string;
  courseName: string;
  room: string;
  date: string;
  startTime: string;
  endTime: string;
  status?: string;
  color?: string;
}

const store: TrainerScheduleItem[] = [];
let nextId = 1;

function generateId(): string {
  return String(nextId++);
}

export function getAllTrainerSchedules(): TrainerScheduleItem[] {
  return [...store];
}

export function addTrainerSchedule(item: Omit<TrainerScheduleItem, 'id'>): TrainerScheduleItem {
  const id = generateId();
  const entry: TrainerScheduleItem = { ...item, id };
  store.push(entry);
  return entry;
}

export function updateTrainerSchedule(
  id: string,
  updates: Partial<Omit<TrainerScheduleItem, 'id'>>
): void {
  const idx = store.findIndex((s) => s.id === id);
  if (idx === -1) return;
  store[idx] = { ...store[idx], ...updates };
}

export function deleteTrainerSchedule(id: string): void {
  const idx = store.findIndex((s) => s.id === id);
  if (idx !== -1) store.splice(idx, 1);
}
