package com.itms.repository;

import com.itms.entity.Enrollment;
import com.itms.common.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    List<Enrollment> findByUserId(int userId);

    /**
<<<<<<< Updated upstream
=======
     * Find enrollment by user and session
     */
    @Query("SELECT e FROM Enrollment e WHERE e.user.id = :userId AND e.session.id = :sessionId")
    Optional<Enrollment> findByUserIdAndSessionId(@Param("userId") int userId, @Param("sessionId") int sessionId);

    /**
     * Find enrollment by user and course (through session)
     */
    @Query("SELECT e FROM Enrollment e WHERE e.user.id = :userId AND e.session.course.id = :courseId")
    Optional<Enrollment> findByUserIdAndCourseId(@Param("userId") int userId, @Param("courseId") int courseId);

    /**
     * Find all enrollments for a session
     */
    List<Enrollment> findBySessionId(int sessionId);

    /**
     * Find enrollment by user and session (alternative method name)
     */
    default Optional<Enrollment> findByUserAndSession(int userId, int sessionId) {
        return findByUserIdAndSessionId(userId, sessionId);
    }

    /**
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
        JOIN Session s ON s.course_id = c.id
        JOIN Enrollment e ON e.session_id = s.id
=======
        JOIN Enrollment e ON e.session_id IN (SELECT id FROM Session WHERE course_id = c.id)
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
}
=======

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
     * Count enrollments by user and status.
     */
    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.user.id = :userId AND e.status = :status")
    Integer countEnrollmentsByUserIdAndStatus(@Param("userId") Integer userId, @Param("status") String status);
}
>>>>>>> Stashed changes
