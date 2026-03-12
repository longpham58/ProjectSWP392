package com.itms.repository;

import com.itms.entity.CourseModule;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseModuleRepository extends JpaRepository<CourseModule, Integer> {
    List<CourseModule> findByCourseId(int courseId);
    
    @EntityGraph(attributePaths = {"materials"})
    List<CourseModule> findByCourseIdOrderByDisplayOrderAsc(int courseId);
}
