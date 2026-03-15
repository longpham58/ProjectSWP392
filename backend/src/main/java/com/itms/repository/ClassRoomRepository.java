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
    @Query("SELECT c FROM ClassRoom c JOIN FETCH c.course WHERE c.classCode = :classCode")
    Optional<ClassRoom> findByClassCodeWithCourse(@Param("classCode") String classCode);
    
    /**
     * Find classroom by class code
     */
    Optional<ClassRoom> findByClassCode(String classCode);
    
    /**
     * Find all classrooms for a specific course
     */
    List<ClassRoom> findByCourseId(Integer courseId);
    
    /**
     * Find all classrooms assigned to a specific trainer (with course eagerly loaded)
     */
    @Query("SELECT c FROM ClassRoom c JOIN FETCH c.course WHERE c.trainer.id = :trainerId")
    List<ClassRoom> findByTrainerIdWithCourse(@Param("trainerId") Integer trainerId);

    /**
     * Find all classrooms assigned to a specific trainer
     */
    List<ClassRoom> findByTrainerId(Integer trainerId);
    
    /**
     * Find all active classrooms
     */
    @Query("SELECT c FROM ClassRoom c WHERE c.status = 'ACTIVE'")
    List<ClassRoom> findAllActive();
}
