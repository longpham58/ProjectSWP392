package com.itms.dto.auth;

import com.itms.entity.Role;
import com.itms.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String email;
    private List<String> roles;
    private boolean otpRequired;
}
