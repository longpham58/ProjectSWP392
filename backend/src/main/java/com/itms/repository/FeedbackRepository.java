package com.itms.repository;

import com.itms.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {



    /**
     * Find feedback by user and session
     */

    Optional<Feedback> findByUserIdAndSessionId(Integer userId, Integer sessionId);

    /**
     * Check if user has already submitted feedback for a session
     */
    boolean existsByUserIdAndSessionId(Integer userId, Integer sessionId);

    /**
     * Find all feedback for sessions in a course
     */
    @Query("SELECT f FROM Feedback f WHERE f.session.course.id = :courseId")
    List<Feedback> findBySessionCourseId(@Param("courseId") Integer courseId);

    /**
     * Find all feedback for a user
     */
    List<Feedback> findByUserId(Integer userId);

    /**
     * Find all feedback for an enrollment
     */
    List<Feedback> findByEnrollmentId(Integer enrollmentId);

    /**
     * Find all feedback for a specific course (through session)
     */
    @Query("SELECT f FROM Feedback f WHERE f.session.course.id = :courseId")
    List<Feedback> findByEnrollmentCourseId(@Param("courseId") Integer courseId);

    /**
     * Find feedback by user and course (through session)
     */
    @Query("SELECT f FROM Feedback f WHERE f.user.id = :userId AND f.session.course.id = :courseId")
    Optional<Feedback> findByUserIdAndEnrollmentCourseId(@Param("userId") Integer userId, @Param("courseId") Integer courseId);

    /**
     * Check if user has already submitted feedback for a course (through session)
     */

    @Query("SELECT COUNT(f) > 0 FROM Feedback f JOIN f.enrollment e JOIN e.session s WHERE f.user.id = :userId AND s.course.id = :courseId")
    boolean existsByUserIdAndEnrollmentCourseId(@Param("userId") Integer userId, @Param("courseId") Integer courseId);

    /**
     * Find feedback for trainer's courses
     */
    @Query("SELECT f FROM Feedback f JOIN f.enrollment e JOIN e.session s JOIN s.course c WHERE c.trainer.id = :trainerId")
    List<Feedback> findByTrainerId(@Param("trainerId") Integer trainerId);

}
