package com.itms.repository;

import com.itms.entity.ClassRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClassRoomRepository extends JpaRepository<ClassRoom, Integer> {
    
    /**
     * Find classroom by class code
     */
    Optional<ClassRoom> findByClassCode(String classCode);
    
}
