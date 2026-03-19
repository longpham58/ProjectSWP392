package com.itms.controller;

import com.itms.dto.TrainerScheduleDto;
import com.itms.dto.common.ResponseDto;
import com.itms.entity.Course;
import com.itms.security.CustomUserDetails;
import com.itms.service.TrainerScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trainer/schedule")
@RequiredArgsConstructor
public class TrainerScheduleController {

    private final TrainerScheduleService trainerScheduleService;

    /**
     * Get all sessions for the logged-in trainer
     */
    @GetMapping
    public ResponseEntity<ResponseDto<List<TrainerScheduleDto>>> getTrainerSchedule(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Integer trainerId = userDetails.getId();
        System.out.println("🎯 [TrainerScheduleController] GET /schedule - Trainer ID: " + trainerId);
        
        try {
            List<TrainerScheduleDto> schedule = trainerScheduleService.getTrainerSchedule(trainerId);
            
            System.out.println("📤 [TrainerScheduleController] Returning " + schedule.size() + " sessions");

            return ResponseEntity.ok(
                    ResponseDto.success(schedule, "Schedule retrieved successfully")
            );
        } catch (Exception e) {
            System.err.println("❌ [TrainerScheduleController] Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(ResponseDto.error("Failed to fetch schedule: " + e.getMessage()));
        }
    }

    /**
     * Get session details by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ResponseDto<TrainerScheduleDto>> getSessionById(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        System.out.println("🎯 [TrainerScheduleController] GET /schedule/" + id);
        
        try {
            TrainerScheduleDto session = trainerScheduleService.getSessionById(id, userDetails.getId());

            return ResponseEntity.ok(
                    ResponseDto.success(session, "Session retrieved successfully")
            );
        } catch (Exception e) {
            System.err.println("❌ [TrainerScheduleController] Error: " + e.getMessage());
            return ResponseEntity.status(500)
                    .body(ResponseDto.error("Failed to fetch session: " + e.getMessage()));
        }
    }

    /**
     * Get trainer's courses for dropdown
     */
    @GetMapping("/courses")
    public ResponseEntity<ResponseDto<List<Course>>> getTrainerCourses(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Integer trainerId = userDetails.getId();
        System.out.println("🎯 [TrainerScheduleController] GET /schedule/courses - Trainer ID: " + trainerId);
        
        try {
            List<Course> courses = trainerScheduleService.getTrainerCourses(trainerId);
            
            return ResponseEntity.ok(
                    ResponseDto.success(courses, "Courses retrieved successfully")
            );
        } catch (Exception e) {
            System.err.println("❌ [TrainerScheduleController] Error: " + e.getMessage());
            return ResponseEntity.status(500)
                    .body(ResponseDto.error("Failed to fetch courses: " + e.getMessage()));
        }
    }
}
