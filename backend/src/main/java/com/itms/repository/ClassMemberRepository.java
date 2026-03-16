package com.itms.repository;

import com.itms.entity.ClassMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    
    /**
     * Find all members in a class by class code
     */
    @Query("SELECT cm FROM ClassMember cm JOIN FETCH cm.user WHERE cm.classRoom.classCode = :classCode AND cm.status = 'ACTIVE'")
    List<ClassMember> findByClassRoomClassCode(@Param("classCode") String classCode);
}