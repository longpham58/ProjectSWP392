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
     * Find all feedback for a specific course
     */
    @Query("SELECT f FROM Feedback f JOIN f.enrollment e JOIN e.session s WHERE s.course.id = :courseId")
    List<Feedback> findByEnrollmentCourseId(@Param("courseId") Integer courseId);

    /**
     * Find feedback by user and course
     */
    @Query("SELECT f FROM Feedback f JOIN f.enrollment e JOIN e.session s WHERE f.user.id = :userId AND s.course.id = :courseId")
    Optional<Feedback> findByUserIdAndEnrollmentCourseId(@Param("userId") Integer userId, @Param("courseId") Integer courseId);

    /**
     * Check if user has already submitted feedback for a course
     */
    @Query("SELECT COUNT(f) > 0 FROM Feedback f JOIN f.enrollment e JOIN e.session s WHERE f.user.id = :userId AND s.course.id = :courseId")
    boolean existsByUserIdAndEnrollmentCourseId(@Param("userId") Integer userId, @Param("courseId") Integer courseId);

    /**
     * Find feedback for trainer's courses
     */
    @Query("SELECT f FROM Feedback f JOIN f.enrollment e JOIN e.session s JOIN s.course c WHERE c.trainer.id = :trainerId")
    List<Feedback> findByTrainerId(@Param("trainerId") Integer trainerId);
}
