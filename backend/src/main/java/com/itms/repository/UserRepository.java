package com.itms.repository;

import com.itms.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
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

    /** All users with roles and department eagerly loaded (for HR employee list). */
    @Query("""
        SELECT DISTINCT u FROM User u
        LEFT JOIN FETCH u.userRole ur
        LEFT JOIN FETCH ur.role
        LEFT JOIN FETCH u.department
        ORDER BY u.id
        """)
    List<User> findAllWithRolesAndDepartment();

    /** Active users that have an active TRAINER role (for HR dropdown and stats). */
    @Query("""
        SELECT DISTINCT u FROM User u
        JOIN u.userRole ur
        JOIN ur.role r
        WHERE LOWER(r.roleCode) = 'trainer'
        AND (ur.isActive = true OR ur.isActive IS NULL)
        AND (u.isActive = true OR u.isActive IS NULL)
        ORDER BY u.fullName
        """)
    List<User> findAllActiveTrainers();

    /** Active users that have an active EMPLOYEE role. */
    @Query("""
        SELECT DISTINCT u FROM User u
        JOIN u.userRole ur
        JOIN ur.role r
        WHERE LOWER(r.roleCode) = 'employee'
        AND (ur.isActive = true OR ur.isActive IS NULL)
        AND (u.isActive = true OR u.isActive IS NULL)
        ORDER BY u.fullName
        """)
    List<User> findAllActiveEmployees();

    /** Count active users with the given role code (e.g. TRAINER). */
    @Query("""
        SELECT COUNT(DISTINCT u) FROM User u
        JOIN u.userRole ur
        JOIN ur.role r
        WHERE LOWER(r.roleCode) = LOWER(:roleCode)
        AND (ur.isActive = true OR ur.isActive IS NULL)
        AND (u.isActive = true OR u.isActive IS NULL)
        """)
    long countActiveUsersByRoleCode(@Param("roleCode") String roleCode);

    /** Users that have the given role name (e.g. "Human Resources" for HR). */
    @Query("SELECT DISTINCT u FROM User u JOIN u.userRole ur JOIN ur.role r WHERE r.roleName = :roleName")
    List<User> findByRoleName(@Param("roleName") String roleName);

    /** Users that have the given role name or role code. */
    @Query("SELECT DISTINCT u FROM User u JOIN u.userRole ur JOIN ur.role r WHERE r.roleName = :roleName OR r.roleCode = :roleCode")
    List<User> findByRoleNameOrCode(@Param("roleName") String roleName, @Param("roleCode") String roleCode);
    
    /** Count all users */
    long count();
    
    /** Count users by active status */
    long countByIsActive(boolean isActive);
    
    /** Count users created after a specific date (new registrations) */
    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :startDate")
    long countUsersCreatedAfter(@Param("startDate") LocalDateTime startDate);
    
    /** Count users who logged in after a specific date (daily active users) */
    @Query("SELECT COUNT(u) FROM User u WHERE u.lastLogin >= :startDate AND u.lastLogin IS NOT NULL")
    long countUsersLoggedInAfter(@Param("startDate") LocalDateTime startDate);
    
    /** Count users with failed login attempts */
    @Query("SELECT COUNT(u) FROM User u WHERE u.failedLoginAttempts > 0")
    long countUsersWithFailedLoginAttempts();
    
    /** Count locked users (lockedUntil is in the future) */
    @Query("SELECT COUNT(u) FROM User u WHERE u.lockedUntil IS NOT NULL AND u.lockedUntil > :now")
    long countLockedUsers(@Param("now") LocalDateTime now);
    
    /** Count new users per month for the last N months */
   @Query("""
    SELECT MONTH(u.createdAt), COUNT(u)
    FROM User u
    WHERE u.createdAt >= :startDate
    GROUP BY MONTH(u.createdAt)
    ORDER BY MONTH(u.createdAt)
""")
List<Object[]> countNewUsersByMonth(@Param("startDate") LocalDateTime startDate);

    /** Count users by department */
    @Query("SELECT COUNT(u) FROM User u WHERE u.department.id = :departmentId")
    long countByDepartmentId(@Param("departmentId") Integer departmentId);

    /** Count active users by department */
    @Query("SELECT COUNT(u) FROM User u WHERE u.department.id = :departmentId AND u.isActive = true")
    long countActiveByDepartmentId(@Param("departmentId") Integer departmentId);

    /** Get all departments with user counts */
    @Query("SELECT u.department.name, COUNT(u) FROM User u WHERE u.department IS NOT NULL GROUP BY u.department.name")
    List<Object[]> countUsersGroupByDepartment();
    // ==================== Audit Log Methods ====================
    
    /**
     * Get recent user registrations for admin audit logs
     */
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.department ORDER BY u.createdAt DESC")
    List<User> findRecentUsers(Pageable pageable);
}
