package com.itms.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.itms.dto.UserInfo;
import com.itms.dto.auth.*;
import com.itms.dto.common.ResponseDto;
import com.itms.entity.User;
import com.itms.repository.UserRepository;
import com.itms.security.JwtTokenUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenProvider;
    private final GoogleService googleService;
    private final OtpService otpService;

    public ResponseDto<LoginResponse> login(LoginRequest request, HttpServletResponse response , String deviceToken) {
        // Find user by username
        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Username not found"));

        // Check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        boolean otpRequired = user.isOtpEnabled(); // assume your User entity has this flag
        // Check trusted device
        if (deviceToken != null && jwtTokenProvider.validateDeviceToken(deviceToken, user.getUsername())) {
            otpRequired = false;
        }
        String token = null;

        if (otpRequired) {
            // Generate OTP and send to user (email or SMS)
            otpService.generateOtpForUser(user.getUsername(), user.getEmail(), "LOGIN_2FA");
        } else {
            // Generate JWT token directly
            token = jwtTokenProvider.generateToken(user.getUsername(), user.getRole());
        }

        // Remember Account → cookie with username
        if (Boolean.TRUE.equals(request.getRememberAccount())) {
            Cookie accountCookie = new Cookie("rememberAccount", user.getUsername());
            accountCookie.setHttpOnly(true);
            accountCookie.setMaxAge(30 * 24 * 60 * 60); // 30 days
            accountCookie.setPath("/");
            response.addCookie(accountCookie);
        }
        // Remember Device → create device token cookie
        if (Boolean.TRUE.equals(request.getRememberDevice())) {
            String newDeviceToken = jwtTokenProvider.generateDeviceToken(user.getUsername());
            Cookie deviceCookie = new Cookie("deviceToken", newDeviceToken);
            deviceCookie.setHttpOnly(true);
            deviceCookie.setMaxAge(30 * 24 * 60 * 60); // 30 days
            deviceCookie.setPath("/");
            response.addCookie(deviceCookie);
        }

        return ResponseDto.success(buildLoginResponse(user, token, otpRequired),
                otpRequired ? "OTP required" : "Login successful");
    }

    public ResponseDto<LoginResponse> verifyOtp(String username, String otp) {
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Username not found"));

        // Validate OTP
        boolean isValidOtp = otpService.validateOtp(username, otp);
        if (!isValidOtp) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        // OTP correct → generate JWT
        String token = jwtTokenProvider.generateToken(user.getUsername(), user.getRole());

        return ResponseDto.success(buildLoginResponse(user, token, false)
                , "Login successful");
    }

    public ResponseDto<Void> forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByUsername(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email not registered"));

        String otp = otpService.generateOtpForUser(user.getUsername(), user.getEmail(), "RESET_PASSWORD");
        System.out.println(otp);
        return ResponseDto.success(null, "Password reset OTP sent to email");
    }

    // --------------------------
    // Reset passwordsendOtp
    // --------------------------
    public ResponseDto<Void> resetPassword(ResetPasswordRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean validOtp = otpService.validateOtp(user.getUsername(), request.getOtp());
        if (!validOtp) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseDto.success(null, "Password reset successfully");
    }


    // --------------------------
    // Login with Google
    // --------------------------
    public ResponseDto<LoginResponse> loginWithGoogle(GoogleLoginRequest request) {
        GoogleIdToken.Payload payload = googleService.verifyIdToken(request.getIdToken());
        if (payload == null) {
            throw new RuntimeException("Invalid Google token");
        }

        String email = payload.getEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not registered"));

        String token = jwtTokenProvider.generateToken(user.getUsername(), user.getRole());

        return ResponseDto.success(buildLoginResponse(user, token, false), "Login successful");
    }

    public ResponseDto<UserInfo> getMe(Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User is not authenticated");
        }

        // Username extracted from JWT
        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserInfo userInfo = UserInfo.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .department(user.getDepartment())
                .build();

        return ResponseDto.success(userInfo, "Current logged-in user");
    }

    private LoginResponse buildLoginResponse(User user, String token, boolean otpRequired) {
        return LoginResponse.builder()
                .token(token)
                .otpRequired(otpRequired)
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
