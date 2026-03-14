package com.itms.repository;

import com.itms.entity.UserModuleProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserModuleProgressRepository extends JpaRepository<UserModuleProgress, Integer> {

    // Find progress for a specific user and module
    Optional<UserModuleProgress> findByUserIdAndModuleId(Integer userId, Integer moduleId);

    // Find all progress records for a user in a specific course
    @Query("SELECT p FROM UserModuleProgress p WHERE p.user.id = :userId AND p.module.course.id = :courseId")
    List<UserModuleProgress> findByUserIdAndCourseId(@Param("userId") Integer userId, @Param("courseId") Integer courseId);

    // Find all completed modules for a user in a specific course
    @Query("SELECT p FROM UserModuleProgress p WHERE p.user.id = :userId AND p.module.course.id = :courseId AND p.isCompleted = true")
    List<UserModuleProgress> findCompletedModulesByUserIdAndCourseId(@Param("userId") Integer userId, @Param("courseId") Integer courseId);

    // Check if a module is completed
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM UserModuleProgress p WHERE p.user.id = :userId AND p.module.id = :moduleId AND p.isCompleted = true")
    boolean isModuleCompleted(@Param("userId") Integer userId, @Param("moduleId") Integer moduleId);

    // Count completed modules for a user in a course
    @Query("SELECT COUNT(p) FROM UserModuleProgress p WHERE p.user.id = :userId AND p.module.course.id = :courseId AND p.isCompleted = true")
    int countCompletedModules(@Param("userId") Integer userId, @Param("courseId") Integer courseId);

    // Find all progress for a user
    List<UserModuleProgress> findByUserId(Integer userId);

    // Delete all progress for a user in a course
    void deleteByUserIdAndModuleCourseId(Integer userId, Integer courseId);
}
