package com.itms.service;

import com.itms.dto.HrEmployeeDto;
import com.itms.entity.User;
import com.itms.entity.UserRole;
import com.itms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class HrEmployeeService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public List<HrEmployeeDto> getEmployees(String role, String status, String keyword) {
        String roleFilter = normalize(role);
        String statusFilter = normalize(status);
        String keywordFilter = normalize(keyword);

        return userRepository.findAllWithRolesAndDepartment().stream()
                .map(this::toDto)
                .filter(dto -> roleFilter == null || normalize(dto.getRole()).equals(roleFilter))
                .filter(dto -> statusFilter == null || normalize(dto.getStatus()).equals(statusFilter))
                .filter(dto -> keywordFilter == null || containsKeyword(dto, keywordFilter))
                .sorted(Comparator.comparing(HrEmployeeDto::getUserId, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    @Transactional
    public void toggleUserStatus(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(!user.getIsActive());
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }

    @Transactional
    public int importUsers(List<HrEmployeeDto> userDtos) {
        int count = 0;
        for (HrEmployeeDto dto : userDtos) {
            if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
                // Check if user already exists
                var existingUser = userRepository.findByEmail(dto.getEmail());
                if (existingUser.isEmpty()) {
                    // Generate temporary password
                    String tempPassword = generateTempPassword();
                    
                    User newUser = new User();
                    newUser.setUsername(dto.getUserId() != null ? dto.getUserId() : dto.getEmail().split("@")[0]);
                    newUser.setEmail(dto.getEmail());
                    newUser.setFullName(dto.getFullname() != null ? dto.getFullname() : dto.getEmail().split("@")[0]);
                    newUser.setPassword(passwordEncoder.encode(tempPassword)); // Hash password
                    newUser.setIsActive(true);
                    userRepository.save(newUser);
                    
                    // Send email with temp password and reset link
                    sendWelcomeEmail(newUser, tempPassword);
                    
                    count++;
                }
            }
        }
        return count;
    }
    
    private String generateTempPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
    
    private void sendWelcomeEmail(User user, String tempPassword) {
        try {
            String subject = "Welcome to ITMS - Your Account Details";
            
            String body = """
                Dear %s,
                
                Welcome to ITMS Training Management System!
                
                Your account has been created. Here are your login details:
                
                Username: %s
                Temporary Password: %s
                
                Please login with the above credentials. After login, you can change your password in your profile settings.
                
                If you need to reset your password, use the "Forgot Password" feature on the login page and verify with OTP.
                
                Best regards,
                ITMS Admin
                """.formatted(user.getFullName(), user.getUsername(), tempPassword);
            
            emailService.sendEmail(user.getEmail(), subject, body);
        } catch (Exception e) {
            System.err.println("Failed to send welcome email: " + e.getMessage());
        }
    }

    private HrEmployeeDto toDto(User user) {
        String role = user.getUserRole() == null ? "Employee" : user.getUserRole().stream()
                .filter(ur -> Boolean.TRUE.equals(ur.getIsActive()))
                .map(UserRole::getRole)
                .filter(r -> r != null && r.getRoleCode() != null)
                .map(r -> toDisplayRole(r.getRoleCode()))
                .findFirst()
                .orElse("Employee");

        String department = user.getDepartment() != null ? user.getDepartment().getName() : "";

        return HrEmployeeDto.builder()
                .id(user.getId())
                .userId(defaultString(user.getUsername()))
                .fullname(defaultString(user.getFullName()))
                .email(defaultString(user.getEmail()))
                .role(role)
                .status(Boolean.TRUE.equals(user.getIsActive()) ? "Active" : "Inactive")
                .department(department)
                .build();
    }

    private boolean containsKeyword(HrEmployeeDto dto, String keyword) {
        return normalize(dto.getUserId()).contains(keyword)
                || normalize(dto.getFullname()).contains(keyword)
                || normalize(dto.getEmail()).contains(keyword);
    }

    private String toDisplayRole(String roleCode) {
        return switch (roleCode.toUpperCase(Locale.ROOT)) {
            case "HR" -> "HR";
            case "TRAINER" -> "Trainer";
            case "ADMIN" -> "Admin";
            default -> "Employee";
        };
    }

    private String normalize(String value) {
        return value == null ? null : value.trim().toLowerCase(Locale.ROOT);
    }

    private String defaultString(String value) {
        return value == null ? "" : value;
    }
}
