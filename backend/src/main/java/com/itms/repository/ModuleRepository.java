package com.itms.repository;

import com.itms.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ModuleRepository extends JpaRepository<Module, Integer> {
    @Query("SELECT m FROM Module m WHERE m.course.id = :courseId ORDER BY m.displayOrder ASC")
    List<Module> findByCourse_IdOrderByDisplayOrder(@Param("courseId") Integer courseId);
}