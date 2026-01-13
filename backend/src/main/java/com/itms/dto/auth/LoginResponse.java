package com.itms.dto.auth;

import com.itms.common.UserRole;
import com.itms.entity.User;
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
    private String email;
    private UserRole role;
    private boolean otpRequired;


    public void getTokenAndSetCookie(HttpServletResponse response) {
        if (token != null && response != null) {
            Cookie cookie = new Cookie("JWT_TOKEN", token);
            cookie.setHttpOnly(true);
            cookie.setSecure(false);
            cookie.setPath("/");
            cookie.setMaxAge(60 * 60);
            response.addCookie(cookie);
        }
    }
}
