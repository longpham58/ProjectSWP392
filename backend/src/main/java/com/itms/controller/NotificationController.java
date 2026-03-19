package com.itms.controller;

import com.itms.dto.NotificationDto;
import com.itms.dto.common.ResponseDto;
import com.itms.security.CustomUserDetails;
import com.itms.service.NotificationService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@AllArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    @GetMapping("/my")
    public ResponseEntity<ResponseDto<List<NotificationDto>>> getMyNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        int userId = userDetails.getId();

        List<NotificationDto> notifications =
                notificationService.getUserNotifications(userId);

        return ResponseEntity.ok(ResponseDto.success(notifications, "Retrive my notifications"));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ResponseDto<Void>> markAsRead(@PathVariable("id") Integer notificationId) {

        notificationService.markAsRead(notificationId);

        return ResponseEntity.ok(
                ResponseDto.success(null, "Notification marked as read")
        );
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDto<Void>> deleteNotification(
            @PathVariable("id") Integer id
            ) {

        notificationService.deleteNotification(id);

        return ResponseEntity.ok(
                ResponseDto.success(null, "Notification deleted successfully")
        );
    }

    @PutMapping("/read-all")
    public ResponseEntity<ResponseDto<Void>> markAllAsRead(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        int userId = userDetails.getId();
        notificationService.markAllAsRead(userId);

        return ResponseEntity.ok(
                ResponseDto.success(null, "All notifications marked as read")
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseDto<NotificationDto>> getNotificationById(
            @PathVariable("id") Integer id) {

        NotificationDto notification = notificationService.getNotificationById(id);

        return ResponseEntity.ok(
                ResponseDto.success(notification, "Notification retrieved successfully")
        );
    }

}
