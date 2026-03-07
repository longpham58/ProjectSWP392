import { create } from "zustand";
import { coursesApi, Course } from "../api/courses.api";

interface CourseState {
  courses: Course[];
  loading: boolean;

  fetchMyCourses: () => Promise<void>;
}
export const useCourseStore = create<CourseState>((set) => ({
  courses: [],
  stats: null,
  loading: false,

  fetchMyCourses: async () => {
    set({ loading: true });

    const res = await coursesApi.getMyCourses();

    set({
      courses: res.data.data,
      loading: false
    });
  },

  
}));