package com.itms.controller;

import com.itms.dto.TrainerScheduleDto;
import com.itms.dto.common.ResponseDto;
import com.itms.service.TrainerScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trainer/schedule")
@RequiredArgsConstructor
public class TrainerScheduleController {

    private final TrainerScheduleService trainerScheduleService;

    /**
     * Get all sessions for the authenticated trainer
     */
    @GetMapping
    public ResponseEntity<ResponseDto<List<TrainerScheduleDto>>> getTrainerSchedule(Authentication authentication) {
        // Get trainer ID from authentication
        Integer trainerId = getUserIdFromAuth(authentication);
        
        List<TrainerScheduleDto> schedule = trainerScheduleService.getTrainerSchedule(trainerId);
        
        return ResponseEntity.ok(ResponseDto.<List<TrainerScheduleDto>>builder()
                .success(true)
                .message("Lấy lịch giảng dạy thành công")
                .data(schedule)
                .build());
    }

    /**
     * Extract user ID from authentication
     */
    private Integer getUserIdFromAuth(Authentication authentication) {
        // This is a placeholder - implement based on your authentication setup
        // You might need to cast authentication.getPrincipal() to your User object
        return 2; // Default to trainer001 for testing
    }
}
