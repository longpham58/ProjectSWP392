package com.itms.dto.auth;

import com.itms.common.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String email;
    private UserRole role;
    private boolean otpRequired;
}
