package com.itms.repository;

import com.itms.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

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
    List<LocalDate> findLearningDates(Integer userId);
}
