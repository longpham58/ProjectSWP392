package com.itms.service;

import com.itms.common.NotificationPriority;
import com.itms.common.NotificationType;
import com.itms.common.ReferenceType;
import com.itms.controller.TrainerController;
import com.itms.dto.NotificationDto;
import com.itms.entity.ClassMember;
import com.itms.entity.Notification;
import com.itms.entity.User;
import com.itms.repository.ClassMemberRepository;
import com.itms.repository.NotificationRepository;
import com.itms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ClassMemberRepository classMemberRepository;

    public List<NotificationDto> getUserNotifications(Integer userId) {
        return notificationRepository.findByUserIdOrderBySentDateDesc(userId)
                .stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public List<NotificationDto> getNotificationsForUser(Integer userId) {
        return getUserNotifications(userId);
    }

    public List<NotificationDto> getNotificationsByCategory(Integer trainerId, String category) {
        List<Notification> notifications = switch (category.toLowerCase()) {
            case "inbox" -> notificationRepository.findByUserIdAndIsDraftOrderBySentDateDesc(trainerId, false);
            case "sent"  -> notificationRepository.findBySenderIdAndIsDraftOrderBySentDateDesc(trainerId, false);
            case "draft" -> notificationRepository.findByUserIdAndIsDraftOrderBySentDateDesc(trainerId, true);
            default      -> notificationRepository.findByUserIdOrderBySentDateDesc(trainerId);
        };
        return notifications.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public void createNotification(Integer trainerId, TrainerController.CreateNotificationRequest request) {
        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        if (Boolean.TRUE.equals(request.getIsDraft())) {
            saveSingle(trainer, trainer, request, true);
            return;
        }

        if ("STUDENTS".equals(request.getRecipientType()) && request.getClassCodes() != null) {
            for (String classCode : request.getClassCodes()) {
                classMemberRepository.findByClassRoomClassCode(classCode)
                        .forEach(cm -> saveSingle(cm.getUser(), trainer, request, false));
            }
        } else if ("HR".equals(request.getRecipientType())) {
            userRepository.findByRoleName("Human Resources")
                    .forEach(hr -> saveSingle(hr, trainer, request, false));
        } else {
            saveSingle(trainer, trainer, request, false);
        }
    }

    private void saveSingle(User recipient, User sender, TrainerController.CreateNotificationRequest request, boolean isDraft) {
        Notification n = new Notification();
        n.setUser(recipient);
        n.setSender(sender);
        n.setTitle(request.getTitle());
        n.setMessage(request.getMessage());
        n.setType(toType(request.getType()));
        n.setPriority(toPriority(request.getPriority()));
        n.setIsDraft(isDraft);
        n.setIsRead(false);
        n.setSentDate(LocalDateTime.now());
        n.setReferenceType(ReferenceType.GENERAL);
        n.setRecipientType(request.getRecipientType());
        if (request.getClassCodes() != null && !request.getClassCodes().isEmpty()) {
            n.setClassCodes(String.join(",", request.getClassCodes()));
        }
        notificationRepository.save(n);
    }

    public void updateNotification(Integer notificationId, Integer trainerId, TrainerController.CreateNotificationRequest request) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setTitle(request.getTitle());
        n.setMessage(request.getMessage());
        n.setType(toType(request.getType()));
        n.setPriority(toPriority(request.getPriority()));
        n.setIsDraft(Boolean.TRUE.equals(request.getIsDraft()));
        notificationRepository.save(n);
    }

    public void sendNotification(Integer notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setIsDraft(false);
        n.setSentDate(LocalDateTime.now());
        notificationRepository.save(n);
    }

    public void markAsRead(Integer notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setIsRead(true);
        n.setReadAt(LocalDateTime.now());
        notificationRepository.save(n);
    }

    public void deleteNotification(Integer notificationId) {
        notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notificationRepository.deleteById(notificationId);
    }

    public void markAllAsRead(Integer userId) {
        notificationRepository.findByUserIdOrderBySentDateDesc(userId).forEach(n -> {
            if (!Boolean.TRUE.equals(n.getIsRead())) {
                n.setIsRead(true);
                n.setReadAt(LocalDateTime.now());
                notificationRepository.save(n);
            }
        });
    }

    public NotificationDto getNotificationById(Integer notificationId) {
        return convertToDto(notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found")));
    }

    private NotificationDto convertToDto(Notification n) {
        String senderName = n.getSender() != null ? n.getSender().getFullName() : null;

        String category;
        if (Boolean.TRUE.equals(n.getIsDraft())) {
            category = "draft";
        } else if (n.getSender() != null && n.getSender().getId().equals(n.getUser().getId())) {
            category = "sent";
        } else {
            category = "inbox";
        }

        return NotificationDto.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .date(n.getSentDate())
                .sentDate(n.getSentDate())
                .createdAt(n.getCreatedAt())
                .read(n.getIsRead())
                .isRead(n.getIsRead())
                .isDraft(n.getIsDraft())
                .type(n.getType() != null ? n.getType().name() : "ANNOUNCEMENT")
                .priority(n.getPriority() != null ? n.getPriority().name() : "NORMAL")
                .referenceType(n.getReferenceType())
                .referenceId(n.getReferenceId())
                .detail_content(n.getDetailContent())
                .category(category)
                .sender(senderName)
                .recipientType(n.getRecipientType())
                .classCodes(n.getClassCodes())
                .build();
    }

    private NotificationType toType(String type) {
        if (type == null) return NotificationType.ANNOUNCEMENT;
        try { return NotificationType.valueOf(type.toUpperCase()); }
        catch (IllegalArgumentException e) { return NotificationType.ANNOUNCEMENT; }
    }

    private NotificationPriority toPriority(String priority) {
        if (priority == null) return NotificationPriority.NORMAL;
        try { return NotificationPriority.valueOf(priority.toUpperCase()); }
        catch (IllegalArgumentException e) { return NotificationPriority.NORMAL; }
    }
}
