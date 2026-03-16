package com.itms.controller;

import com.itms.dto.HrDashboardStatsDto;
import com.itms.dto.common.ResponseDto;
import com.itms.service.HrDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hr/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('HR')")
public class HrDashboardController {

    private final HrDashboardService hrDashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ResponseDto<HrDashboardStatsDto>> getStats() {
        return ResponseEntity.ok(ResponseDto.success(hrDashboardService.getStats(), "HR dashboard stats retrieved"));
    }
}
