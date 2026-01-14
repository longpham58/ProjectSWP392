package com.itms.service;

import com.itms.exception.OtpException;
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

    // userId -> OTP entry
    private final Map<String, OtpEntry> otpCache = new ConcurrentHashMap<>();


    private final Random random = new Random();
    private final EmailService emailService;

    private String key(int userId, String purpose) {
        return userId + ":" + purpose;
    }
    /**
     * Generate OTP for a user
     */
    public String generateOtpForUser(int userId, String email, String purpose) {
        int bound = (int) Math.pow(10, OTP_LENGTH);
        String format = "%0" + OTP_LENGTH + "d";

        String otp = String.format(format, random.nextInt(bound));

        OtpEntry entry = new OtpEntry(
                otp,
                LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES)
        );

        otpCache.put(key(userId, purpose), entry);
        sendOtpEmail(email, otp, purpose);

        return otp;
    }

    /**
     * Validate OTP for a user
     */
    public void validateOtp(int userId, String otp, String purpose) {
        String cacheKey = key(userId, purpose);
        OtpEntry entry = otpCache.get(cacheKey);

        if (entry == null) {
            throw new OtpException("OTP not found");
        }

        if (LocalDateTime.now().isAfter(entry.getExpiresAt())) {
            otpCache.remove(cacheKey);
            throw new OtpException("OTP expired");
        }

        if (!entry.getOtp().equals(otp)) {
            throw new OtpException("Invalid OTP");
        }

        // ✅ OTP hợp lệ → consume
        otpCache.remove(cacheKey);
    }

    private void sendOtpEmail(String email, String otp, String purpose) {
        String subject;
        String body;

        switch (purpose) {
            case "LOGIN_2FA" -> {
                subject = "Your ITMS 2FA Login OTP Code";
                body = "Your login OTP is: " + otp + "\nExpires in 5 minutes.";
            }
            case "RESET_PASSWORD" -> {
                subject = "Your ITMS Password Reset OTP Code";
                body = "Your password reset OTP is: " + otp + "\nExpires in 5 minutes.";
            }
            default -> {
                subject = "Your ITMS OTP Code";
                body = "Your OTP is: " + otp + "\nExpires in 5 minutes.";
            }
        }

        emailService.sendEmail(email, subject, body);
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
