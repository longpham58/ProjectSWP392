package com.itms.service;

import com.itms.dto.DepartmentDto;
import com.itms.dto.UserInfo;
import com.itms.dto.auth.*;
import com.itms.dto.common.ResponseDto;
import com.itms.entity.User;
import com.itms.entity.UserRole;
import com.itms.repository.UserRepository;
import com.itms.security.CustomUserDetails;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final JwtService jwtService;
    private final EmailService emailService;

    public ResponseDto<LoginResponse> login(
            LoginRequest request,
            HttpServletRequest httpRequest
    ) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Username not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        boolean otpRequired = user.getOtpEnabled();

        if (otpRequired) {
            HttpSession session = httpRequest.getSession(true);
            otpService.generateOtpForUser(user.getId(), user.getEmail());
            session.setAttribute("OTP_USER_ID", user.getId());
            return ResponseDto.success(buildLoginResponse(user, true), "OTP required");
        }

        authenticateUser(user, httpRequest, request.isRememberMe());

        return ResponseDto.success(buildLoginResponse(user, false), "Login successful");
    }
    public ResponseDto<LoginResponse> verifyOtp(
            VerifyOtpRequest request,
            HttpServletRequest HttpRequest
    ) {
        // 1️⃣ Get userId from session (set during login)
        HttpSession session = HttpRequest.getSession(false);
        Integer userId = (Integer) session.getAttribute("OTP_USER_ID");
        // 2️⃣ Verify OTP for THAT user
        otpService.validateOtp(userId, request.getOtp());

        // 3️⃣ Load user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 4️⃣ Authenticate → Spring Security creates session
        authenticateUser(user, HttpRequest, false);

        // 5️⃣ Cleanup
        session.removeAttribute("OTP_USER_ID");

        return ResponseDto.success(
                buildLoginResponse(user, false),
                "Login successful"
        );
    }

    public ResponseDto<String> forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail())
                .ifPresent(this::sendPasswordResetEmail);

        return ResponseDto.success(
                null,
                "If an account exists, a reset link has been sent."
        );
    }

    // --------------------------
    // Reset password
    // --------------------------
    public ResponseDto<Void> resetPassword(ResetPasswordRequest request) {

        Claims claims = jwtService.validateAndGetClaims(request.getToken());

        if (!"RESET_PASSWORD".equals(claims.get("type"))) {
            throw new RuntimeException("Invalid reset token");
        }

        int userId = Integer.parseInt(claims.getSubject());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseDto.success(null, "Password reset successful");
    }

    public ResponseDto<UserInfo> getMe(Authentication authentication) {


        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User is not authenticated");
        }
        Object principal = authentication.getPrincipal();

        User user;

        if (principal instanceof CustomUserDetails userDetails) {
            // 🔐 Normal username/password login
            user = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

        } else if (principal instanceof OAuth2User oauthUser) {
            // 🔑 Google OAuth2 login
            String email = oauthUser.getAttribute("email");

            user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

        } else {
            throw new RuntimeException("Unsupported authentication principal");
        }

        DepartmentDto departmentDto = null;
        if (user.getDepartment() != null) {
            departmentDto = DepartmentDto.builder()
                    .id(user.getDepartment().getId())
                    .name(user.getDepartment().getName())
                    .build();
        }

        List<String> roles = user.getUserRole().stream()
                .filter(UserRole::getIsActive)
                .map(ur -> ur.getRole().getRoleCode())
                .toList();

        UserInfo userInfo = UserInfo.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .roles(roles)
                .isActive(user.getIsActive())
                .otpEnabled(user.getOtpEnabled())
                .lastLogin(user.getLastLogin())
                .department(departmentDto)
                .build();

        return ResponseDto.success(userInfo, "Current logged-in user");
    }

    public ResponseDto<LoginResponse> handleGoogleLogin(OAuth2User oauthUser, HttpServletRequest request) {

        String email = oauthUser.getAttribute("email");

        if (email == null || email.isBlank()) {
            return ResponseDto.fail("oauth_email_not_found");
        }

        User user = userRepository.findByEmail(email)
                .orElse(null);
        if (user == null) {
            return ResponseDto.fail("account_not_registered");
        }
        authenticateUser(user, request, false); // ✅ session-based auth

        return ResponseDto.success(
                buildLoginResponse(user, false),
                "Login successful"
        );
    }

    private LoginResponse buildLoginResponse(User user, boolean otpRequired) {

        List<String> roles = user.getUserRole().stream()
                .filter(UserRole::getIsActive)
                .map(ur -> ur.getRole().getRoleCode())
                .toList();
        return LoginResponse.builder()
                .otpRequired(otpRequired)
                .email(user.getEmail())
                .roles(roles)
                .build();
    }
    private void authenticateUser(User user, HttpServletRequest request,  boolean rememberMe) {

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        CustomUserDetails userDetails = new CustomUserDetails(user);

        Authentication  authentication =
                new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);

        SecurityContextHolder.setContext(context);

        HttpSession session = request.getSession(true);

        int timeout = rememberMe ? 30 * 24 * 60 * 60 : 30 * 60;
        session.setMaxInactiveInterval(timeout);

        session.setAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                context
        );
    }

    public void sendPasswordResetEmail(User user) {

        String token = jwtService.generatePasswordResetToken(user);

        String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8);

        String link = "http://localhost:5173/reset-password?token=" + encodedToken;

        String subject = "Reset your ITMS password";

        String body = """
        Click the link below to reset your password:

        %s

        This link will expire in 15 minutes.
        """.formatted(link);

        emailService.sendEmail(user.getEmail(), subject, body);
    }


}
