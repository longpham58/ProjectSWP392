package com.itms.repository;

import com.itms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    @Query("SELECT u FROM User u WHERE LOWER(u.username) = LOWER(:username)")
    Optional<User> findByUsername(@Param("username") String username);

    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmail(@Param("email") String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
    @Query("""
    SELECT u FROM User u
    LEFT JOIN FETCH u.userRole ur
    LEFT JOIN FETCH ur.role
    WHERE LOWER(u.username) = LOWER(:username)
""")
    Optional<User> findByUsernameWithRole(@Param("username") String username);

    @Query("""
    SELECT DISTINCT u FROM User u
    JOIN FETCH u.userRole ur
    JOIN FETCH ur.role r
    WHERE ur.isActive = true
      AND r.roleCode = 'TRAINER'
      AND u.isActive = true
""")
    List<User> findAllActiveTrainers();

    @Query("""
    SELECT COUNT(DISTINCT u.id) FROM User u
    JOIN u.userRole ur
    JOIN ur.role r
    WHERE ur.isActive = true
      AND u.isActive = true
      AND r.roleCode = :roleCode
""")
    long countActiveUsersByRoleCode(@Param("roleCode") String roleCode);

    @Query("""
    SELECT DISTINCT u FROM User u
    LEFT JOIN FETCH u.userRole ur
    LEFT JOIN FETCH ur.role r
    LEFT JOIN FETCH u.department d
""")
    List<User> findAllWithRolesAndDepartment();
}