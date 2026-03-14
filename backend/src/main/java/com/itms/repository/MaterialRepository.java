package com.itms.repository;

import com.itms.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {
    List<Material> findByModuleIdOrderByDisplayOrderAsc(Long moduleId);
    List<Material> findByCourseIdOrderByDisplayOrderAsc(Integer courseId);
}
