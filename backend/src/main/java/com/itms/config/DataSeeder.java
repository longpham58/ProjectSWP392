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

            if (userRepository.count() > 0) return; // tránh seed lại

            // ---- Departments ----
            Department hr = new Department();
            hr.setName("Human Resources");
            departmentRepository.save(hr);

            Department it = new Department();
            it.setName("Information Technology");
            departmentRepository.save(it);

            // ---- Users ----
            User hrUser = new User();
            hrUser.setUsername("hr01");
            hrUser.setEmail("hr01@itms.com");
            hrUser.setFullName("Nguyen Thi HR");
            hrUser.setRole(UserRole.HR);
            hrUser.setDepartment(hr);
            hrUser.setPassword(passwordEncoder.encode("123456")); // BCrypt

            userRepository.save(hrUser);

            User employee = new User();
            employee.setUsername("tinvipthebest");
            employee.setEmail("mantinited@gmail.com");
            employee.setFullName("Kieu Trung Tin");
            employee.setRole(UserRole.EMPLOYEE);
            employee.setDepartment(it);
            employee.setPassword(passwordEncoder.encode("123456")); // BCrypt

            userRepository.save(employee);

            System.out.println("✅ Seeded departments & users successfully");
        };
    }
}
