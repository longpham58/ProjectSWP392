package com.itms.repository;

import com.itms.entity.ClassRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassRoomRepository extends JpaRepository<ClassRoom, Long> {
    
    Optional<ClassRoom> findByClassCode(String classCode);
    
    List<ClassRoom> findByCourseId(Integer courseId);
    
    List<ClassRoom> findByTrainerId(Integer trainerId);
}
