package com.itms.service;

import com.itms.common.NotificationPriority;
import com.itms.common.NotificationType;
import com.itms.common.ReferenceType;
import com.itms.controller.TrainerController;
import com.itms.dto.NotificationDto;
import com.itms.entity.Notification;
import com.itms.entity.User;
import com.itms.entity.ClassMember;
import com.itms.repository.NotificationRepository;
import com.itms.repository.UserRepository;
import com.itms.repository.ClassMemberRepository;
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
        List<Notification> notifications =
                notificationRepository.findByUserIdOrderBySentDateDesc(userId);

        return notifications.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<NotificationDto> getNotificationsForUser(Integer userId) {
        return getUserNotifications(userId);
    }
    
    public List<NotificationDto> getNotificationsByCategory(Integer trainerId, String category) {
        List<Notification> notifications;
        
        switch (category.toLowerCase()) {
            case "inbox":
                // Inbox: notifications received by trainer (user_id = trainerId, is_draft = false)
                notifications = notificationRepository.findByUserIdAndIsDraftOrderBySentDateDesc(trainerId, false);
                break;
                
            case "sent":
                // Sent: notifications sent by trainer (sender_id = trainerId, is_draft = false)
                notifications = notificationRepository.findBySenderIdAndIsDraftOrderBySentDateDesc(trainerId, false);
                break;
                
            case "draft":
                // Draft: draft notifications created by trainer (user_id = trainerId, is_draft = true)
                notifications = notificationRepository.findByUserIdAndIsDraftOrderBySentDateDesc(trainerId, true);
                break;
                
            default:
                // Default to all notifications for the user
                notifications = notificationRepository.findByUserIdOrderBySentDateDesc(trainerId);
                break;
        }
        
        return notifications.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public void createNotification(Integer trainerId, TrainerController.CreateNotificationRequest request) {
        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        // If it's a draft, only save for the trainer (sender)
        if (Boolean.TRUE.equals(request.getIsDraft())) {
            createDraftForTrainer(trainer, request);
            return;
        }

        // If not a draft, send to recipients
        if ("STUDENTS".equals(request.getRecipientType()) && request.getClassCodes() != null) {
            // Send to students in specified classes
            for (String classCode : request.getClassCodes()) {
                List<ClassMember> classMembers = classMemberRepository.findByClassRoomClassCode(classCode);
                for (ClassMember classMember : classMembers) {
                    createNotificationForUser(classMember.getUser(), trainer, request);
                }
            }
        } else if ("HR".equals(request.getRecipientType())) {
            // Send to HR users (users with HR role)
            List<User> hrUsers = userRepository.findByRoleName("Human Resources");
            for (User hrUser : hrUsers) {
                createNotificationForUser(hrUser, trainer, request);
            }
        }
    }

    private void createDraftForTrainer(User trainer, TrainerController.CreateNotificationRequest request) {
        Notification notification = new Notification();
        notification.setUser(trainer); // Draft belongs to the trainer
        notification.setSender(trainer); // Trainer is also the sender
        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setType(mapStringToNotificationType(request.getType()));
        notification.setPriority(mapStringToNotificationPriority(request.getPriority()));
        notification.setIsDraft(true);
        notification.setIsRead(false);
        notification.setSentDate(LocalDateTime.now());
        notification.setReferenceType(ReferenceType.GENERAL);
        
        // Store recipient info for later use when sending
        notification.setRecipientType(request.getRecipientType());
        if (request.getClassCodes() != null && !request.getClassCodes().isEmpty()) {
            notification.setClassCodes(String.join(",", request.getClassCodes()));
        }
        
        notificationRepository.save(notification);
    }

    private void createNotificationForUser(User recipient, User sender, TrainerController.CreateNotificationRequest request) {
        Notification notification = new Notification();
        notification.setUser(recipient);
        notification.setSender(sender);
        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setType(mapStringToNotificationType(request.getType()));
        notification.setPriority(mapStringToNotificationPriority(request.getPriority()));
        notification.setIsDraft(request.getIsDraft());
        notification.setIsRead(false);
        notification.setSentDate(LocalDateTime.now());
        notification.setReferenceType(ReferenceType.GENERAL);
        notification.setRecipientType(request.getRecipientType());
        
        notificationRepository.save(notification);
    }

    private NotificationType mapStringToNotificationType(String type) {
        if (type == null) return NotificationType.GENERAL;
        try {
            return NotificationType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            return NotificationType.GENERAL;
        }
    }

    private NotificationPriority mapStringToNotificationPriority(String priority) {
        if (priority == null) return NotificationPriority.NORMAL;
        try {
            return NotificationPriority.valueOf(priority.toUpperCase());
        } catch (IllegalArgumentException e) {
            return NotificationPriority.NORMAL;
        }
    }

    public void updateNotification(Integer notificationId, Integer trainerId, TrainerController.CreateNotificationRequest request) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        // Update notification fields
        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setType(mapStringToNotificationType(request.getType()));
        notification.setPriority(mapStringToNotificationPriority(request.getPriority()));
        notification.setIsDraft(request.getIsDraft());
        
        notificationRepository.save(notification);
    }

    public void sendNotification(Integer notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        notification.setIsDraft(false);
        notification.setSentDate(LocalDateTime.now());
        
        notificationRepository.save(notification);
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
        String senderName = notification.getSender() != null 
            ? notification.getSender().getFullName() 
            : null;

        // Determine category
        String category;
        if (Boolean.TRUE.equals(notification.getIsDraft())) {
            category = "draft";
        } else if (notification.getSender() != null && 
                   notification.getSender().getId().equals(notification.getUser().getId())) {
            category = "sent";
        } else {
            category = "inbox";
        }

        return NotificationDto.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .date(notification.getSentDate())
                .sentDate(notification.getSentDate())
                .createdAt(notification.getCreatedAt())
                .read(notification.getIsRead())
                .isRead(notification.getIsRead())
                .isDraft(notification.getIsDraft())
                .type(notification.getType() != null ? notification.getType().name() : "GENERAL")
                .priority(notification.getPriority() != null ? notification.getPriority().name() : "NORMAL")
                .referenceType(notification.getReferenceType())
                .referenceId(notification.getReferenceId())
                .detail_content(notification.getDetailContent())
                .category(category)
                .sender(senderName)
                .recipientType(notification.getRecipientType())
                .classCodes(notification.getClassCodes())
                .build();
    }
}