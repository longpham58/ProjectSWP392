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
     * Updated to use Session.trainer_id directly
     */
    @Query("SELECT s FROM Session s WHERE s.trainer.id = :trainerId ORDER BY s.date ASC, s.timeStart ASC")
    List<Session> findByTrainerId(@Param("trainerId") Integer trainerId);

    /**
     * Get session number by counting sessions before this date for the same class
     */
    @Query(value = """
        SELECT COUNT(*) + 1
        FROM Session s
        WHERE s.class_id = :classId
          AND (
              s.date < CAST(:sessionDate AS DATE)
              OR (s.date = CAST(:sessionDate AS DATE) AND s.time_start < CAST(:sessionTime AS TIME))
          )
    """, nativeQuery = true)
    Integer getSessionNumber(
            @Param("classId") Long classId,
            @Param("sessionDate") java.time.LocalDate sessionDate,
            @Param("sessionTime") java.time.LocalTime sessionTime
    );

    /**
     * Get session attendance for a user in a course - single query with JOINs
     * Session number is calculated by counting previous sessions
     */
    @Query(value = """
        SELECT 
            s.id,
            (SELECT COUNT(*) + 1 
             FROM Session s2 
             WHERE s2.class_id = s.class_id 
               AND (
                   s2.date < s.date 
                   OR (s2.date = s.date AND s2.time_start < s.time_start)
               )
            ) as session_number,
            s.date,
            s.time_start,
            s.time_end,
            s.location,
            s.status,
            a.attended,
            a.completion_status,
            u.full_name
        FROM Session s
        LEFT JOIN Enrollment e ON e.session_id = s.id AND e.user_id = :userId
        LEFT JOIN Attendance a ON a.enrollment_id = e.id
        LEFT JOIN [User] u ON u.id = a.marked_by
        WHERE s.course_id = :courseId
        ORDER BY s.date ASC, s.time_start ASC
    """, nativeQuery = true)
    List<Object[]> getSessionAttendanceForUserRaw(
            @Param("userId") Integer userId,
            @Param("courseId") Integer courseId
    );

    /**
     * Find all sessions for courses taught by a specific trainer, ordered by date
     */
    @Query("SELECT s FROM Session s WHERE s.course.trainer.id = :trainerId ORDER BY s.date ASC, s.sessionNumber ASC")
    List<Session> findByCourseTrainerIdOrderByDateAsc(@Param("trainerId") Integer trainerId);

    /**
     * Find all sessions for courses taught by a specific trainer, ordered by date (alias)
     */
    @Query("SELECT s FROM Session s WHERE s.course.trainer.id = :trainerId ORDER BY s.date ASC, s.sessionNumber ASC")
    List<Session> findByTrainerIdOrderByDateAsc(@Param("trainerId") Integer trainerId);

    /**
     * Find all sessions for courses taught by a specific trainer
     */
    @Query("SELECT s FROM Session s WHERE s.course.trainer.id = :trainerId")
    List<Session> findByTrainerId(@Param("trainerId") Integer trainerId);

    /**
     * Find all sessions for a user (through enrollments), ordered by date
     */
    @Query("SELECT s FROM Session s JOIN Enrollment e ON e.course = s.course WHERE e.user.id = :userId ORDER BY s.date ASC, s.sessionNumber ASC")
    List<Session> findByUserIdOrderByDateAsc(@Param("userId") Integer userId);

    /**
     * Find all sessions for a user for a specific course
     */
    @Query("SELECT s FROM Session s JOIN Enrollment e ON e.course = s.course WHERE e.user.id = :userId AND s.course.id = :courseId ORDER BY s.date ASC, s.sessionNumber ASC")
    List<Session> findByUserIdAndCourseIdOrderByDateAsc(@Param("userId") Integer userId, @Param("courseId") Integer courseId);
}
