package com.itms.repository;

import com.itms.entity.CourseSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseScheduleRepository extends JpaRepository<CourseSchedule, Long> {
    
    List<CourseSchedule> findByClassRoomId(Long classId);
    
    List<CourseSchedule> findByCourseId(Integer courseId);
    
    List<CourseSchedule> findByTrainerId(Integer trainerId);
}
