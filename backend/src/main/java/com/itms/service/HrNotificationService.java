package com.itms.service;

import com.itms.common.NotificationPriority;
import com.itms.dto.TrainerNotificationDto;
import com.itms.dto.TrainerNotificationRequest;
import com.itms.entity.Notification;
import com.itms.entity.User;
import com.itms.repository.ClassMemberRepository;
import com.itms.repository.NotificationRepository;
import com.itms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HrNotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ClassMemberRepository classMemberRepository;

    public List<TrainerNotificationDto> getNotificationsByCategory(Integer hrId, String category) {
        List<Notification> notifications;
        switch (category.toLowerCase()) {
            case "sent":
                notifications = notificationRepository.findSentBySenderId(hrId);
                break;
            case "draft":
                notifications = notificationRepository.findDraftsBySenderId(hrId);
                break;
            case "inbox":
            default:
                notifications = notificationRepository.findByUserIdOrderBySentDateDesc(hrId);
                break;
        }
        return notifications.stream()
                .map(n -> convertToDto(n, category))
                .collect(Collectors.toList());
    }

    @Transactional
    public TrainerNotificationDto createNotification(Integer hrId, TrainerNotificationRequest request) {
        User hrUser = userRepository.findById(hrId)
                .orElseThrow(() -> new RuntimeException("HR user not found"));

        Notification notification = Notification.builder()
                .sender(hrUser)
                .user(hrUser)
                .title(request.getTitle())
                .message(request.getMessage())
                .priority(request.getPriority() != null ? request.getPriority() : NotificationPriority.NORMAL)
                .recipientType(request.getRecipientType())
                .classCodes(request.getClassCodes() != null ? String.join(",", request.getClassCodes()) : null)
                .isDraft(request.getIsDraft() != null ? request.getIsDraft() : false)
                .type("GENERAL")
                .isRead(true)
                .build();

        Notification saved = notificationRepository.save(notification);

        if (!saved.getIsDraft()) {
            sendNotificationToRecipients(saved);
        }

        return convertToDto(saved, Boolean.TRUE.equals(saved.getIsDraft()) ? "draft" : "sent");
    }

    @Transactional
    public TrainerNotificationDto updateNotification(Integer notificationId, Integer hrId, TrainerNotificationRequest request) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (notification.getSender() == null || !notification.getSender().getId().equals(hrId)) {
            throw new RuntimeException("Unauthorized to update this notification");
        }

        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setPriority(request.getPriority() != null ? request.getPriority() : notification.getPriority());
        notification.setRecipientType(request.getRecipientType());
        notification.setClassCodes(request.getClassCodes() != null ? String.join(",", request.getClassCodes()) : null);

        Notification updated = notificationRepository.save(notification);
        return convertToDto(updated, Boolean.TRUE.equals(updated.getIsDraft()) ? "draft" : "sent");
    }

    @Transactional
    public void sendNotification(Integer notificationId, Integer hrId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (notification.getSender() == null || !notification.getSender().getId().equals(hrId)) {
            throw new RuntimeException("Unauthorized to send this notification");
        }

        notification.setIsDraft(false);
        notification.setSentDate(LocalDateTime.now());
        notificationRepository.save(notification);
        sendNotificationToRecipients(notification);
    }

    @Transactional
    public void deleteNotification(Integer notificationId, Integer hrId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        boolean isSender = notification.getSender() != null && notification.getSender().getId().equals(hrId);
        boolean isReceiver = notification.getUser() != null && notification.getUser().getId().equals(hrId);

        if (!isSender && !isReceiver) {
            throw new RuntimeException("Unauthorized to delete this notification");
        }

        notificationRepository.delete(notification);
    }

    @Transactional
    public void markAsRead(Integer notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    private void sendNotificationToRecipients(Notification sourceNotification) {
        String recipientType = sourceNotification.getRecipientType();
        if ("STUDENTS".equals(recipientType) && sourceNotification.getClassCodes() != null) {
            List<String> classCodes = Arrays.asList(sourceNotification.getClassCodes().split(","));
            sendToStudentsByClassCodes(sourceNotification, classCodes);
        } else if ("TRAINERS".equals(recipientType)) {
            sendToTrainers(sourceNotification);
        } else if ("HR".equals(recipientType)) {
            sendToHR(sourceNotification);
        }
        // ALL / others: do nothing extra (already saved under sender)
    }

    private void sendToStudentsByClassCodes(Notification source, List<String> classCodes) {
        for (String classCode : classCodes) {
            List<com.itms.entity.ClassMember> members = classMemberRepository.findByClassRoomClassCode(classCode.trim());
            members.forEach(member -> {
                if (member.getUser() != null) {
                    createNotificationForUser(member.getUser(), source);
                }
            });
        }
    }

    private void sendToTrainers(Notification source) {
        List<User> trainers = userRepository.findAllActiveTrainers();
        for (User trainer : trainers) {
            createNotificationForUser(trainer, source);
        }
    }

    private void sendToHR(Notification source) {
        List<User> hrUsers = userRepository.findByRoleName("Human Resources");
        for (User hr : hrUsers) {
            createNotificationForUser(hr, source);
        }
    }

    private void createNotificationForUser(User recipient, Notification source) {
        Notification notif = Notification.builder()
                .user(recipient)
                .sender(source.getSender())
                .type(source.getType() != null ? source.getType() : "GENERAL")
                .title(source.getTitle())
                .message(source.getMessage())
                .priority(source.getPriority())
                .recipientType(source.getRecipientType())
                .isRead(false)
                .isDraft(false)
                .sentDate(LocalDateTime.now())
                .build();
        notificationRepository.save(notif);
    }

    private TrainerNotificationDto convertToDto(Notification n, String category) {
        List<String> recipients = null;
        String sender = null;

        if (n.getClassCodes() != null && !n.getClassCodes().isEmpty()) {
            recipients = Arrays.asList(n.getClassCodes().split(","));
        } else if ("TRAINERS".equals(n.getRecipientType())) {
            recipients = List.of("Giảng viên");
        } else if ("HR".equals(n.getRecipientType())) {
            recipients = List.of("HR", "Quản lý");
        }

        if ("inbox".equals(category) && n.getSender() != null) {
            sender = n.getSender().getFullName() != null ? n.getSender().getFullName() : "Hệ thống";
        } else if ("inbox".equals(category)) {
            sender = "Hệ thống";
        }

        return TrainerNotificationDto.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .sentDate(n.getSentDate() != null ? n.getSentDate() : n.getCreatedAt())
                .isRead(n.getIsRead())
                .type(n.getType())
                .priority(n.getPriority())
                .category(category)
                .recipients(recipients)
                .sender(sender)
                .createdAt(n.getCreatedAt())
                .updatedAt(n.getUpdatedAt())
                .build();
    }
}
