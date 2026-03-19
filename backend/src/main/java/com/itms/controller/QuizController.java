package com.itms.controller;

import com.itms.dto.ModuleProgressDto;
import com.itms.dto.QuizAttemptDto;
import com.itms.dto.QuizDto;
import com.itms.dto.QuizImportDto;
import com.itms.dto.QuizQuestionImportDto;
import com.itms.dto.common.ResponseDto;
import com.itms.service.ExcelImportService;
import com.itms.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;
    private final ExcelImportService excelImportService;

    /**
     * Get all quizzes for a course
     */
    @GetMapping("/course/{courseId}/user/{userId}")
    public ResponseEntity<ResponseDto<List<QuizDto>>> getQuizzesByCourse(
            @PathVariable("courseId") Integer courseId,
            @PathVariable("userId") Integer userId) {
        List<QuizDto> quizzes = quizService.getQuizzesByCourse(courseId, userId);
        return ResponseEntity.ok(ResponseDto.success(quizzes, "Quizzes retrieved successfully"));
    }

    /**
     * Get quiz by ID
     */
    @GetMapping("/{quizId}/user/{userId}")
    public ResponseEntity<ResponseDto<QuizDto>> getQuizById(
            @PathVariable("quizId") Integer quizId,
            @PathVariable("userId") Integer userId) {
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
            @PathVariable("userId") Integer userId,
            @PathVariable("quizId") Integer quizId) {
        List<QuizAttemptDto> attempts = quizService.getUserQuizAttempts(userId, quizId);
        return ResponseEntity.ok(ResponseDto.success(attempts, "Attempts retrieved successfully"));
    }

    /**
     * Get all quiz attempts for a user in a course
     */
    @GetMapping("/attempts/user/{userId}/course/{courseId}")
    public ResponseEntity<ResponseDto<List<QuizAttemptDto>>> getUserQuizAttemptsInCourse(
            @PathVariable("userId") Integer userId,
            @PathVariable("courseId") Integer courseId) {
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
            @PathVariable("courseId") Integer courseId,
            @PathVariable("userId") Integer userId) {
        Map<String, Object> status = quizService.getCourseQuizStatus(courseId, userId);
        return ResponseEntity.ok(ResponseDto.success(status, "Course quiz status retrieved successfully"));
    }

    /**
     * Parse Excel file without creating quiz (for preview)
     */
    @PostMapping("/parse-excel")
    public ResponseEntity<ResponseDto<Map<String, Object>>> parseExcelFile(
            @RequestParam("file") MultipartFile file) {
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                .body(ResponseDto.fail("File is empty"));
        }
        
        if (!file.getOriginalFilename().endsWith(".xlsx") && !file.getOriginalFilename().endsWith(".xls")) {
            return ResponseEntity.badRequest()
                .body(ResponseDto.fail("Only Excel files (.xlsx, .xls) are allowed"));
        }
        
        try {
            QuizImportDto parsedData = excelImportService.parseExcelFile(file);
            
            // Convert to the format expected by frontend
            Map<String, Object> result = new HashMap<>();
            result.put("title", parsedData.getQuizTitle());
            result.put("description", parsedData.getDescription());
            result.put("durationMinutes", parsedData.getDurationMinutes());
            result.put("passingScore", parsedData.getPassingScore());
            result.put("quizType", parsedData.getQuizType());
            result.put("maxAttempts", parsedData.getMaxAttempts());
            result.put("randomizeQuestions", parsedData.getRandomizeQuestions());
            result.put("showCorrectAnswers", parsedData.getShowCorrectAnswers());
            
            // Convert questions
            List<Map<String, Object>> questions = new ArrayList<>();
            for (QuizQuestionImportDto q : parsedData.getQuestions()) {
                Map<String, Object> question = new HashMap<>();
                question.put("questionText", q.getQuestionText());
                question.put("questionType", q.getQuestionType());
                question.put("optionA", q.getOptionA());
                question.put("optionB", q.getOptionB());
                question.put("optionC", q.getOptionC());
                question.put("optionD", q.getOptionD());
                question.put("correctAnswer", q.getCorrectAnswer());
                question.put("marks", q.getMarks());
                question.put("explanation", q.getExplanation());
                question.put("displayOrder", q.getDisplayOrder());
                questions.add(question);
            }
            result.put("questions", questions);
            
            return ResponseEntity.ok(ResponseDto.success(result, "Excel file parsed successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ResponseDto.fail("Failed to parse Excel file: " + e.getMessage()));
        }
    }

    /**
     * Import quiz from Excel file
     */
    @PostMapping("/import")
    public ResponseEntity<ResponseDto<QuizDto>> importQuizFromExcel(
            @RequestParam("file") MultipartFile file,
            @RequestParam("courseId") Integer courseId,
            @RequestParam(value = "moduleId", required = false) Integer moduleId,
            Authentication authentication) {
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                .body(ResponseDto.fail("File is empty"));
        }
        
        if (!file.getOriginalFilename().endsWith(".xlsx") && !file.getOriginalFilename().endsWith(".xls")) {
            return ResponseEntity.badRequest()
                .body(ResponseDto.fail("Only Excel files (.xlsx, .xls) are allowed"));
        }
        
        try {
            // Get user ID from authentication
            Integer userId = Integer.parseInt(authentication.getName());
            
            QuizDto quiz = quizService.importQuizFromExcel(file, courseId, moduleId, userId);
            return ResponseEntity.ok(ResponseDto.success(quiz, "Quiz imported successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ResponseDto.fail("Failed to import quiz: " + e.getMessage()));
        }
    }

    /**
     * Get quizzes by module ID
     */
    @GetMapping("/module/{moduleId}")
    public ResponseEntity<ResponseDto<List<QuizDto>>> getQuizzesByModule(
            @PathVariable("moduleId") Integer moduleId) {
        List<QuizDto> quizzes = quizService.getQuizzesByModule(moduleId);
        return ResponseEntity.ok(ResponseDto.success(quizzes, "Quizzes retrieved successfully"));
    }

    /**
     * Get quiz details with questions
     */
    @GetMapping("/{quizId}/details")
    public ResponseEntity<ResponseDto<QuizDto>> getQuizDetails(
            @PathVariable("quizId") Integer quizId) {
        QuizDto quiz = quizService.getQuizWithQuestions(quizId);
        return ResponseEntity.ok(ResponseDto.success(quiz, "Quiz details retrieved successfully"));
    }

    /**
     * Create new quiz manually
     */
    @PostMapping("/create")
    public ResponseEntity<ResponseDto<QuizDto>> createQuiz(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            Integer userId = Integer.parseInt(authentication.getName());
            QuizDto quiz = quizService.createQuizManually(request, userId);
            return ResponseEntity.ok(ResponseDto.success(quiz, "Quiz created successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ResponseDto.fail("Failed to create quiz: " + e.getMessage()));
        }
    }

    /**
     * Toggle quiz active status
     */
    @PatchMapping("/{quizId}/toggle-status")
    public ResponseEntity<ResponseDto<QuizDto>> toggleQuizStatus(
            @PathVariable("quizId") Integer quizId) {
        try {
            QuizDto quiz = quizService.toggleQuizStatus(quizId);
            return ResponseEntity.ok(ResponseDto.success(quiz, "Quiz status updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ResponseDto.fail("Failed to update quiz status: " + e.getMessage()));
        }
    }

    /**
     * Delete quiz
     */
    @DeleteMapping("/{quizId}")
    public ResponseEntity<ResponseDto<Void>> deleteQuiz(@PathVariable("quizId") Integer quizId) {
        try {
            quizService.deleteQuiz(quizId);
            return ResponseEntity.ok(ResponseDto.success(null, "Quiz deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ResponseDto.fail("Failed to delete quiz: " + e.getMessage()));
        }
    }

    /**
     * Download Excel template for quiz import
     */
    @GetMapping("/template")
    public ResponseEntity<byte[]> downloadExcelTemplate() {
        try {
            byte[] template = excelImportService.generateExcelTemplate();
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "quiz_template.xlsx");
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(template);
                
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
