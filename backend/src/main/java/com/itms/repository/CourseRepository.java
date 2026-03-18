package com.itms.repository;

import com.itms.entity.Course;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Integer> {

    Optional<Course> findByCode(String code);

    Optional<Course> findByCodeIgnoreCase(String code);

    /** Maximum course id (for identity reseed after delete). Returns null if no courses. */
    @Query("SELECT MAX(c.id) FROM Course c")
    Integer findMaxId();

    /**
     * Find all courses that a user is enrolled in via ClassMember
     * Path: Course -> ClassRoom (course_id) -> ClassMember (class_id, user_id)
     */
    @Query("SELECT DISTINCT c FROM Course c JOIN ClassRoom cl ON cl.course = c JOIN ClassMember cm ON cm.classRoom = cl WHERE cm.user.id = :userId AND cm.status = 'ACTIVE'")
    List<Course> findCoursesByUserId(@Param("userId") Integer userId);

    List<Course> findByTrainerId(Integer trainerId);
    
    /** Find courses by status */
    List<Course> findByStatus(com.itms.common.CourseStatus status);
    
    /** Count all courses */
    long count();
    
    /** Count courses by status */
    long countByStatus(com.itms.common.CourseStatus status);

    /** Get all courses with enrollment counts - for analytics */
    @Query("SELECT c.name, (SELECT COUNT(cm) FROM ClassMember cm JOIN cm.classRoom cl WHERE cl.course = c), " +
            "(SELECT COUNT(cm2) FROM ClassMember cm2 JOIN cm2.classRoom cl2 WHERE cl2.course = c AND cm2.status = 'COMPLETED') " +
            "FROM Course c")
    List<Object[]> getCourseCompletionStats();
    
    // ==================== Audit Log Methods ====================
    
    /**
     * Get recent course activities for admin audit logs
     */
    @Query("SELECT c FROM Course c ORDER BY c.createdAt DESC")
    List<Course> findRecentCourses(Pageable pageable);
}
