package com.itms.repository;

import com.itms.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Integer> {

    List<Enrollment> findByUserId(int userId);

    /**
     * Find enrollment by user and session
     */
    Enrollment findByUserIdAndSessionId(Integer userId, Integer sessionId);


    /**
     * Find enrollment by user and course
     */
    @Query("SELECT e FROM Enrollment e JOIN e.session s WHERE e.user.id = :userId AND s.course.id = :courseId")
    java.util.Optional<Enrollment> findByUserIdAndCourseId(@Param("userId") int userId, @Param("courseId") int courseId);
    /**
     * Count sessions scheduled for the employee today (from approved enrollments).
     */
    @Query(value = """
        SELECT COUNT(*)
        FROM Enrollment e
        JOIN Session s ON e.session_id = s.id
        WHERE e.user_id = :userId
        AND e.status IN ('APPROVED', 'COMPLETED')
        AND CAST(s.date AS DATE) = CAST(GETDATE() AS DATE)
    """, nativeQuery = true)
    Integer countScheduledSessionsToday(@Param("userId") Integer userId);

    /**
     * Total scheduled study minutes for the employee today (sum of session durations).
     */
    @Query(value = """
        SELECT COALESCE(SUM(DATEDIFF(MINUTE, s.time_start, s.time_end)), 0)
        FROM Enrollment e
        JOIN Session s ON e.session_id = s.id
        WHERE e.user_id = :userId
        AND e.status IN ('APPROVED', 'COMPLETED')
        AND CAST(s.date AS DATE) = CAST(GETDATE() AS DATE)
    """, nativeQuery = true)
    Integer sumScheduledMinutesToday(@Param("userId") Integer userId);

    /**
     * Count quizzes due today for the employee (active quizzes not yet passed).
     */
    @Query(value = """
        SELECT COUNT(*)
        FROM Quiz q
        JOIN Course c ON q.course_id = c.id
        JOIN Session s ON s.course_id = c.id
        JOIN Enrollment e ON e.session_id = s.id
        WHERE e.user_id = :userId
        AND e.status IN ('APPROVED', 'COMPLETED')
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
     * Recent course enrollment activities for the employee, most recent first.
     */
    @Query(value = """
        SELECT TOP 10
            e.id              AS id,
            'ENROLLMENT'      AS type,
            c.name            AS title,
            c.name            AS course,
            e.registered_at   AS time
        FROM Enrollment e
        JOIN Session s ON e.session_id = s.id
        JOIN Course c ON s.course_id = c.id
        WHERE e.user_id = :userId
        AND e.status IN ('APPROVED', 'COMPLETED')
        ORDER BY e.registered_at DESC
    """, nativeQuery = true)
    List<Object[]> findRecentEnrollmentActivities(@Param("userId") Integer userId);

    /**
     * Count total enrollments for a user.
     */
    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.user.id = :userId")
    Integer countEnrollmentsByUserId(@Param("userId") Integer userId);

    /**
     * Count completed enrollments for a user.
     */
    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.user.id = :userId AND e.status = 'COMPLETED'")
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
}