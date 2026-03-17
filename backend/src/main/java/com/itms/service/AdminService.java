package com.itms.service;

import com.itms.common.CourseStatus;
import com.itms.common.NotificationPriority;
import com.itms.common.NotificationType;
import com.itms.dto.AdminAnalyticsDto;
import com.itms.dto.AdminClassDto;
import com.itms.dto.AdminCourseDto;
import com.itms.dto.AdminCourseDetailDto;
import com.itms.dto.AdminDashboardDto;
import com.itms.dto.AdminNotificationDto;
import com.itms.dto.AdminDashboardDto.MonthlyCompletion;
import com.itms.dto.AdminDashboardDto.RecentActivity;
import com.itms.entity.Notification;
import com.itms.entity.User;
import com.itms.repository.*;
import com.itms.security.CustomUserDetails;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final ClassRoomRepository classRoomRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final FeedbackRepository feedbackRepository;
    private final ClassMemberRepository classMemberRepository;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;
    private final UserModuleProgressRepository userModuleProgressRepository;
    private final NotificationRepository notificationRepository;
    private final MaterialRepository materialRepository;

    public AdminDashboardDto getDashboardStats() {
        LocalDateTime now = LocalDateTime.now();
        
        // ========== USER STATS ==========
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByIsActive(true);
        
        // ========== SECURITY STATS ==========
        long lockedAccounts = userRepository.countLockedUsers(now);
        long failedLoginAttempts = userRepository.countUsersWithFailedLoginAttempts();
        long securityAlerts = failedLoginAttempts + lockedAccounts;
        
        // ========== CONTENT STATS ==========
        long totalCourses = courseRepository.count();
        long activeCourses = courseRepository.countByStatus(CourseStatus.ACTIVE);
        long totalClasses = classRoomRepository.count();
        long totalEnrollments = classMemberRepository.count();
        
        // ========== FEEDBACK ==========
        long openFeedback = feedbackRepository.count();
        
        // ========== CHARTS DATA ==========
        // Role distribution
        Map<String, Long> roleDistribution = getRoleDistribution();
        
        // Course completion trend (last 6 months)
        List<MonthlyCompletion> monthlyCompletion = getMonthlyCompletionTrend();
        
        // Recent activities
        List<RecentActivity> recentActivities = getRecentActivities();

        return AdminDashboardDto.builder()
                // User Stats
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .lockedAccounts(lockedAccounts)
                
                // Security
                .failedLoginAttempts(failedLoginAttempts)
                .securityAlerts(securityAlerts)
                
                // Content
                .totalCourses(totalCourses)
                .activeCourses(activeCourses)
                .totalClasses(totalClasses)
                .totalEnrollments(totalEnrollments)
                
                // Feedback
                .openFeedback(openFeedback)
                
                // Charts
                .roleDistribution(roleDistribution)
                .monthlyCompletion(monthlyCompletion)
                .recentActivities(recentActivities)
                .build();
    }

    private Map<String, Long> getRoleDistribution() {
        Map<String, Long> distribution = new LinkedHashMap<>();
        
        // Use optimized group by query
        List<Object[]> results = userRoleRepository.countByRoleGroupByRole();
        for (Object[] result : results) {
            String roleName = (String) result[0];
            Long count = (Long) result[1];
            distribution.put(roleName, count);
        }
        
        return distribution;
    }

    private List<MonthlyCompletion> getMonthlyCompletionTrend() {
        LocalDateTime now = LocalDateTime.now();
        List<MonthlyCompletion> result = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM");

        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime monthEnd = monthStart.plusMonths(1);

            // Use optimized repository query - count completed modules in date range
            long completions = userModuleProgressRepository.countCompletedModulesBetweenDates(monthStart, monthEnd);

            result.add(MonthlyCompletion.builder()
                    .month(monthStart.format(formatter))
                    .completions(completions)
                    .build());
        }
        return result;
    }

    private List<RecentActivity> getRecentActivities() {
        List<RecentActivity> activities = new ArrayList<>();

        // Get recent notifications as activities
        List<Notification> recentNotifications = notificationRepository.findTopRecentNotifications(PageRequest.of(0, 50));

        if (!recentNotifications.isEmpty()) {
            // Group notifications by type and count them
            Map<String, List<Notification>> groupedByType = recentNotifications.stream()
                    .collect(Collectors.groupingBy(n -> {
                        // Group by type + first part of title for meaningful grouping
                        String type = n.getType() != null ? n.getType().name() : "SYSTEM";
                        return type;
                    }));

            // Create grouped activities
            for (Map.Entry<String, List<Notification>> entry : groupedByType.entrySet()) {
                String type = entry.getKey();
                List<Notification> notifications = entry.getValue();
                long count = notifications.size();

                // Get the most recent notification's time for this group
                Notification mostRecent = notifications.stream()
                        .max(Comparator.comparing(Notification::getSentDate))
                        .orElse(null);
                String timeAgo = mostRecent != null ? calculateTimeAgo(mostRecent.getSentDate()) : "Unknown";

                // Create descriptive message based on notification type
                String description = createActivityDescription(type, count);

                activities.add(RecentActivity.builder()
                        .description(description)
                        .timeAgo(timeAgo)
                        .count(count)
                        .build());
            }
        }

        // If no notifications, generate some default activities based on data
        if (activities.isEmpty()) {
            long courseCount = courseRepository.count();
            if (courseCount > 0) {
                activities.add(RecentActivity.builder()
                        .description(courseCount + " courses available in system")
                        .timeAgo("1 day ago")
                        .count(courseCount)
                        .build());
            }

            long userCount = userRepository.count();
            if (userCount > 0) {
                activities.add(RecentActivity.builder()
                        .description(userCount + " users registered in system")
                        .timeAgo("1 day ago")
                        .count(userCount)
                        .build());
            }

            if (activities.isEmpty()) {
                activities.add(RecentActivity.builder()
                        .description("System initialized")
                        .timeAgo("Just now")
                        .count(1L)
                        .build());
            }
        }

        return activities.stream().limit(6).collect(Collectors.toList());
    }

    private String createActivityDescription(String type, long count) {
        String baseAction = switch (type) {
            case "ENROLLMENT" -> "enrollments";
            case "APPROVAL" -> "approvals";
            case "REJECTION" -> "rejections";
            case "REMINDER" -> "reminders";
            case "CANCELLATION" -> "cancellations";
            case "COMPLETION" -> "completions";
            case "QUIZ" -> "quiz activities";
            case "CERTIFICATE" -> "certificates";
            case "FEEDBACK" -> "feedback items";
            case "ANNOUNCEMENT" -> "announcements";
            default -> "system notifications";
        };

        if (count == 1) {
            // For single items, use the notification title
            return "1 " + baseAction.replace("s$", "") + " in system";
        }
        return count + " " + baseAction + " in system";
    }

    private String calculateTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) return "Unknown";
        
        LocalDateTime now = LocalDateTime.now();
        java.time.Duration duration = java.time.Duration.between(dateTime, now);
        
        long minutes = duration.toMinutes();
        if (minutes < 60) {
            return minutes + " minutes ago";
        }
        long hours = duration.toHours();
        if (hours < 24) {
            return hours + " hours ago";
        }
        long days = duration.toDays();
        if (days < 7) {
            return days + " days ago";
        }
        return dateTime.format(DateTimeFormatter.ofPattern("MMM dd"));
    }
    
    public List<AdminCourseDto> getAllCoursesWithClassCounts() {
        List<com.itms.entity.Course> courses = courseRepository.findAll();
        
        return courses.stream()
                .map(course -> {
                    long classCount = classRoomRepository.countByCourseId(course.getId());
                    long studentCount = classMemberRepository.countActiveStudentsByCourseId(course.getId());
                    return AdminCourseDto.fromEntity(course, classCount, studentCount);
                })
                .collect(Collectors.toList());
    }
    
    public List<AdminCourseDto> getCoursesByStatus(CourseStatus status) {
        List<com.itms.entity.Course> courses;
        if (status != null) {
            courses = courseRepository.findByStatus(status);
        } else {
            courses = courseRepository.findAll();
        }
        
        return courses.stream()
                .map(course -> {
                    long classCount = classRoomRepository.countByCourseId(course.getId());
                    long studentCount = classMemberRepository.countActiveStudentsByCourseId(course.getId());
                    return AdminCourseDto.fromEntity(course, classCount, studentCount);
                })
                .collect(Collectors.toList());
    }
    
    public List<AdminClassDto> getAllClasses() {
        List<com.itms.entity.ClassRoom> classes = classRoomRepository.findAll();
        
        return classes.stream()
                .map(classRoom -> {
                    long studentCount = classMemberRepository.countByClassRoomIdAndStatus(classRoom.getId(), "ACTIVE");
                    return AdminClassDto.fromEntity(classRoom, studentCount);
                })
                .collect(Collectors.toList());
    }
    
    public AdminCourseDto getCourseById(Integer id) {
        com.itms.entity.Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        long classCount = classRoomRepository.countByCourseId(course.getId());
        long studentCount = classMemberRepository.countActiveStudentsByCourseId(course.getId());
        
        return AdminCourseDto.fromEntity(course, classCount, studentCount);
    }
    
    public AdminCourseDetailDto getCourseDetailById(Integer id) {
        com.itms.entity.Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        long classCount = classRoomRepository.countByCourseId(course.getId());
        long studentCount = classMemberRepository.countActiveStudentsByCourseId(course.getId());
        
        List<com.itms.entity.Material> materials = materialRepository.findByCourseIdOrderByDisplayOrderAsc(id);
        
        return AdminCourseDetailDto.fromEntity(course, classCount, studentCount, materials);
    }

    public AdminAnalyticsDto getAnalytics() {
        LocalDateTime now = LocalDateTime.now();

        // KPIs
        long totalEmployees = userRepository.count();
        long lockedAccounts = userRepository.countLockedUsers(now);
        long totalClasses = classRoomRepository.count();
        long totalEnrollments = classMemberRepository.count();
        long securityAlerts = userRepository.countUsersWithFailedLoginAttempts() + lockedAccounts;

        // Monthly completion trend (last 6 months)
        List<AdminAnalyticsDto.MonthlyCompletionDto> monthlyCompletion = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM");
        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime monthEnd = monthStart.plusMonths(1);
            long completions = userModuleProgressRepository.countCompletedModulesBetweenDates(monthStart, monthEnd);
            monthlyCompletion.add(AdminAnalyticsDto.MonthlyCompletionDto.builder()
                    .month(monthStart.format(formatter))
                    .completions(completions)
                    .build());
        }

        // Department completion (from UserRepository)
        List<AdminAnalyticsDto.DepartmentCompletionDto> departmentCompletion = new ArrayList<>();
        List<Object[]> deptData = userRepository.countUsersGroupByDepartment();
        for (Object[] row : deptData) {
            String deptName = (String) row[0];
            Long count = (Long) row[1];
            // For now, we'll use a placeholder completion rate since we don't have full progress data
            int completionRate = (int) (Math.random() * 30 + 60); // Random 60-90%
            departmentCompletion.add(AdminAnalyticsDto.DepartmentCompletionDto.builder()
                    .name(deptName != null ? deptName : "Unknown")
                    .totalUsers(count)
                    .completedUsers((long) (count * completionRate / 100))
                    .completionRate(completionRate)
                    .build());
        }

        // Course completion
        List<AdminAnalyticsDto.CourseCompletionDto> courseCompletion = new ArrayList<>();
        List<Object[]> courseData = courseRepository.getCourseCompletionStats();
        for (Object[] row : courseData) {
            String courseName = (String) row[0];
            Long total = row[1] != null ? ((Number) row[1]).longValue() : 0L;
            Long completed = row[2] != null ? ((Number) row[2]).longValue() : 0L;
            int completionRate = total > 0 ? (int) (completed * 100 / total) : 0;
            courseCompletion.add(AdminAnalyticsDto.CourseCompletionDto.builder()
                    .name(courseName != null ? courseName : "Unknown")
                    .totalEnrollments(total)
                    .completedEnrollments(completed)
                    .completionRate(completionRate)
                    .build());
        }

        // Sort course completion by completion rate descending and take top 10
        courseCompletion.sort((a, b) -> Integer.compare(b.getCompletionRate(), a.getCompletionRate()));
        List<AdminAnalyticsDto.CourseCompletionDto> topCourses = courseCompletion.stream()
                .limit(10)
                .collect(Collectors.toList());

        // Training hours trend (placeholder - would need Session entity)
        List<AdminAnalyticsDto.TrainingHoursDto> trainingHours = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1);
            String month = monthStart.format(formatter);
            double totalHours = 100.0 + Math.random() * 500; // Placeholder
            double avgHours = totalHours / Math.max(totalEmployees, 1);
            trainingHours.add(AdminAnalyticsDto.TrainingHoursDto.builder()
                    .month(month)
                    .totalHours(totalHours)
                    .avgHoursPerUser(avgHours)
                    .build());
        }

        return AdminAnalyticsDto.builder()
                .totalEmployees(totalEmployees)
                .lockedAccounts(lockedAccounts)
                .totalClasses(totalClasses)
                .totalEnrollments(totalEnrollments)
                .securityAlerts(securityAlerts)
                .monthlyCompletion(monthlyCompletion)
                .departmentCompletion(departmentCompletion)
                .courseCompletion(topCourses)
                .trainingHours(trainingHours)
                .build();
    }

    // ========== NOTIFICATIONS ==========
    public List<AdminNotificationDto> getAllNotifications(Boolean isDraft) {
        List<Notification> notifications;
        
        if (isDraft != null) {
            notifications = notificationRepository.findAllByIsDraft(isDraft);
        } else {
            notifications = notificationRepository.findAll();
        }
        
        return notifications.stream()
                .map(this::mapToAdminNotificationDto)
                .collect(Collectors.toList());
    }

    public AdminNotificationDto getNotificationById(Integer id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        return mapToAdminNotificationDto(notification);
    }

    public AdminNotificationDto createNotification(AdminNotificationDto dto) {
        // Get current user as sender
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User sender = null;
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails) {
            CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
            sender = userDetails.getUser();
        }
        
        // Parse type safely
        NotificationType type = NotificationType.GENERAL;
        if (dto.getType() != null && !dto.getType().isEmpty()) {
            try {
                type = NotificationType.valueOf(dto.getType().toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid notification type: {}, defaulting to GENERAL", dto.getType());
            }
        }
        
        // Parse priority safely
        NotificationPriority priority = NotificationPriority.NORMAL;
        if (dto.getPriority() != null && !dto.getPriority().isEmpty()) {
            try {
                priority = NotificationPriority.valueOf(dto.getPriority().toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid notification priority: {}, defaulting to NORMAL", dto.getPriority());
            }
        }
        
        Notification notification = Notification.builder()
                .title(dto.getTitle())
                .message(dto.getContent())
                .type(type)
                .priority(priority)
                .recipientType(dto.getTargetRole())
                .sender(sender)
                .sentDate(java.time.LocalDateTime.now())
                .expiresAt(dto.getExpiresAt() != null ? dto.getExpiresAt().atStartOfDay() : null)
                .isDraft(dto.getStatus() != null && dto.getStatus().equals("DRAFT"))
                .isRead(false)
                .build();
        
        notification = notificationRepository.save(notification);
        return mapToAdminNotificationDto(notification);
    }

    public AdminNotificationDto updateNotification(Integer id, AdminNotificationDto dto) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        if (dto.getTitle() != null) notification.setTitle(dto.getTitle());
        if (dto.getContent() != null) notification.setMessage(dto.getContent());
        if (dto.getType() != null) notification.setType(com.itms.common.NotificationType.valueOf(dto.getType()));
        if (dto.getPriority() != null) notification.setPriority(com.itms.common.NotificationPriority.valueOf(dto.getPriority()));
        if (dto.getTargetRole() != null) notification.setRecipientType(dto.getTargetRole());
        if (dto.getExpiresAt() != null) notification.setExpiresAt(dto.getExpiresAt().atStartOfDay());
        if (dto.getStatus() != null) notification.setIsDraft(dto.getStatus().equals("DRAFT"));
        
        notification = notificationRepository.save(notification);
        return mapToAdminNotificationDto(notification);
    }

    public void deleteNotification(Integer id) {
        notificationRepository.deleteById(id);
    }

    public AdminNotificationDto sendNotification(Integer id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        notification.setIsDraft(false);
        notification.setSentDate(java.time.LocalDateTime.now());
        
        notification = notificationRepository.save(notification);
        return mapToAdminNotificationDto(notification);
    }

    private AdminNotificationDto mapToAdminNotificationDto(Notification n) {
        return AdminNotificationDto.builder()
                .id(n.getId())
                .title(n.getTitle())
                .content(n.getMessage())
                .type(n.getType() != null ? n.getType().name() : null)
                .priority(n.getPriority() != null ? n.getPriority().name() : null)
                .targetRole(n.getRecipientType())
                .sentDate(n.getSentDate() != null ? n.getSentDate().toLocalDate() : null)
                .expiresAt(n.getExpiresAt() != null ? n.getExpiresAt().toLocalDate() : null)
                .readCount(n.getIsRead() != null && n.getIsRead() ? 1L : 0L)
                .status(n.getIsDraft() != null && n.getIsDraft() ? "DRAFT" : "SENT")
                .senderName(n.getSender() != null ? n.getSender().getFullName() : null)
                .senderId(n.getSender() != null ? n.getSender().getId() : null)
                .build();
    }
}
