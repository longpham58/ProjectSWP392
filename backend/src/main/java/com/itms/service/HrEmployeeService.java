package com.itms.service;

import com.itms.dto.HrEmployeeDto;
import com.itms.entity.User;
import com.itms.entity.UserRole;
import com.itms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class HrEmployeeService {

    private final UserRepository userRepository;

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

    private HrEmployeeDto toDto(User user) {
        String role = user.getUserRole() == null ? "Employee" : user.getUserRole().stream()
                .filter(ur -> Boolean.TRUE.equals(ur.getIsActive()))
                .map(UserRole::getRole)
                .filter(r -> r != null && r.getRoleCode() != null)
                .map(r -> toDisplayRole(r.getRoleCode()))
                .findFirst()
                .orElse("Employee");

        return HrEmployeeDto.builder()
                .id(user.getId())
                .userId(defaultString(user.getUsername()))
                .fullname(defaultString(user.getFullName()))
                .email(defaultString(user.getEmail()))
                .role(role)
                .status(Boolean.TRUE.equals(user.getIsActive()) ? "Active" : "Inactive")
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
