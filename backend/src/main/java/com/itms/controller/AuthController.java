package com.itms.controller;

import com.itms.dto.UserInfo;
import com.itms.dto.auth.*;
import com.itms.dto.common.ResponseDto;
import com.itms.service.OtpService;
import com.itms.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final OtpService otpService;

    // --------------------------
    // Login with username/password
    // --------------------------
    @PostMapping("/login")
    public ResponseEntity<ResponseDto<LoginResponse>> login(
            @RequestBody LoginRequest request,
            HttpServletRequest httpRequest
    ) {
        ResponseDto<LoginResponse> loginResponse =
                userService.login(request, httpRequest);

        return ResponseEntity.ok(loginResponse);
    }

    // --------------------------
    // Verify OTP
    // --------------------------
    @PostMapping("/verify-otp")
    public ResponseEntity<ResponseDto<LoginResponse>> verifyOtp(
            @RequestBody VerifyOtpRequest request,
            HttpServletRequest httpRequest
    ) {

        return ResponseEntity.ok(
                userService.verifyOtp(request, httpRequest)
        );
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ResponseDto<Void>> resendOtp(HttpSession session) {

        Integer userId = (Integer) session.getAttribute("OTP_USER_ID");

        otpService.resendOtp(userId);

        return ResponseEntity.ok(
                ResponseDto.success(null, "OTP resent")
        );
    }

    // --------------------------
    // Forgot password
    // --------------------------
    @PostMapping("/forgot-password")
    public ResponseEntity<ResponseDto<String>> forgotPassword(
            @RequestBody ForgotPasswordRequest request) {

        ResponseDto<String> response = userService.forgotPassword(request);
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
    public ResponseEntity<ResponseDto<Void>> logout(HttpServletRequest request) {
        request.getSession().invalidate();
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(ResponseDto.success(null, "Logged out"));
    }


}
