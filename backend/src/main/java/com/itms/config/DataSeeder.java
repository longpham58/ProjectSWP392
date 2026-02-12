package com.itms.config;

import com.itms.entity.*;
import com.itms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataSeeder {

    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedData(
            DepartmentRepository departmentRepository,
            UserRepository userRepository,
            RoleRepository roleRepository,
            UserRoleRepository userRoleRepository
    ) {
        return args -> {
            if (userRoleRepository.count() > 0) {
                System.out.println("⏭ UserRole already seeded. Skipping.");
                return;
            }


            // =========================
            // Seed Roles
            // =========================
            Role adminRole = createRole(roleRepository,
                    "Administrator", "ADMIN", "Full system access");

            Role hrRole = createRole(roleRepository,
                    "Human Resources", "HR", "Manage training programs");

            Role trainerRole = createRole(roleRepository,
                    "Trainer", "TRAINER", "Conduct training sessions");

            Role employeeRole = createRole(roleRepository,
                    "Employee", "EMPLOYEE", "Access training courses");

            // =========================
            // Seed Departments
            // =========================
            Department it = createDepartment(departmentRepository,
                    "IT Department", "IT", "Information Technology Department");

            Department hr = createDepartment(departmentRepository,
                    "HR Department", "HR", "Human Resources Department");

            Department finance = createDepartment(departmentRepository,
                    "Finance Department", "FIN", "Finance and Accounting Department");

            Department sales = createDepartment(departmentRepository,
                    "Sales Department", "SALES", "Sales and Marketing Department");

            // =========================
            // Seed Users
            // =========================
            String password = passwordEncoder.encode("admin123");

            User admin = createUser(userRepository,
                    "admin", "admin@itms.com", "System Administrator",
                    "0905123456", it, password);

            User hrUser = createUser(userRepository,
                    "hr001", "hr@itms.com", "Nguyễn Văn HR",
                    "0905123457", hr, password);

            User trainer = createUser(userRepository,
                    "trainer001", "trainer@itms.com", "Trần Thị Trainer",
                    "0905123458", it, password);

            User emp1 = createUser(userRepository,
                    "emp001", "employee@itms.com", "Lê Văn Employee",
                    "0905123459", finance, password);

            User emp2 = createUser(userRepository,
                    "emp002", "employee2@itms.com", "Phạm Thị Mai",
                    "0905123460", sales, password);

            // =========================
            // Assign Roles (UserRole)
            // =========================
            assignRole(userRoleRepository, admin, adminRole, admin);
            assignRole(userRoleRepository, hrUser, hrRole, admin);
            assignRole(userRoleRepository, trainer, trainerRole, admin);
            assignRole(userRoleRepository, trainer, employeeRole, admin); // same as SQL
            assignRole(userRoleRepository, emp1, employeeRole, admin);
            assignRole(userRoleRepository, emp2, employeeRole, admin);

            System.out.println("✅ ITMS seed data completed successfully");
        };
    }

    // =========================
    // Helper methods
    // =========================

    private Role createRole(RoleRepository repo, String name, String code, String desc) {
        return repo.findByRoleCode(code).orElseGet(() ->
                repo.save(Role.builder()
                        .roleName(name)
                        .roleCode(code)
                        .description(desc)
                        .isActive(true)
                        .createdAt(LocalDateTime.now())
                        .build())
        );
    }

    private Department createDepartment(
            DepartmentRepository repo,
            String name,
            String code,
            String desc
    ) {
        return repo.findByName(name).orElseGet(() ->
                repo.save(Department.builder()
                        .name(name)
                        .code(code)
                        .description(desc)
                        .isActive(true)
                        .createdAt(LocalDateTime.now())
                        .build())
        );
    }

    private User createUser(
            UserRepository repo,
            String username,
            String email,
            String fullName,
            String phone,
            Department dept,
            String password
    ) {
        return repo.findByUsername(username).orElseGet(() ->
                repo.save(User.builder()
                        .username(username)
                        .email(email)
                        .fullName(fullName)
                        .phone(phone)
                        .department(dept)
                        .password(password)
                        .isActive(true)
                        .otpEnabled(false)
                        .createdAt(LocalDateTime.now())
                        .build())
        );
    }

    private void assignRole(
            UserRoleRepository repo,
            User user,
            Role role,
            User assignedBy
    ) {
        if (repo.existsByUserAndRole(user, role)) {
            return; // already assigned
        }

        UserRole userRole = UserRole.builder()
                .user(user)
                .role(role)
                .assignedBy(assignedBy)
                .isActive(true)
                .build();

        repo.save(userRole);
    }

}
