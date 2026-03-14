package com.itms.repository;

import com.itms.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {
    
    @Query("SELECT a FROM Attendance a JOIN FETCH a.enrollment e JOIN FETCH e.course c WHERE e.user.id = :userId AND c.id = :courseId")
    List<Attendance> findByUserIdAndCourseId(@Param("userId") Integer userId, @Param("courseId") Integer courseId);

    @Query(value = """
        SELECT DISTINCT activity_date
        FROM (
            SELECT CAST(s.date AS DATE) AS activity_date
            FROM Attendance a
            JOIN Enrollment e ON a.enrollment_id = e.id
            JOIN Session s ON e.course_id = s.course_id
            WHERE e.user_id = :userId
            AND a.attended = 1

            UNION

            SELECT CAST(qa.started_at AS DATE)
            FROM QuizAttempt qa
            WHERE qa.user_id = :userId
            AND qa.status IN ('SUBMITTED','GRADED')
        ) AS activity
        ORDER BY activity_date DESC
    """, nativeQuery = true)
    List<LocalDate> findLearningDates(@Param("userId") Integer userId);

    /**
     * Count sessions attended today for the given employee.
     */
    @Query(value = """
        SELECT COUNT(*)
        FROM Attendance a
        JOIN Enrollment e ON a.enrollment_id = e.id
        JOIN Session s ON e.course_id = s.course_id
        WHERE e.user_id = :userId
        AND a.attended = 1
        AND CAST(s.date AS DATE) = CAST(GETDATE() AS DATE)
    """, nativeQuery = true)
    Integer countSessionsAttendedToday(@Param("userId") Integer userId);

    /**
     * Total study minutes from sessions attended today.
     */
    @Query(value = """
        SELECT COALESCE(SUM(a.duration_minutes), 0)
        FROM Attendance a
        JOIN Enrollment e ON a.enrollment_id = e.id
        JOIN Session s ON e.course_id = s.course_id
        WHERE e.user_id = :userId
        AND a.attended = 1
        AND CAST(s.date AS DATE) = CAST(GETDATE() AS DATE)
    """, nativeQuery = true)
    Integer sumStudyMinutesToday(@Param("userId") Integer userId);

    /**
     * Recent session attendance activities for the employee, most recent first.
     */
    @Query(value = """
        SELECT TOP 10
            a.id           AS id,
            'SESSION'      AS type,
            s.session_name AS title,
            c.name         AS course,
            s.date         AS time
        FROM Attendance a
        JOIN Enrollment e ON a.enrollment_id = e.id
        JOIN Session s ON e.course_id = s.course_id
        JOIN Course c ON s.course_id = c.id
        WHERE e.user_id = :userId
        AND a.attended = 1
        ORDER BY s.date DESC
    """, nativeQuery = true)
    List<Object[]> findRecentSessionActivities(@Param("userId") Integer userId);

    /**
     * Find attendance record by enrollment ID
     */
    Optional<Attendance> findByEnrollmentId(Integer enrollmentId);

    /**
     * Find all enrollments for a session (for trainer to mark attendance)
     */
    @Query("""
        SELECT a FROM Attendance a
        JOIN a.enrollment e
        JOIN e.user u
        WHERE e.session.id = :sessionId
        ORDER BY u.fullName ASC
    """)
    List<Attendance> findBySessionId(@Param("sessionId") Long sessionId);

    /**
     * Count attended students in a session
     */
    @Query("""
        SELECT COUNT(a) FROM Attendance a
        WHERE a.enrollment.session.id = :sessionId AND a.attended = true
    """)
    Integer countAttendedBySessionId(@Param("sessionId") Long sessionId);

    /**
     * Count absent students in a session
     */
    @Query("""
        SELECT COUNT(a) FROM Attendance a
        WHERE a.enrollment.session.id = :sessionId AND a.attended = false
    """)
    Integer countAbsentBySessionId(@Param("sessionId") Long sessionId);
}
