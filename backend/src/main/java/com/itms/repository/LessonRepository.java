package com.itms.repository;

import com.itms.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Integer> {
    @Query("SELECT l FROM Lesson l WHERE l.module.id = :moduleId ORDER BY l.displayOrder ASC")
    List<Lesson> findByModule_IdOrderByDisplayOrder(@Param("moduleId") Integer moduleId);

    @Query("SELECT COUNT(l) FROM Lesson l WHERE l.course.id = :courseId")
    long countByCourse_Id(@Param("courseId") Integer courseId);


}
