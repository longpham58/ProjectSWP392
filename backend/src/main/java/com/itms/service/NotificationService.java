package com.itms.service;

import com.itms.common.ReferenceType;
import com.itms.dto.NotificationDto;
import com.itms.entity.Notification;
import com.itms.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    public List<NotificationDto> getUserNotifications(Integer userId) {

        List<Notification> notifications =
                notificationRepository.findByUserIdOrderBySentDateDesc(userId);

        return notifications.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public void markAsRead(Integer notificationId) {

        Notification notification = notificationRepository
                .findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());

        notificationRepository.save(notification);
    }
    public void deleteNotification(Integer notificationId) {

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notificationRepository.delete(notification);
    }

    public void markAllAsRead(Integer userId) {
        List<Notification> unreadNotifications = 
                notificationRepository.findByUserIdOrderBySentDateDesc(userId);

        for (Notification notification : unreadNotifications) {
            if (!notification.getIsRead()) {
                notification.setIsRead(true);
                notification.setReadAt(LocalDateTime.now());
                notificationRepository.save(notification);
            }
        }
    }

    public NotificationDto getNotificationById(Integer notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        return convertToDto(notification);
    }

    private NotificationDto convertToDto(Notification notification) {

        return NotificationDto.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .date(notification.getSentDate())
                .read(notification.getIsRead())
                .type(mapType(String.valueOf(notification.getType())))
                .referenceType(notification.getReferenceType())
                .referenceId(notification.getReferenceId())
                .detail_content(notification.getDetailContent())
                .build();
    }
    private String mapType(String type) {

        switch (type) {
            case "APPROVAL":
            case "COMPLETION":
            case "CERTIFICATE":
                return "success";

            case "REJECTION":
            case "CANCELLATION":
                return "warning";

            default:
                return "info";
        }
    }
}
