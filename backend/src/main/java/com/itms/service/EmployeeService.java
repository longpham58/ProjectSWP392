package com.itms.service;

import com.itms.common.EnrollmentStatus;
import com.itms.dto.employee.EmployeeDtos.*;
import com.itms.entity.*;
import com.itms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final FeedbackRepository feedbackRepository;
    private final CommentRepository commentRepository;
    private final NotificationRepository notificationRepository;
    private final SessionRepository sessionRepository;
    private final CertificateRepository certificateRepository;
    private final PasswordEncoder passwordEncoder;
    private final ClassMemberRepository classMemberRepository;
    private final CourseModuleRepository courseModuleRepository;
    private final UserModuleProgressRepository userModuleProgressRepository;

    // ─── Dashboard ────────────────────────────────────────────────────────────

    public DashboardResponse getDashboard(Integer userId) {
        Integer total = enrollmentRepository.countEnrollmentsByUserId(userId);
        Integer completed = enrollmentRepository.countCompletedEnrollmentsByUserId(userId);
        double progress = (total != null && total > 0 && completed != null)
                ? (completed * 100.0 / total) : 0.0;

        List<Course> recommended = courseRepository.findAll().stream()
                .limit(5).collect(Collectors.toList());

        List<CourseSummary> recommendedDtos = recommended.stream()
                .map(c -> mapCourseSummary(c, userId))
                .collect(Collectors.toList());

        List<NotificationDto> notifications = notificationRepository
                .findByUserIdOrderBySentDateDesc(userId).stream()
                .limit(5)
                .map(this::mapNotification)
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .totalEnrolledCourses(total != null ? total : 0)
                .completedCourses(completed != null ? completed : 0)
                .learningProgress(progress)
                .recommendedCourses(recommendedDtos)
                .upcomingTrainingSessions(List.of())
                .notifications(notifications)
                .build();
    }

    // ─── Courses ──────────────────────────────────────────────────────────────

    public List<CourseSummary> browseCourses(String keyword, String category, Integer userId) {
        return courseRepository.findAll().stream()
                .filter(c -> keyword == null || c.getName().toLowerCase().contains(keyword.toLowerCase()))
                .filter(c -> category == null || category.equalsIgnoreCase(c.getCategory()))
                .map(c -> mapCourseSummary(c, userId))
                .collect(Collectors.toList());
    }

    public CourseDetailResponse getCourseDetail(Integer courseId, Integer userId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));

        // Load modules with materials eagerly
        List<CourseModule> modules = courseModuleRepository.findByCourseIdOrderByDisplayOrderAsc(courseId);

        // Load user progress for each module
        List<ModuleDto> moduleDtos = modules.stream().map(module -> {
            List<LessonDto> lessons = module.getMaterials() != null
                    ? module.getMaterials().stream().map(mat -> {
                        // Determine completion status from UserModuleProgress
                        String status = "IN_PROGRESS";
                        Optional<UserModuleProgress> prog = userModuleProgressRepository
                                .findByUserIdAndModuleId(userId, module.getId());
                        if (prog.isPresent() && prog.get().getIsCompleted()) {
                            status = "COMPLETED";
                        }
                        return LessonDto.builder()
                                .id(mat.getId() != null ? mat.getId().intValue() : null)
                                .title(mat.getTitle())
                                .type(mat.getType() != null ? mat.getType().name() : "DOCUMENT")
                                .fileUrl(mat.getFileUrl())
                                .isDownloadable(mat.getIsDownloadable())
                                .status(status)
                                .build();
                    }).collect(Collectors.toList())
                    : List.of();

            return ModuleDto.builder()
                    .id(module.getId())
                    .title(module.getTitle())
                    .displayOrder(module.getDisplayOrder())
                    .lessons(lessons)
                    .build();
        }).collect(Collectors.toList());

        // Calculate progress: completed modules / total modules
        long completedModules = modules.stream().filter(m -> {
            Optional<UserModuleProgress> prog = userModuleProgressRepository
                    .findByUserIdAndModuleId(userId, m.getId());
            return prog.isPresent() && prog.get().getIsCompleted();
        }).count();
        int progress = modules.isEmpty() ? 0 : (int) (completedModules * 100 / modules.size());

        long enrolledStudents = classMemberRepository.countActiveStudentsByCourseId(courseId);

        return CourseDetailResponse.builder()
                .id(course.getId())
                .title(course.getName())
                .description(course.getDescription())
                .category(course.getCategory())
                .durationHours(course.getDurationHours() != null ? course.getDurationHours().intValue() : null)
                .trainerName(course.getTrainer() != null ? course.getTrainer().getFullName() : null)
                .enrolledStudents(enrolledStudents)
                .enrollmentStatus(null) // Employees don't enroll — HR assigns them
                .progress(progress)
                .modules(moduleDtos)
                .build();
    }

    @Transactional
    public EnrollmentResponse enroll(Integer courseId, EnrollmentRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Find first session of the course
        Session session = course.getSessions() != null && !course.getSessions().isEmpty()
                ? course.getSessions().get(0) : null;
        if (session == null) throw new RuntimeException("No session available for this course");

        Enrollment enrollment = Enrollment.builder()
                .user(user)
                .session(session)
                .status(EnrollmentStatus.REGISTERED)
                .registeredAt(LocalDateTime.now())
                .certificateIssued(false)
                .build();
        enrollment = enrollmentRepository.save(enrollment);

        return mapEnrollmentResponse(enrollment);
    }

    @Transactional
    public EnrollmentResponse cancelEnrollment(Integer courseId, Integer userId) {
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        enrollment.setStatus(EnrollmentStatus.CANCELLED);
        enrollment = enrollmentRepository.save(enrollment);
        return mapEnrollmentResponse(enrollment);
    }

    public List<CourseSummary> myLearning(Integer userId) {
        // Return ALL active courses, with enrollment status from ClassMember if exists
        List<ClassMember> memberships = classMemberRepository.findByUserId(userId);
        // Map courseId -> classMember status
        java.util.Map<Integer, String> courseStatusMap = new java.util.HashMap<>();
        for (ClassMember cm : memberships) {
            if (cm.getClassRoom() != null && cm.getClassRoom().getCourse() != null) {
                courseStatusMap.put(cm.getClassRoom().getCourse().getId(), cm.getStatus());
            }
        }

        return courseRepository.findAll().stream()
                .filter(c -> c.getStatus() == com.itms.common.CourseStatus.ACTIVE)
                .map(c -> {
                    String memberStatus = courseStatusMap.get(c.getId());
                    String enrollmentStatus = memberStatus != null ? memberStatus : null;
                    return CourseSummary.builder()
                            .id(c.getId())
                            .title(c.getName())
                            .category(c.getCategory())
                            .durationHours(c.getDurationHours() != null ? c.getDurationHours().intValue() : null)
                            .trainerName(c.getTrainer() != null ? c.getTrainer().getFullName() : null)
                            .enrolledStudents((int) classMemberRepository.countActiveStudentsByCourseId(c.getId()))
                            .progress(0)
                            .enrollmentStatus(enrollmentStatus)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public MarkLessonResponse markLessonCompleted(Integer courseId, MarkLessonRequest request) {
        Integer userId = request.getUserId();
        Integer lessonId = request.getLessonId();

        // Find which module this material belongs to
        List<CourseModule> modules = courseModuleRepository.findByCourseIdOrderByDisplayOrderAsc(courseId);

        CourseModule targetModule = null;
        for (CourseModule m : modules) {
            if (m.getMaterials() != null) {
                boolean found = m.getMaterials().stream()
                        .anyMatch(mat -> mat.getId() != null && mat.getId().intValue() == lessonId);
                if (found) { targetModule = m; break; }
            }
        }

        if (targetModule != null) {
            final Integer moduleId = targetModule.getId();
            Optional<UserModuleProgress> existing = userModuleProgressRepository
                    .findByUserIdAndModuleId(userId, moduleId);
            if (existing.isEmpty()) {
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found"));
                UserModuleProgress prog = UserModuleProgress.builder()
                        .user(user)
                        .module(targetModule)
                        .isCompleted(true)
                        .completedAt(LocalDateTime.now())
                        .progressPercentage(java.math.BigDecimal.valueOf(100))
                        .timeSpentMinutes(0)
                        .build();
                userModuleProgressRepository.save(prog);
            } else if (!Boolean.TRUE.equals(existing.get().getIsCompleted())) {
                existing.get().setIsCompleted(true);
                existing.get().setCompletedAt(LocalDateTime.now());
                userModuleProgressRepository.save(existing.get());
            }
        }

        // Recalculate progress
        long completedModules = modules.stream().filter(m -> {
            Optional<UserModuleProgress> prog = userModuleProgressRepository
                    .findByUserIdAndModuleId(userId, m.getId());
            return prog.isPresent() && prog.get().getIsCompleted();
        }).count();
        int progress = modules.isEmpty() ? 0 : (int) (completedModules * 100 / modules.size());

        return MarkLessonResponse.builder().progress(progress).build();
    }

    // ─── Feedback ─────────────────────────────────────────────────────────────

    public List<FeedbackDto> getFeedbacks(Integer courseId) {
        return feedbackRepository.findBySessionCourseId(courseId).stream()
                .map(this::mapFeedback)
                .collect(Collectors.toList());
    }

    @Transactional
    public FeedbackDto upsertFeedback(Integer courseId, FeedbackRequest request) {
        var existing = feedbackRepository.findByUserIdAndEnrollmentCourseId(request.getUserId(), courseId);
        Feedback feedback;
        if (existing.isPresent()) {
            feedback = existing.get();
            feedback.setOverallRating(request.getRating());
            feedback.setComments(request.getComment());
        } else {
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            feedback = Feedback.builder()
                    .user(user)
                    .overallRating(request.getRating())
                    .comments(request.getComment())
                    .build();
        }
        feedback = feedbackRepository.save(feedback);
        return mapFeedback(feedback);
    }

    @Transactional
    public void deleteFeedback(Integer courseId, Integer feedbackId, Integer userId) {
        feedbackRepository.deleteById((long) feedbackId);
    }

    // ─── Comments ─────────────────────────────────────────────────────────────

    public CommentPageResponse getComments(Integer courseId, int page, int size) {
        Page<Comment> commentPage = commentRepository
                .findByCourse_IdAndParentIsNullOrderByCreatedAtDesc(courseId, PageRequest.of(page, size));
        List<CommentDto> dtos = commentPage.getContent().stream()
                .map(this::mapComment)
                .collect(Collectors.toList());
        return CommentPageResponse.builder()
                .comments(dtos)
                .page(page)
                .size(size)
                .totalElements(commentPage.getTotalElements())
                .totalPages(commentPage.getTotalPages())
                .hasNext(commentPage.hasNext())
                .build();
    }

    @Transactional
    public CommentDto addComment(Integer courseId, CommentRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        Comment parent = request.getParentId() != null
                ? commentRepository.findById(request.getParentId()).orElse(null) : null;

        Comment comment = Comment.builder()
                .course(course)
                .user(user)
                .content(request.getContent())
                .parent(parent)
                .likeCount(0)
                .build();
        comment = commentRepository.save(comment);
        return mapComment(comment);
    }

    @Transactional
    public void deleteComment(Integer commentId, Integer userId) {
        commentRepository.deleteById(commentId);
    }

    @Transactional
    public CommentDto likeComment(Integer commentId, Integer userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        comment.setLikeCount(comment.getLikeCount() + 1);
        comment = commentRepository.save(comment);
        return mapComment(comment);
    }

    // ─── Notifications ────────────────────────────────────────────────────────

    public List<NotificationDto> notifications(Integer userId) {
        return notificationRepository.findByUserIdOrderBySentDateDesc(userId).stream()
                .map(this::mapNotification)
                .collect(Collectors.toList());
    }

    @Transactional
    public NotificationDto markNotificationRead(Integer notificationId, Integer userId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setIsRead(true);
        n.setReadAt(LocalDateTime.now());
        n = notificationRepository.save(n);
        return mapNotification(n);
    }

    @Transactional
    public void deleteNotification(Integer notificationId, Integer userId) {
        notificationRepository.deleteById(notificationId);
    }

    // ─── Schedule ─────────────────────────────────────────────────────────────

    public List<ScheduleDto> getSchedule(Integer userId) {
        return sessionRepository.findByUserIdOrderByDateAsc(userId).stream()
                .map(s -> ScheduleDto.builder()
                        .id(s.getId() != null ? s.getId().intValue() : null)
                        .courseId(s.getCourse() != null ? s.getCourse().getId() : null)
                        .courseName(s.getCourse() != null ? s.getCourse().getName() : null)
                        .date(s.getDate())
                        .timeStart(s.getTimeStart())
                        .timeEnd(s.getTimeEnd())
                        .location(s.getLocation())
                        .locationType(s.getLocationType() != null ? s.getLocationType().name() : null)
                        .meetingLink(s.getMeetingLink())
                        .trainerName(s.getTrainer() != null ? s.getTrainer().getFullName()
                                : (s.getCourse() != null && s.getCourse().getTrainer() != null
                                        ? s.getCourse().getTrainer().getFullName() : null))
                        .status(s.getStatus() != null ? s.getStatus().name().toLowerCase() : "upcoming")
                        .build())
                .collect(Collectors.toList());
    }

    // ─── Profile ──────────────────────────────────────────────────────────────

    public User getProfile(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public User updateProfile(Integer userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(Integer userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    // ─── Certificates ─────────────────────────────────────────────────────────

    public List<CertificateDto> getCertificates(Integer userId) {
        return certificateRepository.findByUserId(userId).stream()
                .map(c -> CertificateDto.builder()
                        .id(c.getId())
                        .courseId(c.getCourse() != null ? c.getCourse().getId() : null)
                        .courseName(c.getCourse() != null ? c.getCourse().getName() : null)
                        .courseCategory(c.getCourse() != null ? c.getCourse().getCategory() : null)
                        .trainerName(c.getCourse() != null && c.getCourse().getTrainer() != null
                                ? c.getCourse().getTrainer().getFullName() : null)
                        .certificateCode(c.getCertificateCode())
                        .issueDate(c.getIssueDate() != null ? c.getIssueDate().toString() : null)
                        .grade(c.getGrade() != null ? c.getGrade().name() : null)
                        .score(c.getScore() != null ? c.getScore().intValue() : null)
                        .isValid(c.getIsValid())
                        .build())
                .collect(Collectors.toList());
    }

    // ─── Mappers ──────────────────────────────────────────────────────────────

    private CourseSummary mapCourseSummary(Course c, Integer userId) {
        return CourseSummary.builder()
                .id(c.getId())
                .title(c.getName())
                .category(c.getCategory())
                .durationHours(c.getDurationHours() != null ? c.getDurationHours().intValue() : null)
                .trainerName(c.getTrainer() != null ? c.getTrainer().getFullName() : null)
                .enrolledStudents(0)
                .progress(0)
                .enrollmentStatus(null)
                .build();
    }

    private EnrollmentResponse mapEnrollmentResponse(Enrollment e) {
        return EnrollmentResponse.builder()
                .id(e.getId())
                .userId(e.getUser() != null ? e.getUser().getId() : null)
                .courseId(e.getSession() != null && e.getSession().getCourse() != null
                        ? e.getSession().getCourse().getId() : null)
                .progress(e.getCompletionRate() != null ? e.getCompletionRate().intValue() : 0)
                .status(e.getStatus() != null ? e.getStatus().name() : null)
                .enrolledAt(e.getRegisteredAt())
                .build();
    }

    private FeedbackDto mapFeedback(Feedback f) {
        return FeedbackDto.builder()
                .id(f.getId() != null ? f.getId().intValue() : null)
                .userId(f.getUser() != null ? f.getUser().getId() : null)
                .userName(f.getUser() != null ? f.getUser().getFullName() : null)
                .rating(f.getOverallRating())
                .comment(f.getComments())
                .createdAt(f.getSubmittedAt())
                .build();
    }

    private CommentDto mapComment(Comment c) {
        List<CommentDto> replies = c.getReplies() != null
                ? c.getReplies().stream().map(this::mapComment).collect(Collectors.toList())
                : List.of();
        return CommentDto.builder()
                .id(c.getId())
                .userId(c.getUser() != null ? c.getUser().getId() : null)
                .userName(c.getUser() != null ? c.getUser().getFullName() : null)
                .content(c.getContent())
                .parentId(c.getParent() != null ? c.getParent().getId() : null)
                .likeCount(c.getLikeCount())
                .createdAt(c.getCreatedAt())
                .replies(replies)
                .build();
    }

    private NotificationDto mapNotification(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .userId(n.getUser() != null ? n.getUser().getId() : null)
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .readStatus(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
