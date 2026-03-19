package com.itms.controller;

import com.itms.dto.TrainerNotificationDto;
import com.itms.dto.TrainerNotificationRequest;
import com.itms.dto.common.ResponseDto;
import com.itms.security.CustomUserDetails;
import com.itms.service.HrNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hr/notifications")
@RequiredArgsConstructor
@PreAuthorize("hasRole('HR')")
public class HrNotificationController {

    private final HrNotificationService hrNotificationService;

    @GetMapping
    public ResponseEntity<ResponseDto<List<TrainerNotificationDto>>> getNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(value = "category", defaultValue = "inbox") String category) {
        Integer hrId = userDetails.getId();
        List<TrainerNotificationDto> notifications = hrNotificationService.getNotificationsByCategory(hrId, category);
        return ResponseEntity.ok(ResponseDto.success(notifications, "Retrieved " + category + " notifications successfully"));
    }

    @PostMapping
    public ResponseEntity<ResponseDto<TrainerNotificationDto>> createNotification(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody TrainerNotificationRequest request) {
        Integer hrId = userDetails.getId();
        TrainerNotificationDto notification = hrNotificationService.createNotification(hrId, request);
        return ResponseEntity.ok(ResponseDto.success(notification,
                Boolean.TRUE.equals(request.getIsDraft()) ? "Draft saved successfully" : "Notification sent successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseDto<TrainerNotificationDto>> updateNotification(
            @PathVariable("id") Integer id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody TrainerNotificationRequest request) {
        Integer hrId = userDetails.getId();
        TrainerNotificationDto notification = hrNotificationService.updateNotification(id, hrId, request);
        return ResponseEntity.ok(ResponseDto.success(notification, "Notification updated successfully"));
    }

    @PostMapping("/{id}/send")
    public ResponseEntity<ResponseDto<Void>> sendNotification(
            @PathVariable("id") Integer id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Integer hrId = userDetails.getId();
        hrNotificationService.sendNotification(id, hrId);
        return ResponseEntity.ok(ResponseDto.success(null, "Notification sent successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDto<Void>> deleteNotification(
            @PathVariable("id") Integer id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Integer hrId = userDetails.getId();
        hrNotificationService.deleteNotification(id, hrId);
        return ResponseEntity.ok(ResponseDto.success(null, "Notification deleted successfully"));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ResponseDto<Void>> markAsRead(@PathVariable("id") Integer id) {
        hrNotificationService.markAsRead(id);
        return ResponseEntity.ok(ResponseDto.success(null, "Notification marked as read"));
    }
}
