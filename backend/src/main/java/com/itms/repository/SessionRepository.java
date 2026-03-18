fpackage com.itms.repository;

import com.itms.dto.SessionAttendanceDto;
import com.itms.entity.Session;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {

    /**
     * Find all sessions for a course, ordered by date and session ID
     */
    @Query("SELECT s FROM Session s WHERE s.course.id = :courseId ORDER BY s.date ASC, s.id ASC")
    List<Session> findByCourseIdOrderByDateAsc(@Param("courseId") Integer courseId);

    /**
     * Find upcoming sessions for a user (today and future) via ClassMember.
     */
    @Query(value = """
        SELECT TOP 10
            s.id                AS id,
            COALESCE('Session ' + CAST(s.id AS VARCHAR), 'Session ' + CAST(s.id AS VARCHAR)) AS title,
            c.name              AS course,
            s.date              AS sessionDate,
            DATEDIFF(DAY, CAST(GETDATE() AS DATE), CAST(s.date AS DATE)) AS daysLeft,
            'SESSION'           AS type
        FROM Session s
        JOIN ClassRoom cr ON s.class_id = cr.id
        JOIN Course c ON cr.course_id = c.id
        JOIN ClassMember cm ON cm.class_id = cr.id
        WHERE cm.user_id = :userId
        AND cm.status = 'ACTIVE'
        AND s.status = 'SCHEDULED'
        AND CAST(s.date AS DATE) >= CAST(GETDATE() AS DATE)
        ORDER BY s.date ASC, s.time_start ASC
    """, nativeQuery = true)
    List<Object[]> findUpcomingSessions(@Param("userId") Integer userId);

    /**
     * Find all sessions for a course with a specific status
     */
    @Query("SELECT s FROM Session s WHERE s.course.id = :courseId AND s.status = :status ORDER BY s.date ASC")
    List<Session> findByCourseIdAndStatus(@Param("courseId") Integer courseId, com.itms.common.SessionStatus status);
    
    /**
     * Find all sessions for given class IDs
     */
    @Query("SELECT s FROM Session s WHERE s.classRoom.id IN :classIds")
    List<Session> findByClassRoomIdIn(@Param("classIds") List<Integer> classIds);

    /**
     * Get session attendance for a user in a course - single query with JOINs
     */
    @Query("""
        SELECT new com.itms.dto.SessionAttendanceDto(
            s.id,
            s.date,
            s.timeStart,
            s.timeEnd,
            s.location,
            s.status,
            a.attended,
            a.completionStatus,
            m.fullName
        )
        FROM Session s
        LEFT JOIN Enrollment e 
               ON e.session.id = s.id 
               AND e.user.id = :userId
        LEFT JOIN Attendance a
               ON a.enrollment.id = e.id
        LEFT JOIN User m
               ON m.id = a.markedBy.id
        WHERE s.course.id = :courseId
        ORDER BY s.date ASC
    """)
    List<SessionAttendanceDto> getSessionAttendanceForUser(
            @Param("userId") Integer userId,
            @Param("courseId") Integer courseId
    );

    /**
     * Find all sessions for courses taught by a specific trainer, ordered by date
     */
    @Query("""
        SELECT new com.itms.dto.SessionAttendanceDto(
            s.id,
            CAST(s.id AS int),
            s.date,
            s.timeStart,
            s.timeEnd,
            s.location,
            s.status,
            a.attended,
            a.completionStatus,
            m.fullName
        )
        FROM Session s
        LEFT JOIN Enrollment e
               ON e.session.id = s.id
        LEFT JOIN Attendance a
               ON a.enrollment.id = e.id
        LEFT JOIN User m
               ON m.id = a.markedBy.id
        WHERE s.id = :sessionId
        ORDER BY e.user.id ASC
    """)
    List<SessionAttendanceDto> getSessionAttendanceForSession(@Param("sessionId") Long sessionId);

    /**
     * Find all sessions for a specific trainer, ordered by date
     */
    @Query("SELECT s FROM Session s WHERE s.trainer.id = :trainerId ORDER BY s.date ASC")
    List<Session> findByCourseTrainerIdOrderByDateAsc(@Param("trainerId") Integer trainerId);

    /**
     * Find all sessions for courses taught by a specific trainer, ordered by date (alias)
     */
    @Query("SELECT s FROM Session s WHERE s.trainer.id = :trainerId ORDER BY s.date ASC, s.timeStart ASC")
    List<Session> findByTrainerIdOrderByDateAsc(@Param("trainerId") Integer trainerId);

    /**
     * Find all sessions for courses taught by a specific trainer
     */
    @Query("SELECT s FROM Session s WHERE s.trainer.id = :trainerId")
    List<Session> findByTrainerId(@Param("trainerId") Integer trainerId);

    /**
     * Calculate session number dynamically by counting previous sessions in the same class
     */
    @Query(value = """
        SELECT COUNT_BIG(s2.id) + 1
        FROM Session s2
        WHERE s2.class_id = :classId
        AND (
            CAST(s2.date AS DATE) < CAST(:sessionDate AS DATE)
            OR (
                CAST(s2.date AS DATE) = CAST(:sessionDate AS DATE)
                AND CAST(s2.time_start AS TIME) < CAST(:timeStart AS TIME)
            )
        )
    """, nativeQuery = true)
    Integer getSessionNumber(
        @Param("classId") Integer classId,
        @Param("sessionDate") LocalDate sessionDate,
        @Param("timeStart") LocalTime timeStart
    );

    /**
     * Find all sessions for a user (through enrollments), ordered by date
     */
    @Query("SELECT s FROM Session s JOIN Enrollment e ON e.session = s WHERE e.user.id = :userId ORDER BY s.date ASC, s.id ASC")
    List<Session> findByUserIdOrderByDateAsc(@Param("userId") Integer userId);

    /**
     * Find all sessions for a user for a specific course
     */
    @Query("SELECT s FROM Session s JOIN Enrollment e ON e.session = s WHERE e.user.id = :userId AND s.course.id = :courseId ORDER BY s.date ASC, s.id ASC")
    List<Session> findByUserIdAndCourseIdOrderByDateAsc(@Param("userId") Integer userId, @Param("courseId") Integer courseId);

    /**
     * Get session attendance for a specific session (for trainers)
     */


    /**
     * Check if there is a time conflict in a specific room on a specific date
     */
    @Query(value = """
        SELECT CASE WHEN COUNT_BIG(s.id) > 0 THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END
        FROM Session s
        WHERE CAST(s.date AS DATE) = CAST(:date AS DATE)
          AND LOWER(COALESCE(s.location, '')) = LOWER(COALESCE(:location, ''))
          AND CAST(s.time_start AS TIME) < CAST(:endTime AS TIME)
          AND CAST(s.time_end AS TIME) > CAST(:startTime AS TIME)
          AND (:excludeId IS NULL OR s.id <> :excludeId)
    """, nativeQuery = true)
    boolean existsRoomTimeConflict(
            @Param("date") LocalDate date,
            @Param("location") String location,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeId") Long excludeId
    );

    /**
     * Find session by class room id and date
     */
    @Query("SELECT s FROM Session s WHERE s.classRoom.id = :classRoomId AND s.date = :date")
    Optional<Session> findByClassRoomIdAndDate(@Param("classRoomId") Integer classRoomId,
                                               @Param("date") java.time.LocalDate date);

    /**
     * Find all sessions for a class room, ordered by date and start time
     */
    @Query("SELECT s FROM Session s WHERE s.classRoom.id = :classRoomId ORDER BY s.date ASC, s.timeStart ASC")
    List<Session> findByClassRoomIdOrderByDateAsc(@Param("classRoomId") Integer classRoomId);

    /**
     * Find all sessions ordered by date and start time (for HR schedule)
     */
    @Query("SELECT s FROM Session s ORDER BY s.date ASC, s.timeStart ASC")
    List<Session> findAllByOrderByDateAscTimeStartAsc();

    /**
     * Check if there is a time conflict for a trainer on a specific date
     */
    @Query(value = """
        SELECT CASE WHEN COUNT_BIG(s.id) > 0 THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END
        FROM Session s
        WHERE s.trainer_id = :trainerId
          AND CAST(s.date AS DATE) = CAST(:date AS DATE)
          AND CAST(s.time_start AS TIME) < CAST(:endTime AS TIME)
          AND CAST(s.time_end AS TIME) > CAST(:startTime AS TIME)
          AND (:excludeId IS NULL OR s.id <> :excludeId)
    """, nativeQuery = true)
    boolean existsTrainerTimeConflict(
            @Param("trainerId") String trainerId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeId") Long excludeId
    );

    /**
     * Get session by ID with trainer info
     */
    @Query("SELECT s FROM Session s LEFT JOIN FETCH s.trainer WHERE s.id = :sessionId")
    Optional<Session> getSessionById(@Param("sessionId") Long sessionId);

    /**
     * Get courses taught by a specific trainer
     */
    @Query("SELECT DISTINCT s.course FROM Session s WHERE s.trainer.id = :trainerId")
    List<com.itms.entity.Course> getTrainerCourses(@Param("trainerId") Integer trainerId);
    
    // ==================== Audit Log Methods ====================
    
    /**
     * Get recent session activities for admin audit logs
     */
    @Query("SELECT s FROM Session s " +
           "JOIN FETCH s.classRoom cr " +
           "JOIN FETCH cr.course c " +
           "ORDER BY s.createdAt DESC")
    List<Session> findRecentSessions(Pageable pageable);
}
