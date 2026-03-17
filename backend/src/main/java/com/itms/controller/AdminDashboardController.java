package com.itms.controller;

import com.itms.common.CourseStatus;
import com.itms.dto.AdminAnalyticsDto;
import com.itms.dto.AdminClassDto;
import com.itms.dto.AdminCourseDto;
import com.itms.dto.AdminCourseDetailDto;
import com.itms.dto.AdminDashboardDto;
import com.itms.dto.AdminNotificationDto;
import com.itms.dto.common.ResponseDto;
import com.itms.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
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
    
    @GetMapping("/courses")
    public ResponseEntity<ResponseDto<List<AdminCourseDto>>> getAllCourses(
            @RequestParam(required = false) CourseStatus status) {
        List<AdminCourseDto> courses = adminService.getCoursesByStatus(status);
        return ResponseEntity.ok(
                ResponseDto.success(courses, "Courses retrieved successfully")
        );
    }
    
    @GetMapping("/classes")
    public ResponseEntity<ResponseDto<List<AdminClassDto>>> getAllClasses() {
        List<AdminClassDto> classes = adminService.getAllClasses();
        return ResponseEntity.ok(
                ResponseDto.success(classes, "Classes retrieved successfully")
        );
    }
    
    @GetMapping("/courses/{id}")
    public ResponseEntity<ResponseDto<AdminCourseDetailDto>> getCourseById(@PathVariable Integer id) {
        AdminCourseDetailDto course = adminService.getCourseDetailById(id);
        return ResponseEntity.ok(
                ResponseDto.success(course, "Course retrieved successfully")
        );
    }

    @GetMapping("/analytics")
    public ResponseEntity<ResponseDto<AdminAnalyticsDto>> getAnalytics() {
        AdminAnalyticsDto analytics = adminService.getAnalytics();
        return ResponseEntity.ok(
                ResponseDto.success(analytics, "Analytics data retrieved successfully")
        );
    }

    // ========== NOTIFICATIONS ==========
    @GetMapping("/notifications")
    public ResponseEntity<ResponseDto<List<AdminNotificationDto>>> getAllNotifications(
            @RequestParam(required = false) Boolean isDraft) {
        List<AdminNotificationDto> notifications = adminService.getAllNotifications(isDraft);
        return ResponseEntity.ok(
                ResponseDto.success(notifications, "Notifications retrieved successfully")
        );
    }

    @GetMapping("/notifications/{id}")
    public ResponseEntity<ResponseDto<AdminNotificationDto>> getNotificationById(@PathVariable Integer id) {
        AdminNotificationDto notification = adminService.getNotificationById(id);
        return ResponseEntity.ok(
                ResponseDto.success(notification, "Notification retrieved successfully")
        );
    }

    @PostMapping("/notifications")
    public ResponseEntity<ResponseDto<AdminNotificationDto>> createNotification(
            @RequestBody AdminNotificationDto dto) {
        try {
            log.info("Creating notification: {}", dto);
            AdminNotificationDto notification = adminService.createNotification(dto);
            log.info("Notification created successfully: {}", notification);
            return ResponseEntity.ok(
                    ResponseDto.success(notification, "Notification created successfully")
            );
        } catch (Exception e) {
            log.error("Error creating notification: ", e);
            return ResponseEntity.badRequest()
                    .body(ResponseDto.error("Failed to create notification: " + e.getMessage()));
        }
    }

    @PutMapping("/notifications/{id}")
    public ResponseEntity<ResponseDto<AdminNotificationDto>> updateNotification(
            @PathVariable Integer id,
            @RequestBody AdminNotificationDto dto) {
        AdminNotificationDto notification = adminService.updateNotification(id, dto);
        return ResponseEntity.ok(
                ResponseDto.success(notification, "Notification updated successfully")
        );
    }

    @PostMapping("/notifications/{id}/send")
    public ResponseEntity<ResponseDto<AdminNotificationDto>> sendNotification(@PathVariable Integer id) {
        AdminNotificationDto notification = adminService.sendNotification(id);
        return ResponseEntity.ok(
                ResponseDto.success(notification, "Notification sent successfully")
        );
    }

    @DeleteMapping("/notifications/{id}")
    public ResponseEntity<ResponseDto<Void>> deleteNotification(@PathVariable Integer id) {
        adminService.deleteNotification(id);
        return ResponseEntity.ok(
                ResponseDto.success(null, "Notification deleted successfully")
        );
    }
}
