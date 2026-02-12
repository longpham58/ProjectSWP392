package com.itms.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfo {

    private Integer id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String avatarUrl;
    private List<String> roles;
    private DepartmentDto department;
    private boolean isActive;
    private boolean otpEnabled;
    private LocalDateTime lastLogin;
}
