package com.itms.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResetPasswordRequest {
    private String token;       // 🔐 JWT reset token from email link
    private String newPassword; // 🔑 new password
}
