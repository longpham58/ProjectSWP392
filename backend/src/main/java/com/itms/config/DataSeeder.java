package com.itms.config;

import com.itms.common.UserRole;
import com.itms.entity.User;
import com.itms.entity.Department;
import com.itms.repository.UserRepository;
import com.itms.repository.DepartmentRepository;
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
            UserRepository userRepository,
            DepartmentRepository departmentRepository
    ) {
        return args -> {

            // ---------- Seed Departments ----------
            Department hr = departmentRepository.findByName("Human Resources")
                    .orElseGet(() -> departmentRepository.save(
                            Department.builder()
                                    .name("Human Resources")
                                    .description("Human Resources")
                                    .createdAt(LocalDateTime.now())
                                    .build()
                    ));

            Department it = departmentRepository.findByName("IT Department")
                    .orElseGet(() -> departmentRepository.save(
                            Department.builder()
                                    .name("IT Department")
                                    .description("IT Department")
                                    .createdAt(LocalDateTime.now())
                                    .build()
                    ));

            // ---------- Seed HR ----------
            if (!userRepository.existsByUsername("hr01")) {
                userRepository.save(
                        User.builder()
                                .username("hr01")
                                .email("hr01@itms.com")
                                .fullName("Nguyen Thi HR")
                                .phone("0123456789")
                                .role(UserRole.HR)
                                .department(hr)
                                .password(passwordEncoder.encode("123456"))
                                .otpEnabled(false)
                                .isActive(true)
                                .createdAt(LocalDateTime.now())
                                .build()
                );
            }

            // ---------- Seed Employee ----------
            if (!userRepository.existsByUsername("tinvipthebest")) {
                userRepository.save(
                        User.builder()
                                .username("tinvipthebest")
                                .email("mantinited@gmail.com")
                                .fullName("Kieu Trung Tin")
                                .role(UserRole.EMPLOYEE)
                                .phone("0905444333")
                                .department(it)
                                .password(passwordEncoder.encode("123456"))
                                .isActive(true)
                                .otpEnabled(false)
                                .createdAt(LocalDateTime.now())
                                .build()
                );
            }

            // ---------- Seed Admin ----------
            if (!userRepository.existsByUsername("admin")) {
                userRepository.save(
                        User.builder()
                                .username("admin")
                                .email("admin@itms.com")
                                .fullName("Administrator")
                                .role(UserRole.ADMIN)
                                .phone("0905123456")
                                .department(it)
                                .isActive(true)
                                .password(passwordEncoder.encode("123456"))
                                .createdAt(LocalDateTime.now())
                                .otpEnabled(false)
                                .build()
                );
            }

            System.out.println("✅ ITMS seed data completed successfully");
        };
    }
}

