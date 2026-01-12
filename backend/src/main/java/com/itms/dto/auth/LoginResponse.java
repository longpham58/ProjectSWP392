package com.itms.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private boolean success;        // true if login succeeds
    private String message;         // "Login successful" or error message
    private String token;           // JWT token
    private UserInfo user;          // basic user info

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserInfo {
        private Integer id;
        private String username;
        private String fullName;
        private String email;
        private String role;         // EMPLOYEE, TRAINER, HR, MANAGER
        private Integer departmentId;
    }
}
