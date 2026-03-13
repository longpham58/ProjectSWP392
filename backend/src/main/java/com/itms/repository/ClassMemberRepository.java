package com.itms.repository;

import com.itms.entity.ClassMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassMemberRepository extends JpaRepository<ClassMember, Long> {
    
    List<ClassMember> findByClassRoomId(Long classId);
    
    List<ClassMember> findByUserId(Integer userId);
    
    boolean existsByClassRoomIdAndUserId(Long classId, Integer userId);
}
