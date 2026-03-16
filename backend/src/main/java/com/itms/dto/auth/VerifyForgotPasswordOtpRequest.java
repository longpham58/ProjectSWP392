package com.itms.dto.auth;

import lombok.Data;

@Data
public class VerifyForgotPasswordOtpRequest {
    private String email;
    private String otp;
}
