package com.itms.repository;

import com.itms.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Integer> {

    /**
     * Find all courses that a user is enrolled in (through session enrollments)
     */
    @Query("SELECT DISTINCT c FROM Course c JOIN Session s ON s.course = c JOIN Enrollment e ON e.session = s WHERE e.user.id = :userId")
    List<Course> findCoursesByUserId(@Param("userId") Integer userId);

    /**
     * Find courses by trainer ID using the trainer relationship
     */
    @Query("SELECT c FROM Course c WHERE c.trainer.id = :trainerId")
    List<Course> findByTrainerId(@Param("trainerId") Integer trainerId);

    /**
     * Find course by code
     */
    Optional<Course> findByCode(String code);
}
