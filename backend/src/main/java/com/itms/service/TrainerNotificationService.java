package com.itms.service;

import com.itms.common.NotificationPriority;
import com.itms.dto.TrainerNotificationDto;
import com.itms.dto.TrainerNotificationRequest;
import com.itms.entity.Course;
import com.itms.entity.Notification;
import com.itms.entity.User;
import com.itms.repository.ClassMemberRepository;
import com.itms.repository.ClassRoomRepository;
import com.itms.repository.CourseRepository;
import com.itms.repository.NotificationRepository;
import com.itms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainerNotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final ClassMemberRepository classMemberRepository;
    private final ClassRoomRepository classRoomRepository;

    // Get notifications by category
    public List<TrainerNotificationDto> getNotificationsByCategory(Integer trainerId, String category) {
        List<Notification> notifications;

        switch (category.toLowerCase()) {
            case "sent":
                notifications = notificationRepository.findSentBySenderId(trainerId);
                break;
            case "draft":
                notifications = notificationRepository.findDraftsBySenderId(trainerId);
                break;
            case "inbox":
            default:
                // Inbox: only non-draft notifications sent TO the trainer, excluding self-sent
                notifications = notificationRepository.findNotificationsForUser(trainerId);
                break;
        }

        return notifications.stream()
                .map(n -> convertToDto(n, category))
                .collect(Collectors.toList());
    }

    // Create or save draft notification
    @Transactional
    public TrainerNotificationDto createNotification(Integer trainerId, TrainerNotificationRequest request) {
        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        Notification notification = Notification.builder()
                .sender(trainer)
                .user(trainer) // For drafts, user is the sender
                .title(request.getTitle())
                .message(request.getMessage())
                .priority(request.getPriority() != null ? request.getPriority() : NotificationPriority.NORMAL)
                .recipientType(request.getRecipientType())
                .classCodes(request.getClassCodes() != null ? String.join(",", request.getClassCodes()) : null)
                .isDraft(request.getIsDraft() != null ? request.getIsDraft() : false)
                .type("ANNOUNCEMENT")
                .isRead(true) // Trainer's own notifications are "read"
                .sentDate(LocalDateTime.now())
                .build();

        Notification saved = notificationRepository.save(notification);

        // If not draft, send immediately
        if (!saved.getIsDraft()) {
            sendNotificationToRecipients(saved);
        }

        return convertToDto(saved, saved.getIsDraft() ? "draft" : "sent");
    }

    // Update draft notification
    @Transactional
    public TrainerNotificationDto updateNotification(Integer notificationId, Integer trainerId, 
                                                     TrainerNotificationRequest request) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (notification.getSender() == null || !notification.getSender().getId().equals(trainerId)) {
            throw new RuntimeException("Unauthorized to update this notification");
        }

        if (!notification.getIsDraft()) {
            throw new RuntimeException("Cannot update sent notification");
        }

        notification.setTitle(request.getTitle());
        notification.setMessage(request.getMessage());
        notification.setPriority(request.getPriority() != null ? request.getPriority() : notification.getPriority());
        notification.setRecipientType(request.getRecipientType());
        notification.setClassCodes(request.getClassCodes() != null ? String.join(",", request.getClassCodes()) : null);

        Notification updated = notificationRepository.save(notification);
        return convertToDto(updated, "draft");
    }

    // Send notification (convert draft to sent or send immediately)
    @Transactional
    public void sendNotification(Integer notificationId, Integer trainerId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (notification.getSender() == null || !notification.getSender().getId().equals(trainerId)) {
            throw new RuntimeException("Unauthorized to send this notification");
        }

        // Mark as sent
        notification.setIsDraft(false);
        notification.setSentDate(LocalDateTime.now());
        notificationRepository.save(notification);

        // Send to recipients
        sendNotificationToRecipients(notification);
    }

    // Delete notification
    @Transactional
    public void deleteNotification(Integer notificationId, Integer trainerId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        // Check if user is sender (for sent/draft) or receiver (for inbox)
        boolean isSender = notification.getSender() != null && notification.getSender().getId().equals(trainerId);
        boolean isReceiver = notification.getUser().getId().equals(trainerId);

        if (!isSender && !isReceiver) {
            throw new RuntimeException("Unauthorized to delete this notification");
        }

        notificationRepository.delete(notification);
    }

    // Mark inbox notification as read
    @Transactional
    public void markAsRead(Integer notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    // Helper: Send notification to recipients
    private void sendNotificationToRecipients(Notification sourceNotification) {
        if ("STUDENTS".equals(sourceNotification.getRecipientType()) && sourceNotification.getClassCodes() != null) {
            // Send to students in specified classes
            List<String> classCodes = Arrays.asList(sourceNotification.getClassCodes().split(","));
            sendToStudents(sourceNotification, classCodes);
        } else if ("HR".equals(sourceNotification.getRecipientType())) {
            // Send to HR users
            sendToHR(sourceNotification);
        }
    }

    // Helper: Send to students in specified classes
    private void sendToStudents(Notification sourceNotification, List<String> classCodes) {
        for (String classCode : classCodes) {
            List<com.itms.entity.ClassMember> members =
                    classMemberRepository.findByClassRoomClassCode(classCode.trim());
            members.forEach(member -> {
                if (member.getUser() != null) {
                    createNotificationForUser(member.getUser(), sourceNotification);
                }
            });
        }
    }

    // Helper: Send to HR
    private void sendToHR(Notification sourceNotification) {
        // Find all HR users using optimized query
        List<User> hrUsers = userRepository.findByRoleNameOrCode("HR", "HR");

        // Create notification for each HR user
        for (User hrUser : hrUsers) {
            createNotificationForUser(hrUser, sourceNotification);
        }
    }

    // Helper: Create notification for a specific user
    private void createNotificationForUser(User recipient, Notification sourceNotification) {
        Notification notification = Notification.builder()
                .user(recipient)
                .sender(sourceNotification.getSender())
                .type(sourceNotification.getType())
                .title(sourceNotification.getTitle())
                .message(sourceNotification.getMessage())
                .priority(sourceNotification.getPriority())
                .recipientType(sourceNotification.getRecipientType())
                .isRead(false)
                .isDraft(false)
                .sentDate(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
    }

    // Convert Notification to DTO
    private TrainerNotificationDto convertToDto(Notification n, String category) {
        List<String> recipients = null;
        String sender = null;

        if (n.getClassCodes() != null && !n.getClassCodes().isEmpty()) {
            recipients = Arrays.asList(n.getClassCodes().split(","));
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

    // Get trainer's classes for class selection in notification form
    public List<Map<String, String>> getTrainerCourses(Integer trainerId) {
        System.out.println("🔍 [TrainerNotificationService] Getting classes for trainer ID: " + trainerId);

        List<com.itms.entity.ClassRoom> classes = classRoomRepository.findByTrainerIdWithCourse(trainerId);

        System.out.println("📚 [TrainerNotificationService] Found " + classes.size() + " classes");

        List<Map<String, String>> result = classes.stream()
                .map(cls -> Map.of(
                        "code", cls.getClassCode() != null ? cls.getClassCode() : "",
                        "name", cls.getClassName() != null ? cls.getClassName() : cls.getClassCode()
                ))
                .collect(Collectors.toList());

        System.out.println("✅ [TrainerNotificationService] Returning " + result.size() + " classes to frontend");
        return result;
    }
    
    // DEBUG: Get all courses
    public List<Map<String, String>> getAllCoursesDebug() {
        List<Course> allCourses = courseRepository.findAll();
        
        System.out.println("🐛 [DEBUG] Total courses in database: " + allCourses.size());
        allCourses.forEach(c -> {
            System.out.println("   - ID: " + c.getId() + 
                             ", Code: " + c.getCode() + 
                             ", Name: " + c.getName() + 
                             ", Trainer ID: " + (c.getTrainer() != null ? c.getTrainer().getId() : "NULL") +
                             ", Status: " + c.getStatus());
        });
        
        return allCourses.stream()
                .map(course -> Map.of(
                        "id", String.valueOf(course.getId()),
                        "code", course.getCode() != null ? course.getCode() : "",
                        "name", course.getName() != null ? course.getName() : "",
                        "trainerId", course.getTrainer() != null ? String.valueOf(course.getTrainer().getId()) : "NULL",
                        "status", course.getStatus() != null ? course.getStatus().toString() : "NULL"
                ))
                .collect(Collectors.toList());
    }
}
