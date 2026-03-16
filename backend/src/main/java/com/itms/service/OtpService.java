package com.itms.service;

import com.itms.exception.OtpException;
import com.itms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
@RequiredArgsConstructor
public class OtpService {

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRATION_MINUTES = 5;
    private static final int MAX_ATTEMPTS = 5;

    // userId -> OTP entry
    private final Map<Integer, OtpEntry> otpCache = new ConcurrentHashMap<>();
    
    // email -> OTP entry (for forgot password)
    private final Map<String, OtpEntry> forgotPasswordOtpCache = new ConcurrentHashMap<>();



    private final Random random = new Random();
    private final EmailService emailService;
    private final UserRepository userRepository;


    /**
     * Generate OTP for a user
     */
    public void generateOtpForUser(int userId, String email) {
        int bound = (int) Math.pow(10, OTP_LENGTH);
        String format = "%0" + OTP_LENGTH + "d";

        String otp = String.format(format, random.nextInt(bound));
        OtpEntry entry = new OtpEntry(
                otp,
                LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES),
                MAX_ATTEMPTS
        );

        otpCache.put(userId, entry);
        sendOtpEmail(email, otp);
    }
    
    /**
     * Generate OTP for forgot password (using email as key)
     */
    public void generateOtpForForgotPassword(String email) {
        int bound = (int) Math.pow(10, OTP_LENGTH);
        String format = "%0" + OTP_LENGTH + "d";

        String otp = String.format(format, random.nextInt(bound));
        OtpEntry entry = new OtpEntry(
                otp,
                LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES),
                MAX_ATTEMPTS
        );

        forgotPasswordOtpCache.put(email, entry);
        sendForgotPasswordOtpEmail(email, otp);
    }
    
    /**
     * Validate OTP for forgot password
     */
    public int validateForgotPasswordOtp(String email, String otp) {
        OtpEntry entry = forgotPasswordOtpCache.get(email);

        if (entry == null) {
            throw new OtpException("OTP not found or already used");
        }

        if (LocalDateTime.now().isAfter(entry.expiresAt)) {
            forgotPasswordOtpCache.remove(email);
            throw new OtpException("OTP expired");
        }

        if (entry.attemptsLeft <= 0) {
            forgotPasswordOtpCache.remove(email);
            throw new OtpException("Too many failed attempts. OTP locked.");
        }
        if (!entry.otp.equals(otp)) {
            entry.attemptsLeft--;
            throw new OtpException(
                    "Invalid OTP. Attempts left: " + entry.attemptsLeft
            );
        }

        // ✅ OTP valid - get user ID
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new OtpException("User not found"));
        int userId = user.getId();
        
        // Remove OTP after successful validation
        forgotPasswordOtpCache.remove(email);
        
        return userId;
    }

    /**
     * Validate OTP for a user
     */
    public void validateOtp(int userId, String otp) {
        OtpEntry entry = otpCache.get(userId);

        if (entry == null) {
            throw new OtpException("OTP not found");
        }

        if (LocalDateTime.now().isAfter(entry.expiresAt)) {
            otpCache.remove(userId);
            throw new OtpException("OTP expired");
        }


        if (entry.attemptsLeft <= 0) {
            otpCache.remove(userId);
            throw new OtpException("Too many failed attempts. OTP locked.");
        }
        if (!entry.otp.equals(otp)) {
            entry.attemptsLeft--;

            throw new OtpException(
                    "Invalid OTP. Attempts left: " + entry.attemptsLeft
            );
        }

        // ✅ OTP hợp lệ → consume
        otpCache.remove(userId);
    }

    public void resendOtp(int userId) {
        OtpEntry entry = otpCache.get(userId);

        if (entry == null) {
            throw new OtpException("OTP session expired");
        }

        // 🔁 regenerate OTP
        int bound = (int) Math.pow(10, OTP_LENGTH);
        String format = "%0" + OTP_LENGTH + "d";
        String newOtp = String.format(format, random.nextInt(bound));

        // reset OTP
        entry.otp = newOtp;
        entry.expiresAt = LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES);
        entry.attemptsLeft = MAX_ATTEMPTS;
        String email = userRepository.findById(userId)
                .orElseThrow(() -> new OtpException("User not found"))
                .getEmail();
        sendOtpEmail(
                email, // from UserService
                newOtp
        );
    }



    private void sendOtpEmail(String email, String otp) {

        String subject = "Your ITMS Login Verification Code";

        String body = """
        Your one-time login verification code is:

        %s

        This code will expire in 5 minutes.
        If you did not attempt to sign in, please ignore this email.
        """.formatted(otp);

        emailService.sendEmail(email, subject, body);
    }
    
    private void sendForgotPasswordOtpEmail(String email, String otp) {

        String subject = "Your ITMS Password Reset Code";

        String body = """
        Your password reset verification code is:

        %s

        This code will expire in 5 minutes.
        If you did not request a password reset, please ignore this email.
        """.formatted(otp);

        emailService.sendEmail(email, subject, body);
    }



    /**
     * OTP entry holder
     */
    private static class OtpEntry {
        private String otp;
        private LocalDateTime expiresAt;
        private int attemptsLeft;

        private OtpEntry(
                String otp,
                LocalDateTime expiresAt,
                int attemptsLeft
        ) {
            this.otp = otp;
            this.expiresAt = expiresAt;
            this.attemptsLeft = attemptsLeft;
        }
    }

}
