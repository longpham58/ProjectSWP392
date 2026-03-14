package com.itms.repository;

import com.itms.entity.ClassRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
<<<<<<< HEAD

@Repository
public interface ClassRoomRepository extends JpaRepository<ClassRoom, Integer> {

    /**
     * Find all classes for a course
     */
    List<ClassRoom> findByCourseId(Integer courseId);

    /**
     * Find class by class code
     */
    ClassRoom findByClassCode(String classCode);

    /**
     * Find classes by trainer
     */
    List<ClassRoom> findByTrainerId(Integer trainerId);

    /**
     * Find active classes for a course
     */
    @Query("SELECT cr FROM ClassRoom cr WHERE cr.course.id = :courseId AND cr.status = 'ACTIVE'")
    List<ClassRoom> findActiveByCourseId(@Param("courseId") Integer courseId);

    /**
     * Find active classes
     */
    @Query("SELECT cr FROM ClassRoom cr WHERE cr.status = 'ACTIVE'")
    List<ClassRoom> findAllActive();

    /**
     * Find classes by status
     */
    List<ClassRoom> findByStatus(String status);

    /**
     * Find classes that a user is a member of
     */
    @Query("SELECT cr FROM ClassRoom cr JOIN ClassMember cm ON cm.classRoom = cr WHERE cm.user.id = :userId AND cm.status = 'ACTIVE'")
    List<ClassRoom> findByUserId(@Param("userId") Integer userId);
=======
import java.util.Optional;

@Repository
public interface ClassRoomRepository extends JpaRepository<ClassRoom, Integer> {
    
    /**
     * Find classroom by class code
     */
    Optional<ClassRoom> findByClassCode(String classCode);
    
    /**
     * Find all classrooms for a specific course
     */
    List<ClassRoom> findByCourseId(Integer courseId);
    
    /**
     * Find all classrooms assigned to a specific trainer
     */
    List<ClassRoom> findByTrainerId(Integer trainerId);
    
    /**
     * Find all active classrooms
     */
    @Query("SELECT c FROM ClassRoom c WHERE c.status = 'ACTIVE'")
    List<ClassRoom> findAllActive();
>>>>>>> origin/main
}
