import { create } from 'zustand';
import { TrainerScheduleDto, getTrainerSchedule } from '../api/trainerSchedule.api';

interface TrainerScheduleState {
  schedule: TrainerScheduleDto[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchSchedule: () => Promise<void>;
  clearError: () => void;
}

export const useTrainerScheduleStore = create<TrainerScheduleState>((set, get) => ({
  schedule: [],
  loading: false,
  error: null,

  fetchSchedule: async () => {
    set({ loading: true, error: null });
    try {
      const schedule = await getTrainerSchedule();
      
      // Calculate slot for each session based on time
      const scheduleWithSlots = schedule.map(session => {
        const timeStart = session.timeStart;
        let slot = 1;
        
        if (timeStart) {
          const hour = parseInt(timeStart.split(':')[0]);
          if (hour >= 7 && hour < 9) slot = 1;
          else if (hour >= 9 && hour < 11) slot = 2;
          else if (hour >= 11 && hour < 13) slot = 3;
          else if (hour >= 13 && hour < 15) slot = 4;
          else if (hour >= 15 && hour < 17) slot = 5;
          else if (hour >= 17 && hour < 19) slot = 6;
        }
        
        return {
          ...session,
          slot,
          dayOfWeek: session.date ? new Date(session.date).getDay() : 0
        };
      });
      
      set({ schedule: scheduleWithSlots, loading: false });
    } catch (error) {
      console.error('Failed to fetch trainer schedule:', error);
      set({ 
        error: 'Không thể tải lịch giảng dạy. Vui lòng thử lại sau.', 
        loading: false 
      });
    }
  },

  clearError: () => set({ error: null })
}));