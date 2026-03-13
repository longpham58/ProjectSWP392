package com.itms.repository;

import com.itms.dto.SessionAttendanceDto;
import com.itms.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {

    /**
     * Find all sessions for a course, ordered by date and session number
     */
    @Query("SELECT s FROM Session s WHERE s.course.id = :courseId ORDER BY s.date ASC")
    List<Session> findByCourseIdOrderByDateAsc(@Param("courseId") Integer courseId);

    /**
     * Find all sessions for a course with a specific status
     */
    @Query("SELECT s FROM Session s WHERE s.course.id = :courseId AND s.status = :status ORDER BY s.date ASC")
    List<Session> findByCourseIdAndStatus(@Param("courseId") Integer courseId, com.itms.common.SessionStatus status);

    /**
     * Find all sessions for courses taught by a trainer
     */
    @Query("SELECT s FROM Session s WHERE s.course.trainer.id = :trainerId ORDER BY s.date ASC, s.timeStart ASC")
    List<Session> findByTrainerId(@Param("trainerId") Integer trainerId);

    /**
     * Get session number from VIEW for a specific session
     */
    @Query(value = "SELECT session_number FROM V_Session WHERE id = :sessionId", nativeQuery = true)
    Optional<Integer> getSessionNumber(@Param("sessionId") Long sessionId);

    /**
     * Get session attendance for a user in a course - single query with JOINs
     */
    @Query(value = """
        SELECT new com.itms.dto.SessionAttendanceDto(
            s.id,
            CAST(v.session_number AS INTEGER),
            s.date,
            s.time_start,
            s.time_end,
            s.location,
            s.status,
            a.attended,
            a.completion_status,
            u.full_name
        )
        FROM Session s
        LEFT JOIN V_Session v ON s.id = v.id
        LEFT JOIN Enrollment e ON e.session_id = s.id AND e.user_id = :userId
        LEFT JOIN Attendance a ON a.enrollment_id = e.id
        LEFT JOIN [User] u ON u.id = a.marked_by
        WHERE s.course_id = :courseId
        ORDER BY s.date ASC
    """, nativeQuery = true)
    List<SessionAttendanceDto> getSessionAttendanceForUser(
            @Param("userId") Integer userId,
            @Param("courseId") Integer courseId
    );
}
