package com.itms.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
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

    // In-memory store for OTPs: username -> OTP + expiration
    private final Map<String, OtpEntry> otpCache = new ConcurrentHashMap<>();

    private final Random random = new Random();

    private final EmailService emailService;

    /**
     * Generate a 6-digit OTP for a username
     */
    public String generateOtpForUser(String username, String email, String purpose) {
        String otp = String.format("%06d", random.nextInt(1_000_000));
        OtpEntry entry = new OtpEntry(otp, LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES));
        otpCache.put(username.toLowerCase(), entry);
        sendOtpEmail(email, otp, purpose);
        return otp;
    }

    public void sendOtpEmail(String email, String otp, String purpose) {
        String subject;
        String body;

        if ("LOGIN_2FA".equals(purpose)) {
            subject = "Your ITMS 2FA Login OTP Code";
            body = "Your login OTP is: " + otp + "\nExpires in 5 minutes.";
        } else if ("RESET_PASSWORD".equals(purpose)) {
            subject = "Your ITMS Password Reset OTP Code";
            body = "Your password reset OTP is: " + otp + "\nExpires in 5 minutes.";
        } else {
            subject = "Your ITMS OTP Code";
            body = "Your OTP is: " + otp + "\nExpires in 5 minutes.";
        }

        emailService.sendEmail(email, subject, body);
    }

    /**
     * Validate OTP for a username
     */
    public boolean validateOtp(String username, String otp) {
        OtpEntry entry = otpCache.get(username.toLowerCase());
        if (entry == null) return false;

        boolean valid = entry.getOtp().equals(otp) && LocalDateTime.now().isBefore(entry.getExpiresAt());
        if (valid) {
            otpCache.remove(username.toLowerCase()); // Consume OTP
        }
        return valid;
    }

    /**
     * OTP entry holder
     */
    private static class OtpEntry {
        private final String otp;
        private final LocalDateTime expiresAt;

        public OtpEntry(String otp, LocalDateTime expiresAt) {
            this.otp = otp;
            this.expiresAt = expiresAt;
        }

        public String getOtp() {
            return otp;
        }

        public LocalDateTime getExpiresAt() {
            return expiresAt;
        }
    }
}
