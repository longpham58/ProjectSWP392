package com.itms.repository;

import com.itms.entity.ClassRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassRoomRepository extends JpaRepository<ClassRoom, Integer> {

    /**
     * Find classroom by class code (with course eagerly loaded)
     */
    @Query("SELECT c FROM ClassRoom c LEFT JOIN FETCH c.course WHERE c.classCode = :classCode")
    Optional<ClassRoom> findByClassCodeWithCourse(@Param("classCode") String classCode);

    /**
     * Find classroom by class code
     */
    Optional<ClassRoom> findByClassCode(String classCode);

    /**
     * Find all classrooms for a trainer
     */
    @Query("SELECT c FROM ClassRoom c LEFT JOIN FETCH c.course WHERE c.trainer.id = :trainerId")
    List<ClassRoom> findByTrainerIdWithCourse(@Param("trainerId") Integer trainerId);
    
    /**
     * Find all classrooms for a course
     */
    @Query("SELECT c FROM ClassRoom c WHERE c.course.id = :courseId")
    List<ClassRoom> findByCourseId(@Param("courseId") Integer courseId);
    
    /**
     * Count all class rooms
     */
    long count();
}
