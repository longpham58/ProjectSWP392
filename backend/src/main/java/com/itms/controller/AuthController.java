package com.itms.controller;

import com.itms.dto.auth.LoginRequest;
import com.itms.dto.auth.LoginResponse;
import com.itms.dto.common.ResponseDto;
import com.itms.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth") // matches your form action
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/login")
    public ResponseDto<LoginResponse> login(@RequestBody LoginRequest request) {
        return userService.login(request);
    }
}