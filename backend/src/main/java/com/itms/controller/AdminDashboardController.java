package com.itms.controller;

import com.itms.dto.AdminDashboardDto;
import com.itms.dto.common.ResponseDto;
import com.itms.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminDashboardController {
    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<ResponseDto<AdminDashboardDto>> getDashboardStats() {
        AdminDashboardDto stats = adminService.getDashboardStats();
        return ResponseEntity.ok(
                ResponseDto.success(stats, "Dashboard stats retrieved successfully")
        );
    }
}
