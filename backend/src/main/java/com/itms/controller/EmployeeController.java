package com.itms.controller;

import com.itms.dto.UserInfo;
import com.itms.dto.QuizAttemptDto;
import com.itms.dto.employee.EmployeeDtos;
import com.itms.dto.employee.EmployeeDtos.*;
import com.itms.entity.User;
import com.itms.service.EmployeeService;
import com.itms.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
    public MarkLessonResponse markLesson(@PathVariable Integer courseId, @RequestBody MarkLessonRequest request) {
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
    public ResponseEntity<?> getQuizzes(@PathVariable Integer courseId, @RequestParam Integer userId) {
        try {
            List<EmployeeDtos.QuizDto> quizzes = quizService.getQuizzesByCourse(courseId, userId).stream()
                    .map(q -> mapToEmployeeQuizDto(q))
                    .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(com.itms.dto.common.ResponseDto.success(quizzes, "Quizzes retrieved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(com.itms.dto.common.ResponseDto.fail("Không thể tải danh sách quiz: " + e.getMessage()));
        }
    }

    @GetMapping("/courses/{courseId}/quizzes/{quizId}")
    public ResponseEntity<?> getQuiz(@PathVariable Integer courseId, @PathVariable Integer quizId, @RequestParam Integer userId) {
        try {
            com.itms.dto.QuizDto q = quizService.getQuizById(quizId, userId);
            return ResponseEntity.ok(com.itms.dto.common.ResponseDto.success(mapToEmployeeQuizDto(q), "Quiz retrieved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(com.itms.dto.common.ResponseDto.fail("Không thể tải quiz: " + e.getMessage()));
        }
    }

    @PostMapping("/courses/{courseId}/quizzes/{quizId}/submit")
    public ResponseEntity<?> submitQuiz(
            @PathVariable Integer courseId,
            @PathVariable Integer quizId,
            @RequestBody QuizSubmitRequest request) {
        try {
            // 1. Start attempt
            QuizAttemptDto attempt = quizService.startQuizAttempt(quizId, request.getUserId(), null);

            // 2. Get quiz questions
            com.itms.dto.QuizDto quiz = quizService.getQuizWithQuestions(quizId);

            // 3. Build answer list
            List<QuizAttemptDto.QuizAnswerDto> answerList = buildAnswerList(attempt, request, quiz);

            // 4. Submit attempt
            QuizAttemptDto result = quizService.submitQuizAttempt(attempt.getId(), answerList, null);

            // 5. Map to employee QuizResultDto
            int score = result.getScore() != null ? result.getScore().intValue() : 0;
            int passingScore = quiz.getPassingScore() != null ? quiz.getPassingScore().intValue() : 70;
            boolean passed = Boolean.TRUE.equals(result.getPassed());

            // Build answer review list
            List<EmployeeDtos.QuizAnswerReviewDto> reviewList = new java.util.ArrayList<>();
            if (result.getAnswers() != null && quiz.getQuestions() != null) {
                java.util.Map<Integer, com.itms.dto.QuizQuestionDto> qMap = new java.util.HashMap<>();
                for (com.itms.dto.QuizQuestionDto q : quiz.getQuestions()) qMap.put(q.getId(), q);

                for (QuizAttemptDto.QuizAnswerDto ans : result.getAnswers()) {
                    com.itms.dto.QuizQuestionDto q = qMap.get(ans.getQuestionId());
                    if (q == null) continue;
                    List<EmployeeDtos.QuizOptionDto> opts = buildOptions(q);
                    int correctIdx = convertAnswerLetterToIndex(q.getCorrectAnswer());
                    int selectedIdx = ans.getSelectedAnswerIndex() != null ? ans.getSelectedAnswerIndex() : -1;
                    reviewList.add(EmployeeDtos.QuizAnswerReviewDto.builder()
                            .questionId(q.getId())
                            .question(q.getQuestionText())
                            .selectedOptionId(selectedIdx)
                            .correctOptionId(correctIdx)
                            .isCorrect(Boolean.TRUE.equals(ans.getIsCorrect()))
                            .options(opts)
                            .build());
                }
            }

            EmployeeDtos.QuizResultDto resultDto = EmployeeDtos.QuizResultDto.builder()
                    .attemptId(result.getId())
                    .quizId(quizId)
                    .quizTitle(quiz.getTitle())
                    .score(score)
                    .passed(passed)
                    .passingScore(passingScore)
                    .submittedAt(result.getSubmittedAt() != null ? result.getSubmittedAt().toString() : null)
                    .answers(reviewList)
                    .courseCompleted(false)
                    .build();

            return ResponseEntity.ok(com.itms.dto.common.ResponseDto.success(resultDto, "Quiz submitted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(com.itms.dto.common.ResponseDto.fail("Lỗi khi nộp bài: " + e.getMessage()));
        }
    }

    private List<QuizAttemptDto.QuizAnswerDto> buildAnswerList(
            QuizAttemptDto attempt,
            QuizSubmitRequest request,
            com.itms.dto.QuizDto quiz) {
        List<QuizAttemptDto.QuizAnswerDto> list = new java.util.ArrayList<>();
        if (quiz.getQuestions() == null || request.getAnswers() == null) return list;
        for (com.itms.dto.QuizQuestionDto q : quiz.getQuestions()) {
            Integer selectedOptionId = request.getAnswers().get(q.getId());
            // selectedOptionId is the 0-based index sent by frontend
            QuizAttemptDto.QuizAnswerDto ans = attempt.new QuizAnswerDto();
            ans.setQuestionId(q.getId());
            ans.setSelectedAnswerIndex(selectedOptionId);
            list.add(ans);
        }
        return list;
    }

    @GetMapping("/quiz-attempts/{attemptId}")
    public QuizAttemptDto getAttemptResult(@PathVariable Integer attemptId, @RequestParam Integer userId) {
        return quizService.getUserQuizAttempts(userId, attemptId).stream().findFirst().orElse(null);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private EmployeeDtos.QuizDto mapToEmployeeQuizDto(com.itms.dto.QuizDto q) {
        List<EmployeeDtos.QuizQuestionDto> questions = null;
        if (q.getQuestions() != null) {
            questions = q.getQuestions().stream().map(qq -> {
                List<EmployeeDtos.QuizOptionDto> opts = buildOptions(qq);
                return EmployeeDtos.QuizQuestionDto.builder()
                        .id(qq.getId())
                        .question(qq.getQuestionText())
                        .displayOrder(qq.getDisplayOrder())
                        .options(opts)
                        .build();
            }).collect(java.util.stream.Collectors.toList());
        }

        int passingScore = q.getPassingScore() != null ? q.getPassingScore().intValue() : 70;
        int timeLimitMinutes = q.getDurationMinutes() != null ? q.getDurationMinutes() : 30;
        int maxAttempts = q.getMaxAttempts() != null ? q.getMaxAttempts() : 3;
        int totalQuestions = q.getTotalQuestions() != null ? q.getTotalQuestions() : 0;
        boolean isFinalExam = Boolean.TRUE.equals(q.getIsFinalExam());
        // isUnlocked is set by QuizService: regular quizzes always true, final exam only when all regular passed
        boolean locked = !Boolean.TRUE.equals(q.getIsUnlocked());
        boolean passed = Boolean.TRUE.equals(q.getHasPassed());
        int attemptCount = q.getAttemptsCount() != null ? q.getAttemptsCount() : 0;
        boolean exhausted = q.getMaxAttempts() != null && attemptCount >= q.getMaxAttempts() && !passed;

        return EmployeeDtos.QuizDto.builder()
                .id(q.getId())
                .title(q.getTitle())
                .description(q.getDescription())
                .passingScore(passingScore)
                .timeLimitMinutes(timeLimitMinutes)
                .maxAttempts(maxAttempts)
                .totalQuestions(totalQuestions)
                .isFinalExam(isFinalExam)
                .questions(questions)
                .locked(locked)
                .passed(passed)
                .bestScore(null)
                .attemptCount(attemptCount)
                .exhausted(exhausted)
                .passedRegularCount(q.getPassedRegularCount())
                .totalRegularCount(q.getTotalRegularCount())
                .build();
    }

    private List<EmployeeDtos.QuizOptionDto> buildOptions(com.itms.dto.QuizQuestionDto q) {
        List<EmployeeDtos.QuizOptionDto> opts = new java.util.ArrayList<>();
        String[] texts = { q.getOptionA(), q.getOptionB(), q.getOptionC(), q.getOptionD() };
        for (int i = 0; i < texts.length; i++) {
            if (texts[i] != null) {
                opts.add(EmployeeDtos.QuizOptionDto.builder()
                        .id(i)
                        .optionText(texts[i])
                        .displayOrder(i + 1)
                        .build());
            }
        }
        return opts;
    }

    private int convertAnswerLetterToIndex(String answer) {
        if (answer == null) return 0;
        String upper = answer.toUpperCase().trim();
        if (upper.equals("A")) return 0;
        if (upper.equals("B")) return 1;
        if (upper.equals("C")) return 2;
        if (upper.equals("D")) return 3;
        try { return Integer.parseInt(upper); } catch (NumberFormatException e) { return 0; }
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