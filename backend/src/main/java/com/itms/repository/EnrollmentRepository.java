package com.itms.repository;

import com.itms.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Integer> {

    List<Enrollment> findByUserId(int userId);

    /**
     * Find enrollment by user and course
     */
    @Query("SELECT e FROM Enrollment e JOIN e.session s WHERE e.user.id = :userId AND s.course.id = :courseId")
    java.util.Optional<Enrollment> findByUserIdAndCourseId(@Param("userId") int userId, @Param("courseId") int courseId);
    /**
     * Count sessions scheduled for the employee today via ClassMember.
     * Path: ClassMember -> ClassRoom -> Session
     */
    @Query(value = """
        SELECT COUNT(DISTINCT s.id)
        FROM ClassMember cm
        JOIN ClassRoom cr ON cm.class_id = cr.id
        JOIN Session s ON s.class_id = cr.id
        WHERE cm.user_id = :userId
        AND cm.status = 'ACTIVE'
        AND CAST(s.date AS DATE) = CAST(GETDATE() AS DATE)
    """, nativeQuery = true)
    Integer countScheduledSessionsToday(@Param("userId") Integer userId);

    /**
     * Total scheduled study minutes for the employee today via ClassMember.
     * Path: ClassMember -> ClassRoom -> Session
     */
    @Query(value = """
        SELECT COALESCE(SUM(DATEDIFF(MINUTE, s.time_start, s.time_end)), 0)
        FROM ClassMember cm
        JOIN ClassRoom cr ON cm.class_id = cr.id
        JOIN Session s ON s.class_id = cr.id
        WHERE cm.user_id = :userId
        AND cm.status = 'ACTIVE'
        AND CAST(s.date AS DATE) = CAST(GETDATE() AS DATE)
    """, nativeQuery = true)
    Integer sumScheduledMinutesToday(@Param("userId") Integer userId);

    /**
     * Count quizzes due today for the employee via ClassMember.
     * Path: ClassMember -> ClassRoom -> Course -> Quiz
     */
    @Query(value = """
        SELECT COUNT(*)
        FROM Quiz q
        JOIN Course c ON q.course_id = c.id
        JOIN ClassRoom cr ON cr.course_id = c.id
        JOIN ClassMember cm ON cm.class_id = cr.id
        WHERE cm.user_id = :userId
        AND cm.status = 'ACTIVE'
        AND q.is_active = 1
        AND q.due_date IS NOT NULL
        AND CAST(q.due_date AS DATE) = CAST(GETDATE() AS DATE)
        AND NOT EXISTS (
            SELECT 1 FROM QuizAttempt qa
            WHERE qa.quiz_id = q.id AND qa.user_id = :userId AND qa.passed = 1
        )
    """, nativeQuery = true)
    Integer countQuizzesDueToday(@Param("userId") Integer userId);

    /**
     * Recent class enrollment activities for the employee via ClassMember, most recent first.
     */
    @Query(value = """
        SELECT TOP 10
            cm.id            AS id,
            'JOIN_CLASS'    AS type,
            cr.class_name   AS title,
            c.name          AS course,
            cm.joined_at    AS time
        FROM ClassMember cm
        JOIN ClassRoom cr ON cm.class_id = cr.id
        JOIN Course c ON cr.course_id = c.id
        WHERE cm.user_id = :userId
        ORDER BY cm.joined_at DESC
    """, nativeQuery = true)
    List<Object[]> findRecentEnrollmentActivities(@Param("userId") Integer userId);

    /**
     * Count total enrollments for a user via ClassMember.
     * Path: ClassMember -> ClassRoom -> Course
     */
    @Query("SELECT COUNT(DISTINCT cl.course) FROM ClassMember cm JOIN cm.classRoom cl WHERE cm.user.id = :userId AND cm.status = 'ACTIVE'")
    Integer countEnrollmentsByUserId(@Param("userId") Integer userId);

    /**
     * Count completed enrollments for a user via ClassMember.
     * Path: ClassMember -> ClassRoom -> Course
     */
    @Query("SELECT COUNT(DISTINCT cl.course) FROM ClassMember cm JOIN cm.classRoom cl WHERE cm.user.id = :userId AND cm.status = 'COMPLETED'")
    Integer countCompletedEnrollmentsByUserId(@Param("userId") Integer userId);

    /**
     * Find enrollments by course code
     */
    @Query("SELECT e FROM Enrollment e JOIN e.session s JOIN s.course c WHERE c.code = :courseCode")
    List<Enrollment> findBySessionCourseCode(@Param("courseCode") String courseCode);

    /**
     * Find enrollments by class code
     */
    @Query("SELECT e FROM Enrollment e JOIN e.session s JOIN s.classRoom cr WHERE cr.classCode = :classCode")
    List<Enrollment> findBySessionClassCode(@Param("classCode") String classCode);

    /**
     * Find enrollment by user id and session id
     */
    @Query("SELECT e FROM Enrollment e WHERE e.user.id = :userId AND e.session.id = :sessionId")
    Optional<Enrollment> findByUserIdAndSessionId(@Param("userId") Integer userId,
                                                   @Param("sessionId") Long sessionId);
}