package com.itms.service;

import com.itms.dto.auth.LoginRequest;
import com.itms.dto.auth.LoginResponse;
import com.itms.dto.common.ResponseDto;
import com.itms.repository.UserRepository;
import com.itms.security.JwtTokenUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenProvider;

    public ResponseDto<LoginResponse> login(LoginRequest request) {
        // Find user by username
        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Username not found"));

        // Check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        // Generate JWT token
        String token = jwtTokenProvider.generateToken(user.getUsername(),user.getRole());

        // Build user info for response
        LoginResponse.UserInfo userInfo = LoginResponse.UserInfo.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .departmentId(user.getDepartment() != null ? user.getDepartment().getId() : null)
                .build();

        // Build login response
        LoginResponse loginResponse = LoginResponse.builder()
                .success(true)
                .message("Login successful")
                .token(token)
                .user(userInfo)
                .build();

        // Wrap in ResponseDto
        return ResponseDto.success(loginResponse, "Login successful");
    }
}
