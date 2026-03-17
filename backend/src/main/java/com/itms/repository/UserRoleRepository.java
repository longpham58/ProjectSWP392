package com.itms.repository;

import com.itms.entity.Role;
import com.itms.entity.User;
import com.itms.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, Integer> {

    boolean existsByUserAndRole(User user, Role role);

    Optional<UserRole> findByUserAndRole(User user, Role role);

    List<UserRole> findByUser(User user);

    @Query("SELECT COUNT(ur) FROM UserRole ur WHERE ur.role.id = :roleId")
    long countByRoleId(@Param("roleId") Integer roleId);

    @Query("SELECT ur.role.roleName, COUNT(ur) FROM UserRole ur GROUP BY ur.role.id, ur.role.roleName")
    List<Object[]> countByRoleGroupByRole();
}
