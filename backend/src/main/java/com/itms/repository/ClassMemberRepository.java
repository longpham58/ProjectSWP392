package com.itms.repository;

import com.itms.entity.ClassMember;
import org.springframework.data.jpa.repository.JpaRepository;
<<<<<<< HEAD
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassMemberRepository extends JpaRepository<ClassMember, Integer> {

    /**
     * Find all class members by user ID
     */
    List<ClassMember> findByUserId(Integer userId);

    /**
     * Find all class members by class ID
     */
    List<ClassMember> findByClassRoomId(Integer classId);

    /**
     * Find class member by class and user
     */
    Optional<ClassMember> findByClassRoomIdAndUserId(Integer classId, Integer userId);

    /**
     * Check if user is a member of a class
     */
    boolean existsByClassRoomIdAndUserId(Integer classId, Integer userId);

    /**
     * Find active class members for a user
     */
    @Query("SELECT cm FROM ClassMember cm WHERE cm.user.id = :userId AND cm.status = 'ACTIVE'")
    List<ClassMember> findActiveByUserId(@Param("userId") Integer userId);

    /**
     * Find active class members for a class
     */
    @Query("SELECT cm FROM ClassMember cm WHERE cm.classRoom.id = :classId AND cm.status = 'ACTIVE'")
    List<ClassMember> findActiveByClassRoomId(@Param("classId") Integer classId);

    /**
     * Count members in a class
     */
    Integer countByClassRoomId(Integer classId);
=======
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
>>>>>>> origin/main
}
