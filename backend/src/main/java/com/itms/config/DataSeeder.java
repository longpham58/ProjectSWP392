package com.itms.config;

import com.itms.common.UserRole;
import com.itms.entity.User;
import com.itms.entity.Department;
import com.itms.repository.UserRepository;
import com.itms.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedData(
            UserRepository userRepository,
            DepartmentRepository departmentRepository
    ) {
        return args -> {

            if (userRepository.count() > 0) {
                System.out.println("ℹ️ Seed skipped: data already exists");
                return;
            }

            // ---------- Seed Departments ----------
            Department hr = departmentRepository.findByName("Human Resources")
                    .orElseGet(() -> departmentRepository.save(
                            Department.builder()
                                    .name("Human Resources")
                                    .createdAt(LocalDateTime.now())
                                    .build()
                    ));

            Department it = departmentRepository.findByName("Information Technology")
                    .orElseGet(() -> departmentRepository.save(
                            Department.builder()
                                    .name("Information Technology")
                                    .createdAt(LocalDateTime.now())
                                    .build()
                    ));

            // ---------- Seed HR User ----------
            if (!userRepository.existsByUsername("hr01")) {
                User hrUser = User.builder()
                        .username("hr01")
                        .email("hr01@itms.com")
                        .fullName("Nguyen Thi HR")
                        .role(UserRole.HR)
                        .department(hr)
                        .password(passwordEncoder.encode("123456"))
                        .otpEnabled(true)   // HR requires OTP
                        .createdAt(LocalDateTime.now())
                        .build();

                userRepository.save(hrUser);
            }

            // ---------- Seed Employee ----------
            if (!userRepository.existsByUsername("tinvipthebest")) {
                User employee = User.builder()
                        .username("tinvipthebest")
                        .email("mantinited@gmail.com")
                        .fullName("Kieu Trung Tin")
                        .role(UserRole.EMPLOYEE)
                        .department(it)
                        .password(passwordEncoder.encode("123456"))
                        .otpEnabled(false)
                        .createdAt(LocalDateTime.now())
                        .build();

                userRepository.save(employee);
            }

            System.out.println("✅ ITMS seed data completed successfully");
        };
    }
}

