package com.itms.repository;

import com.itms.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Integer> {

    /**
     * Find all courses that a user is enrolled in
     */
    @Query("SELECT DISTINCT c FROM Course c JOIN Enrollment e ON e.course = c WHERE e.user.id = :userId")
    List<Course> findCoursesByUserId(@Param("userId") Integer userId);

    List<Course> findByTrainerId(Integer trainerId);
}
