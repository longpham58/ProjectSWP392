package com.itms.dto.auth;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
    private Boolean rememberAccount; // optional
    private Boolean rememberDevice;  // optional
}
