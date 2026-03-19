package com.itms.controller;

import com.itms.dto.UserInfo;
import com.itms.dto.QuizAttemptDto;
import com.itms.dto.QuizDto;
import com.itms.dto.employee.EmployeeDtos.*;
import com.itms.entity.User;
import com.itms.service.EmployeeService;
import com.itms.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employee")
@RequiredArgsConstructor
public class EmployeeController {
    private final EmployeeService employeeService;
    private final QuizService quizService;

    @GetMapping("/dashboard/{userId}")
    public DashboardResponse dashboard(@PathVariable Integer userId) {
        return employeeService.getDashboard(userId);
    }

    @GetMapping("/courses")
    public List<CourseSummary> courses(
            @RequestParam Integer userId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category
    ) {
        return employeeService.browseCourses(keyword, category, userId);
    }

    @GetMapping("/courses/{courseId}")
    public CourseDetailResponse courseDetail(@PathVariable Integer courseId, @RequestParam Integer userId) {
        return employeeService.getCourseDetail(courseId, userId);
    }

    @PostMapping("/courses/{courseId}/enroll")
    public EnrollmentResponse enroll(@PathVariable Integer courseId, @RequestBody EnrollmentRequest request) {
        return employeeService.enroll(courseId, request);
    }

    @PutMapping("/courses/{courseId}/cancel")
    public EnrollmentResponse cancel(@PathVariable Integer courseId, @RequestParam Integer userId) {
        return employeeService.cancelEnrollment(courseId, userId);
    }

    @GetMapping("/my-learning/{userId}")
    public List<CourseSummary> myLearning(@PathVariable Integer userId) {
        return employeeService.myLearning(userId);
    }

    @PutMapping("/courses/{courseId}/lessons/complete")
    public EnrollmentResponse markLesson(@PathVariable Integer courseId, @RequestBody MarkLessonRequest request) {
        return employeeService.markLessonCompleted(courseId, request);
    }

    @GetMapping("/courses/{courseId}/feedbacks")
    public List<FeedbackDto> feedbacks(@PathVariable Integer courseId) {
        return employeeService.getFeedbacks(courseId);
    }

    @PostMapping("/courses/{courseId}/feedbacks")
    public FeedbackDto upsertFeedback(@PathVariable Integer courseId, @RequestBody FeedbackRequest request) {
        return employeeService.upsertFeedback(courseId, request);
    }

    @DeleteMapping("/courses/{courseId}/feedbacks/{feedbackId}")
    public void deleteFeedback(@PathVariable Integer courseId, @PathVariable Integer feedbackId, @RequestParam Integer userId) {
        employeeService.deleteFeedback(courseId, feedbackId, userId);
    }

    @GetMapping("/courses/{courseId}/comments")
    public CommentPageResponse comments(
            @PathVariable Integer courseId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return employeeService.getComments(courseId, page, size);
    }

    @PostMapping("/courses/{courseId}/comments")
    public CommentDto addComment(@PathVariable Integer courseId, @RequestBody CommentRequest request) {
        return employeeService.addComment(courseId, request);
    }

    @DeleteMapping("/comments/{commentId}")
    public void deleteComment(@PathVariable Integer commentId, @RequestParam Integer userId) {
        employeeService.deleteComment(commentId, userId);
    }

    @PostMapping("/comments/{commentId}/like")
    public CommentDto likeComment(@PathVariable Integer commentId, @RequestParam Integer userId) {
        return employeeService.likeComment(commentId, userId);
    }

    @GetMapping("/notifications/{userId}")
    public List<NotificationDto> notifications(@PathVariable Integer userId) {
        return employeeService.notifications(userId);
    }

    @PutMapping("/notifications/{notificationId}/read")
    public NotificationDto markRead(@PathVariable Integer notificationId, @RequestParam Integer userId) {
        return employeeService.markNotificationRead(notificationId, userId);
    }

    @DeleteMapping("/notifications/{notificationId}")
    public void deleteNotification(@PathVariable Integer notificationId, @RequestParam Integer userId) {
        employeeService.deleteNotification(notificationId, userId);
    }

    @GetMapping("/schedule/{userId}")
    public List<ScheduleDto> schedule(@PathVariable Integer userId) {
        return employeeService.getSchedule(userId);
    }

    // ─── Quiz endpoints ───────────────────────────────────────────────────────

    @GetMapping("/courses/{courseId}/quizzes")
    public List<QuizDto> getQuizzes(@PathVariable Integer courseId, @RequestParam Integer userId) {
        return quizService.getQuizzesByCourse(courseId, userId);
    }

    @GetMapping("/courses/{courseId}/quizzes/{quizId}")
    public QuizDto getQuiz(@PathVariable Integer courseId, @PathVariable Integer quizId, @RequestParam Integer userId) {
        return quizService.getQuizWithQuestions(quizId);
    }

    @PostMapping("/courses/{courseId}/quizzes/{quizId}/submit")
    public QuizAttemptDto submitQuiz(@PathVariable Integer courseId, @PathVariable Integer quizId, @RequestBody QuizSubmitRequest request) {
        return quizService.submitQuizAttempt(quizId, null, null);
    }

    @GetMapping("/quiz-attempts/{attemptId}")
    public QuizAttemptDto getAttemptResult(@PathVariable Integer attemptId, @RequestParam Integer userId) {
        return quizService.getUserQuizAttempts(userId, attemptId).stream().findFirst().orElse(null);
    }

    // ─── Certificate endpoints ────────────────────────────────────────────────

    @GetMapping("/certificates/{userId}")
    public List<CertificateDto> getCertificates(@PathVariable Integer userId) {
        return employeeService.getCertificates(userId);
    }

    @GetMapping("/profile/{userId}")
    public UserInfo profile(@PathVariable Integer userId) {
        User user = employeeService.getProfile(userId);
        return mapUserInfo(user);
    }

    @PutMapping("/profile/{userId}")
    public UserInfo updateProfile(@PathVariable Integer userId, @RequestBody ProfileUpdateRequest request) {
        User user = employeeService.updateProfile(userId, request);
        return mapUserInfo(user);
    }

    @PutMapping("/profile/{userId}/change-password")
    public void changePassword(@PathVariable Integer userId, @RequestBody ChangePasswordRequest request) {
        employeeService.changePassword(userId, request);
    }

    private UserInfo mapUserInfo(User user) {
        return UserInfo.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())

                .roles(List.of("EMPLOYEE"))
                .build();
    }
}