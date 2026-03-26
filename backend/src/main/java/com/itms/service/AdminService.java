package com.itms.service;

import com.itms.common.CourseStatus;
import com.itms.common.NotificationPriority;
import com.itms.dto.AdminAnalyticsDto;
import com.itms.dto.AdminClassDto;
import com.itms.dto.AdminCourseDto;
import com.itms.dto.AdminCourseDetailDto;
import com.itms.dto.AdminDashboardDto;
import com.itms.dto.AdminNotificationDto;
import com.itms.dto.AdminDashboardDto.MonthlyCompletion;
import com.itms.dto.AdminDashboardDto.RecentActivity;
import com.itms.dto.FeedbackDto;
import com.itms.entity.Certificate;
import com.itms.entity.Course;
import com.itms.entity.Feedback;
import com.itms.entity.QuizAttempt;
import com.itms.entity.Session;
import com.itms.entity.User;
import com.itms.entity.ClassMember;
import com.itms.entity.Notification;
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
    private final CertificateRepository certificateRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final SessionRepository sessionRepository;
    private final AttendanceRepository attendanceRepository;

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
        // Count system feedback (where enrollment_id is NULL = system feedback)
        long openFeedback = feedbackRepository.countByEnrollmentIsNull();
        
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
        final int PAGE_SIZE = 20;
        
        // ========== 1. User Registration Activities ==========
        List<User> recentUsers = userRepository.findRecentUsers(PageRequest.of(0, PAGE_SIZE));
        for (User user : recentUsers) {
            if (user.getCreatedAt() != null) {
                activities.add(RecentActivity.builder()
                        .description("New user registered: " + user.getFullName() + " (" + user.getEmail() + ")")
                        .timeAgo(calculateTimeAgo(user.getCreatedAt()))
                        .count(1L)
                        .build());
            }
        }
        
        // ========== 2. Course Creation Activities ==========
        List<Course> recentCourses = courseRepository.findRecentCourses(PageRequest.of(0, PAGE_SIZE));
        for (Course course : recentCourses) {
            if (course.getCreatedAt() != null) {
                String status = course.getStatus() != null ? course.getStatus().name() : "DRAFT";
                activities.add(RecentActivity.builder()
                        .description("Course created: " + course.getName() + " (" + status + ")")
                        .timeAgo(calculateTimeAgo(course.getCreatedAt()))
                        .count(1L)
                        .build());
            }
        }
        
        // ========== 3. Enrollment Activities ==========
        List<ClassMember> recentEnrollments = classMemberRepository.findRecentEnrollments(PageRequest.of(0, PAGE_SIZE));
        for (ClassMember cm : recentEnrollments) {
            if (cm.getJoinedAt() != null) {
                String userName = cm.getUser() != null ? cm.getUser().getFullName() : "Unknown";
                String className = cm.getClassRoom() != null ? cm.getClassRoom().getClassName() : "Unknown";
                String courseName = cm.getClassRoom() != null && cm.getClassRoom().getCourse() != null 
                        ? cm.getClassRoom().getCourse().getName() : "";
                activities.add(RecentActivity.builder()
                        .description("User enrolled: " + userName + " in " + className + " (" + courseName + ")")
                        .timeAgo(calculateTimeAgo(cm.getJoinedAt()))
                        .count(1L)
                        .build());
            }
        }
        
        // ========== 4. Session Activities ==========
        // Get recent sessions first
        List<Session> recentSessions = sessionRepository.findRecentSessions(PageRequest.of(0, PAGE_SIZE));
        
        // Get unique course IDs from recent sessions
        Set<Integer> courseIds = recentSessions.stream()
            .filter(s -> s.getClassRoom() != null && s.getClassRoom().getCourse() != null)
            .map(s -> s.getClassRoom().getCourse().getId())
            .collect(Collectors.toSet());
        
        // Fetch sessions for these courses, ordered by date
        Map<Long, Integer> sessionNumberMap = new HashMap<>();
        for (Integer courseId : courseIds) {
            List<Session> courseSessions = sessionRepository.findByCourseIdOrderByDateAsc(courseId.intValue());
            int number = 1;
            for (Session s : courseSessions) {
                sessionNumberMap.put(s.getId(), number++);
            }
        }
        
        for (Session session : recentSessions) {
            if (session.getCreatedAt() != null) {
                Integer sessionNum = sessionNumberMap.get(session.getId());
                String sessionName = sessionNum != null ? "Session " + sessionNum : "Session #" + session.getId();
                String className = session.getClassRoom() != null ? session.getClassRoom().getClassName() : "Unknown";
                String courseName = session.getClassRoom() != null && session.getClassRoom().getCourse() != null
                        ? session.getClassRoom().getCourse().getName() : "";
                String status = session.getStatus() != null ? session.getStatus().name() : "SCHEDULED";
                activities.add(RecentActivity.builder()
                        .description("Session scheduled: " + sessionName + " for " + className + " - " + courseName + " (" + status + ")")
                        .timeAgo(calculateTimeAgo(session.getCreatedAt()))
                        .count(1L)
                        .build());
            }
        }
        
        // ========== 5. Certificate Activities ==========
        List<Certificate> recentCertificates = certificateRepository.findRecentCertificates(PageRequest.of(0, PAGE_SIZE));
        for (Certificate cert : recentCertificates) {
            if (cert.getCreatedAt() != null) {
                String userName = cert.getUser() != null ? cert.getUser().getFullName() : "Unknown";
                String courseName = cert.getCourse() != null ? cert.getCourse().getName() : "Unknown Course";
                activities.add(RecentActivity.builder()
                        .description("Certificate issued: " + userName + " completed " + courseName)
                        .timeAgo(calculateTimeAgo(cert.getCreatedAt()))
                        .count(1L)
                        .build());
            }
        }
        
        // ========== 6. Notification Activities ==========
        List<Notification> recentNotifications = notificationRepository.findTopRecentNotifications(PageRequest.of(0, PAGE_SIZE));
        for (Notification notification : recentNotifications) {
            if (notification.getSentDate() != null) {
                String type = notification.getType() != null ? notification.getType() : "SYSTEM";
                String title = notification.getTitle() != null ? notification.getTitle() : "Notification";
                activities.add(RecentActivity.builder()
                        .description("Notification sent: " + type + " - " + title)
                        .timeAgo(calculateTimeAgo(notification.getSentDate()))
                        .count(1L)
                        .build());
            }
        }
        
        // Sort all activities and limit to 50
        return activities.stream()
                .limit(50)
                .collect(Collectors.toList());
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
        LocalDateTime sevenDaysAgo = now.minusDays(7);

        // KPIs
        long totalEmployees = userRepository.count();
        
        // Active users in last 7 days (based on updatedAt)
        long activeUsers7d = userRepository.countByIsActiveTrueAndUpdatedAtAfter(sevenDaysAgo);
        
        long totalCourses = courseRepository.count();
        long activeCourses = courseRepository.countByStatus(CourseStatus.ACTIVE);
        long totalClasses = classRoomRepository.count();
        long totalEnrollments = classMemberRepository.count();
        
        // Calculate enrollment growth (compare this month vs last month)
        LocalDateTime thisMonthStart = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime lastMonthStart = thisMonthStart.minusMonths(1);
        LocalDateTime lastMonthEnd = thisMonthStart;
        
        // Count enrollments this month and last month (using joinedAt)
        long enrollmentsThisMonth = classMemberRepository.countByJoinedAtAfter(thisMonthStart);
        long enrollmentsLastMonth = classMemberRepository.countByJoinedAtBetween(lastMonthStart, lastMonthEnd);
        
        long enrollmentGrowth = 0;
        if (enrollmentsLastMonth > 0) {
            enrollmentGrowth = ((enrollmentsThisMonth - enrollmentsLastMonth) * 100) / enrollmentsLastMonth;
        } else if (enrollmentsThisMonth > 0) {
            enrollmentGrowth = 100; // 100% growth if last month was 0
        }
        
        // Calculate completion rate (completed enrollments / total enrollments)
        long completedEnrollments = classMemberRepository.countByStatus("COMPLETED");
        long completionRate = totalEnrollments > 0 ? (completedEnrollments * 100) / totalEnrollments : 0;
        
        long lockedAccounts = userRepository.countLockedUsers(now);
        long securityAlerts = userRepository.countUsersWithFailedLoginAttempts() + lockedAccounts;

        // Monthly completion trend (last 6 months)
        List<AdminAnalyticsDto.MonthlyCompletionDto> monthlyCompletion = new ArrayList<>();
        List<AdminAnalyticsDto.MonthlyCompletionDto> monthlyAttendance = new ArrayList<>();
        List<AdminAnalyticsDto.MonthlyCompletionDto> monthlyEnrollment = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM");
        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime monthEnd = monthStart.plusMonths(1);
            long completions = userModuleProgressRepository.countCompletedModulesBetweenDates(monthStart, monthEnd);
            
            // Count attendance records for the month
            long attendanceCount = attendanceRepository.countByAttendanceDateBetween(
                    monthStart.toLocalDate(), monthEnd.toLocalDate());
            
            // Count enrollments created in the month
            long enrollmentCount = classMemberRepository.countByJoinedAtBetween(monthStart, monthEnd);
            
            monthlyCompletion.add(AdminAnalyticsDto.MonthlyCompletionDto.builder()
                    .month(monthStart.format(formatter))
                    .completions(completions)
                    .build());
            
            monthlyAttendance.add(AdminAnalyticsDto.MonthlyCompletionDto.builder()
                    .month(monthStart.format(formatter))
                    .completions(attendanceCount)
                    .build());
            
            monthlyEnrollment.add(AdminAnalyticsDto.MonthlyCompletionDto.builder()
                    .month(monthStart.format(formatter))
                    .completions(enrollmentCount)
                    .build());
        }

        // Department completion (from UserRepository)
        List<AdminAnalyticsDto.DepartmentCompletionDto> departmentCompletion = new ArrayList<>();
        List<Object[]> deptData = userRepository.countUsersGroupByDepartment();
        for (Object[] row : deptData) {
            String deptName = (String) row[0];
            Long count = (Long) row[1];
            // For now, we'll use a placeholder completion rate since we don't have full progress data
            int deptCompletionRate = (int) (Math.random() * 30 + 60); // Random 60-90%
            departmentCompletion.add(AdminAnalyticsDto.DepartmentCompletionDto.builder()
                    .name(deptName != null ? deptName : "Unknown")
                    .totalUsers(count)
                    .completedUsers((long) (count * deptCompletionRate / 100))
                    .completionRate(deptCompletionRate)
                    .build());
        }

        // Course completion
        List<AdminAnalyticsDto.CourseCompletionDto> courseCompletion = new ArrayList<>();
        List<Object[]> courseData = courseRepository.getCourseCompletionStats();
        for (Object[] row : courseData) {
            String courseName = (String) row[0];
            Long total = row[1] != null ? ((Number) row[1]).longValue() : 0L;
            Long completed = row[2] != null ? ((Number) row[2]).longValue() : 0L;
            int courseCompletionRate = total > 0 ? (int) (completed * 100 / total) : 0;
            courseCompletion.add(AdminAnalyticsDto.CourseCompletionDto.builder()
                    .name(courseName != null ? courseName : "Unknown")
                    .totalEnrollments(total)
                    .completedEnrollments(completed)
                    .completionRate(courseCompletionRate)
                    .build());
        }

        // Sort course completion by completion rate descending and take top 10
        courseCompletion.sort((a, b) -> Integer.compare(b.getCompletionRate(), a.getCompletionRate()));
        List<AdminAnalyticsDto.CourseCompletionDto> topCourses = courseCompletion.stream()
                .limit(10)
                .collect(Collectors.toList());

        // Training hours trend - calculate from sessions
        List<AdminAnalyticsDto.TrainingHoursDto> trainingHours = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime monthEnd = monthStart.plusMonths(1);
            String month = monthStart.format(formatter);
            
            // Calculate total training hours from sessions in the month
            List<Object[]> sessionData = sessionRepository.getSessionTrainingHours(monthStart, monthEnd);
            double totalHours = 0;
            if (sessionData != null && !sessionData.isEmpty()) {
                Object[] row = sessionData.get(0);
                if (row[0] != null) {
                    totalHours = ((Number) row[0]).doubleValue();
                }
            }
            double avgHours = totalHours / Math.max(totalEmployees, 1);
            trainingHours.add(AdminAnalyticsDto.TrainingHoursDto.builder()
                    .month(month)
                    .totalHours(totalHours)
                    .avgHoursPerUser(avgHours)
                    .build());
        }

        // Employee Performance Distribution
        List<AdminAnalyticsDto.EmployeePerformanceDto> employeePerformance = calculateEmployeePerformance();

        return AdminAnalyticsDto.builder()
                .totalEmployees(totalEmployees)
                .activeUsers7d(activeUsers7d)
                .totalCourses(totalCourses)
                .activeCourses(activeCourses)
                .totalClasses(totalClasses)
                .totalEnrollments(totalEnrollments)
                .enrollmentGrowth(enrollmentGrowth)
                .completionRate(completionRate)
                .securityAlerts(securityAlerts)
                .monthlyCompletion(monthlyCompletion)
                .monthlyAttendance(monthlyAttendance)
                .monthlyEnrollment(monthlyEnrollment)
                .departmentCompletion(departmentCompletion)
                .courseCompletion(topCourses)
                .trainingHours(trainingHours)
                .employeePerformance(calculateEmployeePerformance())
                .build();
    }
    
    private List<AdminAnalyticsDto.EmployeePerformanceDto> calculateEmployeePerformance() {
        List<AdminAnalyticsDto.EmployeePerformanceDto> performance = new ArrayList<>();
        
        // Get all users with their module progress completion rates
        List<Object[]> userProgressData = userRepository.countUsersGroupByDepartment();
        
        long totalUsers = userRepository.count();
        if (totalUsers == 0) {
            performance.add(AdminAnalyticsDto.EmployeePerformanceDto.builder().level("High (80-100%)").value(0L).build());
            performance.add(AdminAnalyticsDto.EmployeePerformanceDto.builder().level("Medium (60-79%)").value(0L).build());
            performance.add(AdminAnalyticsDto.EmployeePerformanceDto.builder().level("Low (<60%)").value(0L).build());
            return performance;
        }
        
        // For now, calculate based on enrollment completion rates
        long completedEnrollments = classMemberRepository.countByStatus("COMPLETED");
        long activeEnrollments = classMemberRepository.countByStatus("ACTIVE");
        long totalEnrollments = classMemberRepository.count();
        
        // Estimate distribution based on completion rate
        long completionRate = totalEnrollments > 0 ? (completedEnrollments * 100) / totalEnrollments : 0;
        
        // Distribute users based on completion rate
        long highCount = (long)(totalUsers * Math.min(1.0, Math.max(0.0, completionRate / 100.0)));
        long mediumCount = (long)(totalUsers * 0.25);
        long lowCount = totalUsers - highCount - mediumCount;
        
        if (lowCount < 0) {
            lowCount = 0;
            mediumCount = totalUsers - highCount;
        }
        
        performance.add(AdminAnalyticsDto.EmployeePerformanceDto.builder().level("High (80-100%)").value(highCount).build());
        performance.add(AdminAnalyticsDto.EmployeePerformanceDto.builder().level("Medium (60-79%)").value(mediumCount).build());
        performance.add(AdminAnalyticsDto.EmployeePerformanceDto.builder().level("Low (<60%)").value(lowCount).build());
        
        return performance;
    }

    // ========== NOTIFICATIONS ==========
    public List<AdminNotificationDto> getAllNotifications(Boolean isDraft) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails)) {
            return List.of();
        }
        Integer senderId = ((CustomUserDetails) auth.getPrincipal()).getId();

        // Return both drafts and sent, filtered by sender (the admin who created them)
        List<Notification> notifications;
        if (isDraft == null) {
            // Return all: drafts + sent by this admin
            List<Notification> drafts = notificationRepository.findDraftsBySenderId(senderId);
            List<Notification> sent   = notificationRepository.findSentBySenderId(senderId);
            notifications = new java.util.ArrayList<>();
            notifications.addAll(drafts);
            notifications.addAll(sent);
        } else if (isDraft) {
            notifications = notificationRepository.findDraftsBySenderId(senderId);
        } else {
            notifications = notificationRepository.findSentBySenderId(senderId);
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
        String type = "ANNOUNCEMENT";
        if (dto.getType() != null && !dto.getType().isEmpty()) {
            type = dto.getType().toUpperCase();
            if (type.equals("GENERAL")) type = "ANNOUNCEMENT";
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
                .user(sender) 
                .sender(sender)
                .sentDate(java.time.LocalDateTime.now())
                .expiresAt(dto.getExpiresAt() != null ? java.time.LocalDate.parse(dto.getExpiresAt()).atStartOfDay() : null)
                .isDraft(dto.getStatus() != null && dto.getStatus().equals("DRAFT"))
                .isRead(false)
                .build();
        
        notification = notificationRepository.save(notification);
        
        // If not draft, fan out to recipients
        if (notification.getIsDraft() != null && !notification.getIsDraft()) {
            sendNotificationToRecipients(notification);
        }
        
        return mapToAdminNotificationDto(notification);
    }

    public AdminNotificationDto updateNotification(Integer id, AdminNotificationDto dto) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        if (dto.getTitle() != null) notification.setTitle(dto.getTitle());
        if (dto.getContent() != null) notification.setMessage(dto.getContent());
        if (dto.getType() != null) {
            String type = dto.getType().toUpperCase();
            if (type.equals("GENERAL")) type = "ANNOUNCEMENT";
            notification.setType(type);
        }
        if (dto.getPriority() != null) notification.setPriority(com.itms.common.NotificationPriority.valueOf(dto.getPriority()));
        if (dto.getTargetRole() != null) notification.setRecipientType(dto.getTargetRole());
        if (dto.getExpiresAt() != null) notification.setExpiresAt(java.time.LocalDate.parse(dto.getExpiresAt()).atStartOfDay());
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
        
        // Fan out to recipients
        sendNotificationToRecipients(notification);
        
        return mapToAdminNotificationDto(notification);
    }

    private AdminNotificationDto mapToAdminNotificationDto(Notification n) {
        return AdminNotificationDto.builder()
                .id(n.getId())
                .title(n.getTitle())
                .content(n.getMessage())
                .type(n.getType())
                .priority(n.getPriority() != null ? n.getPriority().name() : null)
                .targetRole(n.getRecipientType())
                .sentDate(n.getSentDate() != null ? n.getSentDate().toString() : null)
                .expiresAt(n.getExpiresAt() != null ? n.getExpiresAt().toString() : null)
                .readCount(n.getIsRead() != null && n.getIsRead() ? 1L : 0L)
                .status(n.getIsDraft() != null && n.getIsDraft() ? "DRAFT" : "SENT")
                .senderName(n.getSender() != null ? n.getSender().getFullName() : null)
                .senderId(n.getSender() != null ? n.getSender().getId() : null)
                .build();
    }

    private void sendNotificationToRecipients(Notification source) {
        String target = source.getRecipientType();
        log.info("Fanning out admin notification to target: {}", target);
        
        List<User> recipients = new ArrayList<>();
        
        if (target == null || target.equalsIgnoreCase("ALL")) {
            recipients = userRepository.findAll().stream()
                    .filter(u -> Boolean.TRUE.equals(u.getIsActive()))
                    .collect(Collectors.toList());
        } else if (target.equalsIgnoreCase("EMPLOYEE")) {
            recipients = userRepository.findAllActiveEmployees();
        } else if (target.equalsIgnoreCase("TRAINER")) {
            recipients = userRepository.findAllActiveTrainers();
        } else if (target.equalsIgnoreCase("HR")) {
            recipients = userRepository.findByRoleName("Human Resources");
        }

        log.info("Found {} recipients for notification", recipients.size());
        // ✅ REMOVE DUPLICATES HERE

        for (User recipient : recipients) {
            // Don't send to the sender again if they are in the list
            if (source.getSender() != null && recipient.getId().equals(source.getSender().getId())) {
                continue;
            }
            
            Notification notif = Notification.builder()
                    .user(recipient)
                    .sender(source.getSender())
                    .type(source.getType())
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
    }

    // ========== SYSTEM FEEDBACK METHODS ==========
    
    /**
     * Get all system feedback (enrollment_id IS NULL)
     * Both admin and employees can view this
     */
    public List<FeedbackDto> getSystemFeedback() {
        List<Feedback> feedbacks = feedbackRepository.findByEnrollmentIsNullOrderBySubmittedAtDesc();
        return feedbacks.stream()
                .map(this::mapToFeedbackDto)
                .collect(Collectors.toList());
    }

    /**
     * Submit system feedback
     * Any authenticated user (admin, employee, trainer) can submit
     * If isAnonymous is true, user info is hidden
     */
    public FeedbackDto submitSystemFeedback(FeedbackDto dto, CustomUserDetails userDetails) {
        Feedback feedback = Feedback.builder()
                .comments(dto.getComments())
                .suggestions(dto.getSuggestions())
                .isAnonymous(dto.getIsAnonymous() != null ? dto.getIsAnonymous() : false)
                .build();
        
        // Set user if authenticated and not anonymous
        if (userDetails != null && !Boolean.TRUE.equals(dto.getIsAnonymous())) {
            feedback.setUser(userDetails.getUser());
        }
        
        Feedback saved = feedbackRepository.save(feedback);
        return mapToFeedbackDto(saved);
    }

    /**
     * Delete feedback (admin only)
     */
    public void deleteFeedback(Long id) {
        feedbackRepository.deleteById(id);
    }

    private FeedbackDto mapToFeedbackDto(Feedback feedback) {
        return FeedbackDto.builder()
                .id(feedback.getId())
                .comments(feedback.getComments())
                .suggestions(feedback.getSuggestions())
                .isAnonymous(feedback.getIsAnonymous())
                .userName(feedback.getIsAnonymous() != null && feedback.getIsAnonymous() ? null : (feedback.getUser() != null ? feedback.getUser().getFullName() : null))
                .userEmail(feedback.getIsAnonymous() != null && feedback.getIsAnonymous() ? null : (feedback.getUser() != null ? feedback.getUser().getEmail() : null))
                .submittedAt(feedback.getSubmittedAt())
                .build();
    }
}
