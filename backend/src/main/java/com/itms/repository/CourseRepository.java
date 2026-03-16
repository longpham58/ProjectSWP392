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

    Optional<Course> findByCode(String code);

    Optional<Course> findByCodeIgnoreCase(String code);

    /** Maximum course id (for identity reseed after delete). Returns null if no courses. */
    @Query("SELECT MAX(c.id) FROM Course c")
    Integer findMaxId();

    /**
     * Find all courses that a user is enrolled in (via session)
     */
    @Query("SELECT DISTINCT c FROM Course c JOIN Session s ON s.course = c JOIN Enrollment e ON e.session = s WHERE e.user.id = :userId")
    List<Course> findCoursesByUserId(@Param("userId") Integer userId);

    List<Course> findByTrainerId(Integer trainerId);
}
