package com.itms.repository;

import com.itms.entity.CourseSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseScheduleRepository extends JpaRepository<CourseSchedule, Integer> {
    
    /**
     * Find all schedules for a specific course
     */
    List<CourseSchedule> findByCourseId(Integer courseId);
    
    /**
     * Find all schedules for a specific classroom
     */
    List<CourseSchedule> findByClassRoomId(Integer classRoomId);
    
    /**
     * Find all schedules assigned to a specific trainer
     */
    List<CourseSchedule> findByTrainerId(Integer trainerId);
    
    /**
     * Find schedules by day of week
     */
    List<CourseSchedule> findByDayOfWeek(String dayOfWeek);
    
    /**
     * Find schedules for a classroom on a specific day
     */
    @Query("SELECT cs FROM CourseSchedule cs WHERE cs.classRoom.id = :classRoomId AND cs.dayOfWeek = :dayOfWeek")
    List<CourseSchedule> findByClassRoomIdAndDayOfWeek(
        @Param("classRoomId") Integer classRoomId,
        @Param("dayOfWeek") String dayOfWeek
    );
}
