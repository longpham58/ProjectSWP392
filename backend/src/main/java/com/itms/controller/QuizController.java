package com.itms.controller;

import com.itms.dto.ModuleProgressDto;
import com.itms.dto.QuizAttemptDto;
import com.itms.dto.QuizDto;
import com.itms.dto.common.ResponseDto;
import com.itms.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    /**
     * Get all quizzes for a course
     */
    @GetMapping("/course/{courseId}/user/{userId}")
    public ResponseEntity<ResponseDto<List<QuizDto>>> getQuizzesByCourse(
            @PathVariable Integer courseId,
            @PathVariable Integer userId) {
        List<QuizDto> quizzes = quizService.getQuizzesByCourse(courseId, userId);
        return ResponseEntity.ok(ResponseDto.success(quizzes, "Quizzes retrieved successfully"));
    }

    /**
     * Get quiz by ID
     */
    @GetMapping("/{quizId}/user/{userId}")
    public ResponseEntity<ResponseDto<QuizDto>> getQuizById(
            @PathVariable Integer quizId,
            @PathVariable Integer userId) {
        QuizDto quiz = quizService.getQuizById(quizId, userId);
        return ResponseEntity.ok(ResponseDto.success(quiz, "Quiz retrieved successfully"));
    }

    /**
     * Start a new quiz attempt
     */
    @PostMapping("/start")
    public ResponseEntity<ResponseDto<QuizAttemptDto>> startQuizAttempt(
            @RequestBody Map<String, Object> request) {
        Integer quizId = (Integer) request.get("quizId");
        Integer userId = (Integer) request.get("userId");
        Integer enrollmentId = (Integer) request.get("enrollmentId");

        QuizAttemptDto attempt = quizService.startQuizAttempt(quizId, userId, enrollmentId);
        return ResponseEntity.ok(ResponseDto.success(attempt, "Quiz attempt started"));
    }

    /**
     * Submit quiz attempt
     */
    @PostMapping("/submit")
    public ResponseEntity<ResponseDto<QuizAttemptDto>> submitQuizAttempt(
            @RequestBody Map<String, Object> request) {
        Integer attemptId = (Integer) request.get("attemptId");
        @SuppressWarnings("unchecked")
        List<QuizAttemptDto.QuizAnswerDto> answers = (List<QuizAttemptDto.QuizAnswerDto>) request.get("answers");
        Integer timeTakenMinutes = (Integer) request.get("timeTakenMinutes");

        QuizAttemptDto result = quizService.submitQuizAttempt(attemptId, answers, timeTakenMinutes);
        return ResponseEntity.ok(ResponseDto.success(result, "Quiz submitted successfully"));
    }

    /**
     * Get user quiz attempts for a specific quiz
     */
    @GetMapping("/attempts/user/{userId}/quiz/{quizId}")
    public ResponseEntity<ResponseDto<List<QuizAttemptDto>>> getUserQuizAttempts(
            @PathVariable Integer userId,
            @PathVariable Integer quizId) {
        List<QuizAttemptDto> attempts = quizService.getUserQuizAttempts(userId, quizId);
        return ResponseEntity.ok(ResponseDto.success(attempts, "Attempts retrieved successfully"));
    }

    /**
     * Get all quiz attempts for a user in a course
     */
    @GetMapping("/attempts/user/{userId}/course/{courseId}")
    public ResponseEntity<ResponseDto<List<QuizAttemptDto>>> getUserQuizAttemptsInCourse(
            @PathVariable Integer userId,
            @PathVariable Integer courseId) {
        List<QuizAttemptDto> attempts = quizService.getUserQuizAttemptsInCourse(userId, courseId);
        return ResponseEntity.ok(ResponseDto.success(attempts, "Attempts retrieved successfully"));
    }

    /**
     * Get course quiz status with unlock info, certificate status, and final exam unlock
     * This implements the logic:
     * - Tests unlock when required modules are completed (ANY module unlocks the test)
     * - Certificate earned after passing required number of tests
     * - Final exam unlocks after earning certificate
     */
    @GetMapping("/course/{courseId}/user/{userId}/status")
    public ResponseEntity<ResponseDto<Map<String, Object>>> getCourseQuizStatus(
            @PathVariable Integer courseId,
            @PathVariable Integer userId) {
        Map<String, Object> status = quizService.getCourseQuizStatus(courseId, userId);
        return ResponseEntity.ok(ResponseDto.success(status, "Course quiz status retrieved successfully"));
    }
}
