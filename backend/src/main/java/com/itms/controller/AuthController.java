package com.itms.controller;

import com.itms.dto.UserInfo;
import com.itms.dto.auth.*;
import com.itms.dto.common.ResponseDto;
import com.itms.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    // --------------------------
    // Login with username/password
    // --------------------------
    @PostMapping("/login")
    public ResponseEntity<ResponseDto<LoginResponse>> login(
            @RequestBody LoginRequest request,
            HttpServletResponse response,@CookieValue(value = "deviceToken", required = false) String deviceToken) {

        ResponseDto<LoginResponse> loginResponse = userService.login(request, response, deviceToken);

        // Set JWT cookie if token is present
        if (loginResponse.getData() != null && loginResponse.getData().getToken() != null) {
            loginResponse.getData().getTokenAndSetCookie(response);
        }

        return ResponseEntity.ok(loginResponse);
    }

    // --------------------------
    // Verify OTP
    // --------------------------
    @PostMapping("/verify-otp")
    public ResponseEntity<ResponseDto<LoginResponse>> verifyOtp(
            @RequestBody VerifyOtpRequest request,
            HttpServletResponse response) {

        ResponseDto<LoginResponse> loginResponse = userService.verifyOtp(request.getUserId(), request.getOtp());

        if (loginResponse.getData() != null && loginResponse.getData().getToken() != null) {
            loginResponse.getData().getTokenAndSetCookie(response);
        }

        return ResponseEntity.ok(loginResponse);
    }

    // --------------------------
    // Forgot password
    // --------------------------
    @PostMapping("/forgot-password")
    public ResponseEntity<ResponseDto<Void>> forgotPassword(
            @RequestBody ForgotPasswordRequest request) {

        ResponseDto<Void> response = userService.forgotPassword(request);
        return ResponseEntity.ok(response);
    }

    // --------------------------
    // Reset password
    // --------------------------
    @PostMapping("/reset-password")
    public ResponseEntity<ResponseDto<Void>> resetPassword(
            @RequestBody ResetPasswordRequest request) {

        ResponseDto<Void> response = userService.resetPassword(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<ResponseDto<UserInfo>> me(Authentication authentication) {
        return ResponseEntity.ok(userService.getMe(authentication));
    }

    @PostMapping("/logout")
    public ResponseEntity<ResponseDto<Void>> logout(HttpServletResponse response) {

        Cookie jwtCookie = new Cookie("JWT_TOKEN", null);
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(true);
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(0);

        response.addCookie(jwtCookie);

        return ResponseEntity.ok(ResponseDto.success(null, "Logged out"));
    }


}
