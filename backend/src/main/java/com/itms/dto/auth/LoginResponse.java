package com.itms.dto.auth;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;           // JWT token
    private UserInfo user;          // basic user info
    private boolean otpRequired;
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

    public void getTokenAndSetCookie(HttpServletResponse response) {
        if (token != null && response != null) {
            Cookie cookie = new Cookie("JWT_TOKEN", token);
            cookie.setHttpOnly(true);
            cookie.setSecure(true);
            cookie.setPath("/");
            cookie.setMaxAge(60 * 60);
            response.addCookie(cookie);
        }
    }
}
