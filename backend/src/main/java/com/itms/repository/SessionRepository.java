package com.itms.repository;

import com.itms.dto.SessionAttendanceDto;
import com.itms.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {

    /**
<<<<<<< HEAD
     * Find all sessions for a course, ordered by date
     */
    @Query("SELECT s FROM Session s WHERE s.course.id = :courseId ORDER BY s.date ASC, s.timeStart ASC")
=======
     * Find all sessions for a course, ordered by date and session number
     */
    @Query("SELECT s FROM Session s WHERE s.course.id = :courseId ORDER BY s.date ASC, s.sessionNumber ASC")
>>>>>>> origin/main
    List<Session> findByCourseIdOrderByDateAsc(@Param("courseId") Integer courseId);

    /**
     * Find all sessions for a course with a specific status
     */
    @Query("SELECT s FROM Session s WHERE s.course.id = :courseId AND s.status = :status ORDER BY s.date ASC")
    List<Session> findByCourseIdAndStatus(@Param("courseId") Integer courseId, com.itms.common.SessionStatus status);

    /**
     * Get session attendance for a user in a course - single query with JOINs
     */
    @Query("""
        SELECT new com.itms.dto.SessionAttendanceDto(
            s.id,
<<<<<<< HEAD
            s.course.code,
=======
            s.sessionName,
            s.sessionNumber,
>>>>>>> origin/main
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
<<<<<<< HEAD
               ON e.session.id = s.id 
=======
               ON e.course.id = s.course.id 
>>>>>>> origin/main
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
<<<<<<< HEAD
     * Find all sessions for courses taught by a specific trainer, ordered by date
     */
    @Query("SELECT s FROM Session s WHERE s.trainer.id = :trainerId ORDER BY s.date ASC, s.timeStart ASC")
    List<Session> findByCourseTrainerIdOrderByDateAsc(@Param("trainerId") Integer trainerId);

    /**
     * Find all sessions for courses taught by a specific trainer, ordered by date (alias)
     */
    @Query("SELECT s FROM Session s WHERE s.trainer.id = :trainerId ORDER BY s.date ASC, s.timeStart ASC")
    List<Session> findByTrainerIdOrderByDateAsc(@Param("trainerId") Integer trainerId);

    /**
     * Find all sessions for courses taught by a specific trainer
=======
     * Find all sessions for a specific trainer, ordered by date
     */
    @Query("SELECT s FROM Session s WHERE s.trainer.id = :trainerId ORDER BY s.date ASC")
    List<Session> findByCourseTrainerIdOrderByDateAsc(@Param("trainerId") Integer trainerId);

    /**
     * Find all sessions for a specific trainer, ordered by date (alias)
     */
    @Query("SELECT s FROM Session s WHERE s.trainer.id = :trainerId ORDER BY s.date ASC")
    List<Session> findByTrainerIdOrderByDateAsc(@Param("trainerId") Integer trainerId);

    /**
     * Find all sessions for a specific trainer
>>>>>>> origin/main
     */
    @Query("SELECT s FROM Session s WHERE s.trainer.id = :trainerId")
    List<Session> findByTrainerId(@Param("trainerId") Integer trainerId);

    /**
<<<<<<< HEAD
     * Find all sessions for a user (through enrollments), ordered by date
     */
    @Query("SELECT s FROM Session s JOIN Enrollment e ON e.session.id = s.id WHERE e.user.id = :userId ORDER BY s.date ASC, s.timeStart ASC")
=======
     * Calculate session number dynamically by counting previous sessions in the same class
     */
    @Query("""
        SELECT COUNT(s2) + 1
        FROM Session s2
        WHERE s2.classRoom.id = :classId
        AND (s2.date < :sessionDate 
             OR (s2.date = :sessionDate AND s2.timeStart < :timeStart))
    """)
    Integer getSessionNumber(
        @Param("classId") Integer classId,
        @Param("sessionDate") java.time.LocalDate sessionDate,
        @Param("timeStart") java.time.LocalTime timeStart
    );

    /**
     * Find all sessions for a user (through enrollments), ordered by date
     */
    @Query("SELECT s FROM Session s JOIN Enrollment e ON e.course = s.course WHERE e.user.id = :userId ORDER BY s.date ASC, s.sessionNumber ASC")
>>>>>>> origin/main
    List<Session> findByUserIdOrderByDateAsc(@Param("userId") Integer userId);

    /**
     * Find all sessions for a user for a specific course
     */
<<<<<<< HEAD
    @Query("SELECT s FROM Session s JOIN Enrollment e ON e.session.id = s.id WHERE e.user.id = :userId AND s.course.id = :courseId ORDER BY s.date ASC, s.timeStart ASC")
    List<Session> findByUserIdAndCourseIdOrderByDateAsc(@Param("userId") Integer userId, @Param("courseId") Integer courseId);

    /**
     * Find all sessions for a class
     */
    @Query("SELECT s FROM Session s WHERE s.classRoom.id = :classId ORDER BY s.date ASC, s.timeStart ASC")
    List<Session> findByClassRoomIdOrderByDateAsc(@Param("classId") Integer classId);
=======
    @Query("SELECT s FROM Session s JOIN Enrollment e ON e.course = s.course WHERE e.user.id = :userId AND s.course.id = :courseId ORDER BY s.date ASC, s.sessionNumber ASC")
    List<Session> findByUserIdAndCourseIdOrderByDateAsc(@Param("userId") Integer userId, @Param("courseId") Integer courseId);
>>>>>>> origin/main
}
