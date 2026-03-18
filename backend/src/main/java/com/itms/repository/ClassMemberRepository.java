package com.itms.repository;

import com.itms.entity.ClassMember;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassMemberRepository extends JpaRepository<ClassMember, Integer> {

    /**
     * Find all class members by user ID
     */
    List<ClassMember> findByUserId(Integer userId);

    /**
     * Find all class members by class ID
     */
    boolean existsByClassRoomIdAndUserId(Integer classRoomId, Integer userId);
    
    /**
     * Find all members in a class by class code
     */
    @Query("SELECT cm FROM ClassMember cm JOIN FETCH cm.user WHERE cm.classRoom.classCode = :classCode AND cm.status = 'ACTIVE'")
    List<ClassMember> findByClassRoomClassCode(@Param("classCode") String classCode);
    
    /**
     * Find class member by user ID and course ID (via class room)
     */
    @Query("SELECT cm FROM ClassMember cm JOIN FETCH cm.classRoom cr WHERE cm.user.id = :userId AND cr.course.id = :courseId AND cm.status = :status")
    Optional<ClassMember> findByUserIdAndClassRoomCourseIdAndStatus(@Param("userId") Integer userId, @Param("courseId") Integer courseId, @Param("status") String status);
    
    /**
     * Count students enrolled in a specific course (across all its classes)
     */
    @Query("SELECT COUNT(cm) FROM ClassMember cm JOIN cm.classRoom cr WHERE cr.course.id = :courseId AND cm.status = 'ACTIVE'")
    long countActiveStudentsByCourseId(@Param("courseId") Integer courseId);
    
    /**
     * Count active students in a specific class
     */
    long countByClassRoomIdAndStatus(Integer classRoomId, String status);
    
    // ==================== Audit Log Methods ====================
    
    /**
     * Get recent enrollment activities for admin audit logs
     */
    @Query("SELECT cm FROM ClassMember cm " +
           "JOIN FETCH cm.user u " +
           "JOIN FETCH cm.classRoom cr " +
           "JOIN FETCH cr.course c " +
           "ORDER BY cm.joinedAt DESC")
    List<ClassMember> findRecentEnrollments(Pageable pageable);
}