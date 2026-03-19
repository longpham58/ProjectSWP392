package com.itms.controller;

import com.itms.dto.TrainerNotificationDto;
import com.itms.dto.TrainerNotificationRequest;
import com.itms.dto.common.ResponseDto;
import com.itms.security.CustomUserDetails;
import com.itms.service.TrainerNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trainer/notifications")
@RequiredArgsConstructor
public class TrainerNotificationController {

    private final TrainerNotificationService trainerNotificationService;

    // Get notifications by category (inbox, sent, draft)
    @GetMapping
    public ResponseEntity<ResponseDto<List<TrainerNotificationDto>>> getNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(value = "category", defaultValue = "inbox") String category) {

        Integer trainerId = userDetails.getId();
        List<TrainerNotificationDto> notifications = 
                trainerNotificationService.getNotificationsByCategory(trainerId, category);

        return ResponseEntity.ok(
                ResponseDto.success(notifications, "Retrieved " + category + " notifications successfully")
        );
    }

    // Create notification (draft or send immediately)
    @PostMapping
    public ResponseEntity<ResponseDto<TrainerNotificationDto>> createNotification(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody TrainerNotificationRequest request) {

        Integer trainerId = userDetails.getId();
        TrainerNotificationDto notification = 
                trainerNotificationService.createNotification(trainerId, request);

        return ResponseEntity.ok(
                ResponseDto.success(notification, 
                        request.getIsDraft() ? "Draft saved successfully" : "Notification sent successfully")
        );
    }

    // Update draft notification
    @PutMapping("/{id}")
    public ResponseEntity<ResponseDto<TrainerNotificationDto>> updateNotification(
            @PathVariable("id") Integer id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody TrainerNotificationRequest request) {

        Integer trainerId = userDetails.getId();
        TrainerNotificationDto notification = 
                trainerNotificationService.updateNotification(id, trainerId, request);

        return ResponseEntity.ok(
                ResponseDto.success(notification, "Draft updated successfully")
        );
    }

    // Send notification (convert draft to sent)
    @PostMapping("/{id}/send")
    public ResponseEntity<ResponseDto<Void>> sendNotification(
            @PathVariable("id") Integer id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Integer trainerId = userDetails.getId();
        trainerNotificationService.sendNotification(id, trainerId);

        return ResponseEntity.ok(
                ResponseDto.success(null, "Notification sent successfully")
        );
    }

    // Delete notification
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDto<Void>> deleteNotification(
            @PathVariable("id") Integer id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Integer trainerId = userDetails.getId();
        trainerNotificationService.deleteNotification(id, trainerId);

        return ResponseEntity.ok(
                ResponseDto.success(null, "Notification deleted successfully")
        );
    }

    // Mark inbox notification as read
    @PutMapping("/{id}/read")
    public ResponseEntity<ResponseDto<Void>> markAsRead(@PathVariable("id") Integer id) {

        trainerNotificationService.markAsRead(id);

        return ResponseEntity.ok(
                ResponseDto.success(null, "Notification marked as read")
        );
    }

    // Get trainer's courses (for class selection in notification)
    @GetMapping("/available-courses")
    public ResponseEntity<ResponseDto<List<Map<String, String>>>> getTrainerCourses(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Integer trainerId = userDetails.getId();
        System.out.println("🎯 [TrainerNotificationController] GET /available-courses - Trainer ID: " + trainerId);
        System.out.println("👤 [TrainerNotificationController] User: " + userDetails.getUsername());
        
        List<Map<String, String>> courses = trainerNotificationService.getTrainerCourses(trainerId);
        
        System.out.println("📤 [TrainerNotificationController] Sending response with " + courses.size() + " courses");

        return ResponseEntity.ok(
                ResponseDto.success(courses, "Trainer courses retrieved successfully")
        );
    }
    
    // DEBUG: Get all courses (for testing)
    @GetMapping("/debug/all-courses")
    public ResponseEntity<ResponseDto<List<Map<String, String>>>> getAllCoursesDebug(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        System.out.println("🐛 [DEBUG] Getting ALL courses for debugging");
        System.out.println("👤 [DEBUG] Current user: " + userDetails.getUsername() + " (ID: " + userDetails.getId() + ")");
        
        List<Map<String, String>> allCourses = trainerNotificationService.getAllCoursesDebug();
        
        System.out.println("📤 [DEBUG] Total courses in database: " + allCourses.size());
        
        return ResponseEntity.ok(
                ResponseDto.success(allCourses, "All courses retrieved (DEBUG)")
        );
    }
}
