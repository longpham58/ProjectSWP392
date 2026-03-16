package com.itms.repository;

import com.itms.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    
    @Query("SELECT a FROM Attendance a JOIN FETCH a.enrollment e JOIN FETCH e.session s JOIN FETCH s.course c WHERE e.user.id = :userId AND c.id = :courseId")
    List<Attendance> findByUserIdAndCourseId(@Param("userId") Integer userId, @Param("courseId") Integer courseId);

    /**
     * Find attendance by enrollment
     */
    Optional<Attendance> findByEnrollmentId(Integer enrollmentId);

    @Query(value = """
        SELECT DISTINCT activity_date
        FROM (
            SELECT CAST(s.date AS DATE) AS activity_date
            FROM Attendance a
            JOIN Enrollment e ON a.enrollment_id = e.id
            JOIN Session s ON e.session_id = s.id
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
        JOIN Session s ON e.session_id = s.id
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
        JOIN Session s ON e.session_id = s.id
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
            c.code         AS title,
            c.name         AS course,
            s.date         AS time
        FROM Attendance a
        JOIN Enrollment e ON a.enrollment_id = e.id
        JOIN Session s ON e.session_id = s.id
        JOIN Course c ON s.course_id = c.id
        WHERE e.user_id = :userId
        AND a.attended = 1
        ORDER BY s.date DESC
    """, nativeQuery = true)
    List<Object[]> findRecentSessionActivities(@Param("userId") Integer userId);

    /**
     * Update attendance for a user and session
     */
    @Modifying
    @Transactional
    @Query(value = """
        UPDATE Attendance 
        SET attended = :attended, notes = :notes
        WHERE enrollment_id IN (
            SELECT id FROM Enrollment 
            WHERE user_id = :userId AND session_id = :sessionId
        )
    """, nativeQuery = true)
    void updateAttendanceForUserAndSession(
        @Param("userId") Integer userId, 
        @Param("sessionId") Integer sessionId, 
        @Param("attended") Boolean attended,
        @Param("notes") String notes
    );

    /**
     * Find attendance by enrollment id
     */
    Optional<Attendance> findByEnrollmentId(Integer enrollmentId);
}
