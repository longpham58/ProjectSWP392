package com.itms.repository;

import com.itms.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    /**
     * Find all feedback for a specific course
     */
    List<Feedback> findByEnrollmentCourseId(Integer courseId);

    /**
     * Find feedback by user and course
     */
    Optional<Feedback> findByUserIdAndEnrollmentCourseId(Integer userId, Integer courseId);

    /**
     * Check if user has already submitted feedback for a course
     */
    boolean existsByUserIdAndEnrollmentCourseId(Integer userId, Integer courseId);
}
