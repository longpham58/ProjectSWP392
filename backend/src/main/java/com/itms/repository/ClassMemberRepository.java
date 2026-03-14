package com.itms.repository;

import com.itms.entity.ClassMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassMemberRepository extends JpaRepository<ClassMember, Integer> {
    
    /**
     * Find all members in a specific class
     */
    List<ClassMember> findByClassRoomId(Integer classRoomId);
    
    /**
     * Find all classes a user is a member of
     */
    List<ClassMember> findByUserId(Integer userId);
    
    /**
     * Check if a user is a member of a specific class
     */
    boolean existsByClassRoomIdAndUserId(Integer classRoomId, Integer userId);
}
