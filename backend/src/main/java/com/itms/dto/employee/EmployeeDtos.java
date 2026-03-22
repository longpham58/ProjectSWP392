package com.itms.dto.employee;

import com.itms.common.CompletionStatus;
import com.itms.common.EnrollmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

public class EmployeeDtos {
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardResponse {
        private long totalEnrolledCourses;
        private long completedCourses;
        private long inProgressCourses;
        private double learningProgress;
        private long totalCertificates;
        private long unreadNotifications;
        private List<CourseSummary> myCourses;       // courses employee is enrolled in
        private List<CourseSummary> recommendedCourses;
        private List<NotificationDto> notifications;
        private List<ScheduleDto> upcomingSessions;  // next 3 upcoming sessions
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseSummary {
        private Integer id;
        private String title;
        private String category;
        private Integer durationHours;
        private String trainerName;
        private long enrolledStudents;
        private Integer progress;
        private String enrollmentStatus;  // String — class member status or null
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LessonDto {
        private Integer id;
        private String title;
        private Integer durationMinutes;
        private String status;           // "COMPLETED", "IN_PROGRESS", etc.
        private String type;             // VIDEO, DOCUMENT, etc.
        private String fileUrl;
        @com.fasterxml.jackson.annotation.JsonProperty("isDownloadable")
        private Boolean isDownloadable;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ModuleDto {
        private Integer id;
        private String title;
        private Integer displayOrder;
        private List<LessonDto> lessons;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseDetailResponse {
        private Integer id;
        private String title;
        private String summary;
        private String description;
        private String category;
        private Integer durationHours;
        private String trainerName;
        private long enrolledStudents;
        private String enrollmentStatus;  // String — null for employees (HR assigns)
        private Integer progress;
        private List<ModuleDto> modules;
    }

    @Data
    public static class EnrollmentRequest {
        private Integer userId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EnrollmentResponse {
        private Integer id;
        private Integer userId;
        private Integer courseId;
        private Integer progress;
        private String status;
        private LocalDateTime enrolledAt;
    }

    @Data
    public static class MarkLessonRequest {
        private Integer userId;
        private Integer lessonId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MarkLessonResponse {
        private Integer progress;
    }

    @Data
    public static class FeedbackRequest {
        private Integer userId;
        private Integer rating;
        private String comment;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeedbackDto {
        private Integer id;
        private Integer courseId;
        private Integer userId;
        private String userName;
        private Integer rating;
        private String comment;
        private LocalDateTime createdAt;
    }

    @Data
    public static class CommentRequest {
        private Integer userId;
        private String content;
        private Integer parentId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommentDto {
        private Integer id;
        private Integer courseId;
        private Integer userId;
        private String userName;
        private String content;
        private Integer parentId;
        private Integer likeCount;
        private LocalDateTime createdAt;
        private List<CommentDto> replies;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommentPageResponse {
        private List<CommentDto> comments;
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean hasNext;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationDto {
        private Integer id;
        private Integer userId;
        private String title;
        private String message;
        private String type;
        private Boolean readStatus;
        private LocalDateTime createdAt;
    }

    @Data
    public static class ProfileUpdateRequest {
        private String fullName;
        private String phone;
        private String avatarUrl;
    }

    @Data
    public static class ChangePasswordRequest {
        private String oldPassword;
        private String newPassword;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScheduleDto {
        private Integer id;
        private Integer courseId;
        private String courseCode;
        private String courseName;
        private String sessionName;
        private Integer sessionNumber;
        private LocalDate date;
        private LocalTime timeStart;
        private LocalTime timeEnd;
        private String location;
        private String locationType;
        private String meetingLink;
        private String trainerName;
        private String status; // "upcoming" | "completed" | "cancelled"
        private String classCode;
        private String className;
        private String attendanceStatus; // null | "COMPLETED" | "ABSENT" | "IN_PROGRESS"
        private Boolean attended; // true | false | null (not marked yet)
    }

    // ─── Quiz DTOs ────────────────────────────────────────────────────────────

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class QuizOptionDto {
        private Integer id;
        private String optionText;
        private Integer displayOrder;
        private Boolean isCorrect; // null before submission, revealed after
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class QuizQuestionDto {
        private Integer id;
        private String question;
        private Integer displayOrder;
        private List<QuizOptionDto> options;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class QuizDto {
        private Integer id;
        private String title;
        private String description;
        private Integer quizOrder;
        private Integer passingScore;
        private Integer timeLimitMinutes;
        private Integer maxAttempts;
        private Integer totalQuestions;
        private Boolean isFinalExam;
        private List<QuizQuestionDto> questions;
        private Boolean locked;
        private Boolean passed;
        private Integer bestScore;
        private Integer attemptCount;
        private Boolean exhausted;       // true when failed all attempts
        private Integer passedRegularCount;
        private Integer totalRegularCount;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class QuizSubmitRequest {
        private Integer userId;
        private Map<Integer, Integer> answers; // questionId -> selectedOptionId
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class QuizAnswerReviewDto {
        private Integer questionId;
        private String question;
        private Integer selectedOptionId;
        private Integer correctOptionId;
        private Boolean isCorrect;
        private List<QuizOptionDto> options;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class QuizResultDto {
        private Integer attemptId;
        private Integer quizId;
        private String quizTitle;
        private Integer score;
        private Boolean passed;
        private Integer passingScore;
        private String submittedAt;
        private List<QuizAnswerReviewDto> answers;
        private Boolean courseCompleted;
        private String certificateCode;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CertificateDto {
        private Integer id;
        private Integer courseId;
        private String courseName;
        private String courseCategory;
        private String trainerName;
        private String certificateCode;
        private String issueDate;
        private String grade;
        private Integer score;
        private Boolean isValid;
    }
}