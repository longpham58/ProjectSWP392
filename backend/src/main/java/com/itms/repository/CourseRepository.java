package com.itms.repository;

import com.itms.entity.Course;
import com.itms.common.CourseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Integer> {
    
    // Lấy tất cả khóa học của một trainer
    List<Course> findByTrainerId(Integer trainerId);
    
    // Lấy khóa học của trainer theo status
    List<Course> findByTrainerIdAndStatus(Integer trainerId, CourseStatus status);
    
    // Lấy khóa học active của trainer, sắp xếp theo ngày tạo
    List<Course> findByTrainerIdAndStatusOrderByCreatedAtDesc(Integer trainerId, CourseStatus status);
}
