package com.itms.service;

import com.itms.dto.DepartmentDto;
import com.itms.dto.UserDto;
import com.itms.dto.UserInfo;
import com.itms.dto.auth.*;
import com.itms.dto.common.ResponseDto;
import com.itms.entity.Department;
import com.itms.entity.Role;
import com.itms.entity.User;
import com.itms.entity.UserRole;
import com.itms.exception.AccountLockedException;
import com.itms.repository.DepartmentRepository;
import com.itms.repository.RoleRepository;
import com.itms.repository.UserRepository;
import com.itms.repository.UserRoleRepository;
import com.itms.security.CustomUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.opencsv.CSVReader;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final JwtService jwtService;
    private final EmailService emailService;

    @Transactional
    public ResponseDto<LoginResponse> login(
            LoginRequest request,
            HttpServletRequest httpRequest
    ) {
        User user = userRepository.findByUsernameWithRole(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Username not found"));

        // Check if account is active
        if (user.getIsActive() == null || !user.getIsActive()) {
            throw new RuntimeException("Account is deactivated. Please contact administrator.");
        }

        // Check if account is locked
        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(java.time.LocalDateTime.now())) {
            throw new AccountLockedException(
                "Account is locked. Please try again later or contact administrator.",
                user.getLockedUntil()
            );
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            // Increment failed login attempts
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
            
            // Lock account after 5 failed attempts
            if (user.getFailedLoginAttempts() >= 5) {
                user.setLockedUntil(java.time.LocalDateTime.now().plusMinutes(30));
            }
            
            userRepository.save(user);
            throw new RuntimeException("Invalid password");
        }

        // Reset failed login attempts on successful login
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

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
        if (session == null) {
            throw new AuthenticationCredentialsNotFoundException("OTP session expired");
        }
        Integer userId = (Integer) session.getAttribute("OTP_USER_ID");
        if (userId == null) {
            throw new AuthenticationCredentialsNotFoundException("OTP session expired");
        }
        // 2️⃣ Verify OTP for THAT user
        otpService.validateOtp(userId, request.getOtp());

        // 3️⃣ Load user
        User user = userRepository.findById(userId)
                .map(u -> userRepository.findByUsernameWithRole(u.getUsername()).orElse(u))
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
        // Check if email exists
        var userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            // Don't reveal if email exists
            return ResponseDto.success(null, "If an account exists, an OTP has been sent.");
        }
        
        // Generate OTP for forgot password
        otpService.generateOtpForForgotPassword(request.getEmail());

        return ResponseDto.success(
                null,
                "If an account exists, an OTP has been sent to your email."
        );
    }
    
    // --------------------------
    // Verify Forgot Password OTP
    // --------------------------
    public ResponseDto<String> verifyForgotPasswordOtp(
            String email,
            String otp,
            HttpServletRequest httpRequest
    ) {
        // Validate OTP
        int userId = otpService.validateForgotPasswordOtp(email, otp);
        
        // Store user ID in session for password reset
        HttpSession session = httpRequest.getSession(true);
        session.setAttribute("PASSWORD_RESET_USER_ID", userId);
        session.setMaxInactiveInterval(10 * 60); // 10 minutes
        
        return ResponseDto.success(null, "OTP verified successfully. Please enter your new password.");
    }
    
    // --------------------------
    // Reset password (after OTP verification)
    // --------------------------
    public ResponseDto<Void> resetPassword(ResetPasswordRequest request, HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session == null) {
            throw new RuntimeException("Session expired. Please try again.");
        }
        
        Integer userId = (Integer) session.getAttribute("PASSWORD_RESET_USER_ID");
        if (userId == null) {
            throw new RuntimeException("Invalid session. Please try again.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        // Clear session
        session.removeAttribute("PASSWORD_RESET_USER_ID");

        return ResponseDto.success(null, "Password reset successful");
    }

    // --------------------------
    // Request OTP for forgot password
    // --------------------------
    public ResponseDto<String> requestForgotPasswordOtp(ForgotPasswordRequest request) {
        // Check if email exists
        var userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            // Don't reveal if email exists
            return ResponseDto.success(null, "If an account exists, an OTP has been sent.");
        }
        
        // Generate OTP for forgot password
        otpService.generateOtpForForgotPassword(request.getEmail());

        return ResponseDto.success(
                null,
                "If an account exists, an OTP has been sent to your email."
        );
    }

    // --------------------------
    // Import users from file
    // --------------------------
    @Transactional
    public int importUsers(MultipartFile file) throws Exception {
        int count = 0;
        
        List<String[]> rows = new ArrayList<>();
        String filename = file.getOriginalFilename();
        
        try {
            if (filename != null && filename.endsWith(".xlsx")) {
                // Read Excel file
                InputStream inputStream = file.getInputStream();
                Workbook workbook = new XSSFWorkbook(inputStream);
                Sheet sheet = workbook.getSheetAt(0);
                Iterator<Row> rowIterator = sheet.iterator();
                
                while (rowIterator.hasNext()) {
                    Row row = rowIterator.next();
                    if (row.getRowNum() == 0) {
                        // Skip header row
                        continue;
                    }
                    
                    List<String> rowData = new ArrayList<>();
                    for (int i = 0; i < 6; i++) {
                        Cell cell = row.getCell(i, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
                        rowData.add(getCellValue(cell));
                    }
                    
                    if (!rowData.isEmpty() && !rowData.get(1).isEmpty()) {
                        rows.add(rowData.toArray(new String[0]));
                    }
                }
                
                workbook.close();
            } else {
                // Read CSV file
                CSVReader csvReader = new CSVReader(new java.io.InputStreamReader(file.getInputStream()));
                rows = csvReader.readAll();
                csvReader.close();
            }
        } catch (Exception e) {
            // If parsing fails, return 0
            throw new Exception("Failed to parse file: " + e.getMessage());
        }
        
        // Process rows (skip header if CSV)
        for (String[] row : rows) {
            if (row.length < 2) continue;
            
            // Column order: Username, Email, FullName, Phone, Department, Role
            String username = row.length > 0 ? row[0].trim() : "";
            String email = row.length > 1 ? row[1].trim() : "";
            String fullName = row.length > 2 ? row[2].trim() : "";
            String phone = row.length > 3 ? row[3].trim() : "";
            String department = row.length > 4 ? row[4].trim() : "";
            String roleCode = row.length > 5 ? row[5].trim().toUpperCase() : "EMPLOYEE";
            
            // Skip empty rows
            if (email.isEmpty()) continue;
            
            // Validate and sanitize phone (max 20 chars for NVARCHAR(20))
            if (phone.length() > 20) {
                phone = phone.substring(0, 20);
            }
            
            // Check if user already exists
            var existingUser = userRepository.findByEmail(email);
            if (existingUser.isEmpty()) {
                // Generate temporary password
                String tempPassword = generateTempPassword();
                
                User newUser = new User();
                newUser.setUsername(username.isEmpty() ? email.split("@")[0] : username);
                newUser.setEmail(email);
                newUser.setFullName(fullName.isEmpty() ? email.split("@")[0] : fullName);
                newUser.setPhone(phone.isEmpty() ? null : phone);
                newUser.setPassword(passwordEncoder.encode(tempPassword));
                newUser.setIsActive(true);
                
                // Set department if provided
                if (!department.isEmpty()) {
                    Optional<Department> dept = departmentRepository.findByName(department);
                    dept.ifPresent(newUser::setDepartment);
                }
                
                userRepository.save(newUser);
                
                // Set role
                Optional<Role> roleOpt = roleRepository.findByRoleCode(roleCode);
                Role role = roleOpt.orElseGet(() -> roleRepository.findByRoleCode("EMPLOYEE").orElse(null));
                if (role != null) {
                    UserRole userRole = new UserRole();
                    userRole.setUser(newUser);
                    userRole.setRole(role);
                    userRole.setIsActive(true);
                    // Save UserRole to repository to ensure it's persisted
                    userRoleRepository.save(userRole);
                }
                
                // Send welcome email
                sendWelcomeEmail(newUser, tempPassword);
                
                count++;
            }
        }
        return count;
    }
    
    // Helper method to get cell value as string
    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        
        try {
            switch (cell.getCellType()) {
                case STRING:
                    return cell.getStringCellValue().trim();
                case NUMERIC:
                    if (DateUtil.isCellDateFormatted(cell)) {
                        return cell.getDateCellValue().toString();
                    }
                    // Return as integer string (remove decimals)
                    long numValue = (long) cell.getNumericCellValue();
                    return String.valueOf(numValue);
                case BOOLEAN:
                    return String.valueOf(cell.getBooleanCellValue());
                case FORMULA:
                    return cell.getCellFormula();
                default:
                    return "";
            }
        } catch (Exception e) {
            // If any error occurs reading cell, return empty string
            return "";
        }
    }

    private String generateTempPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    private void sendWelcomeEmail(User user, String tempPassword) {
        try {
            String subject = "Welcome to ITMS - Your Account Details";
            
            String body = """
                Dear %s,
                
                Welcome to ITMS Training Management System!
                
                Your account has been created. Here are your login details:
                
                Username: %s
                Temporary Password: %s
                
                Please login with the above credentials. After login, you can change your password in your profile settings.
                
                If you need to reset your password, use the "Forgot Password" feature on the login page and verify with OTP.
                
                Best regards,
                ITMS Admin
                """.formatted(user.getFullName(), user.getUsername(), tempPassword);
            
            emailService.sendEmail(user.getEmail(), subject, body);
        } catch (Exception e) {
            System.err.println("Failed to send welcome email: " + e.getMessage());
        }
    }

    public ResponseDto<UserInfo> getMe(Authentication authentication) {


        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AuthenticationCredentialsNotFoundException("User is not authenticated");
        }
        Object principal = authentication.getPrincipal();
        if (principal == null || "anonymousUser".equals(principal)) {
            throw new AuthenticationCredentialsNotFoundException("User is not authenticated");
        }

        User user;

        if (principal instanceof CustomUserDetails userDetails) {
            // 🔐 Normal username/password login — use ID then re-fetch with roles
            Integer userId = userDetails.getId();
            User found = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            user = userRepository.findByUsernameWithRole(found.getUsername())
                    .orElse(found);

        } else if (principal instanceof OAuth2User oauthUser) {
            // 🔑 Google OAuth2 login
            String email = oauthUser.getAttribute("email");
            user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

        } else {
            throw new AuthenticationCredentialsNotFoundException("Unsupported authentication principal");
        }

        DepartmentDto departmentDto = null;
        if (user.getDepartment() != null) {
            departmentDto = DepartmentDto.builder()
                    .id(user.getDepartment().getId())
                    .name(user.getDepartment().getName())
                    .build();
        }

        List<String> roles = user.getUserRole().stream()
                .filter(ur -> Boolean.TRUE.equals(ur.getIsActive()))
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
                .filter(ur -> Boolean.TRUE.equals(ur.getIsActive()))
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

    public List<UserDto> getUsers() {
        List<User> users = userRepository.findAll();
        return users.stream().map(user -> {
            String role = user.getUserRole().stream()
                    .filter(ur -> Boolean.TRUE.equals(ur.getIsActive()))
                    .map(ur -> ur.getRole().getRoleCode())
                    .findFirst()
                    .orElse("EMPLOYEE");
            
            String department = user.getDepartment() != null ? user.getDepartment().getName() : "";
            
            return UserDto.builder()
                    .id(user.getId())
                    .userId(user.getUsername())
                    .fullname(user.getFullName())
                    .email(user.getEmail())
                    .role(role)
                    .status(user.getIsActive() != null && user.getIsActive() ? "Active" : "Inactive")
                    .department(department)
                    .build();
        }).collect(Collectors.toList());
    }

    public void toggleUserStatus(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(!user.getIsActive());
        userRepository.save(user);
    }

    public void deleteUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }


}
