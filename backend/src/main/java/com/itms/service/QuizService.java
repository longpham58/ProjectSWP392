package com.itms.service;

import com.itms.dto.QuizAttemptDto;
import com.itms.dto.QuizDto;
import com.itms.dto.QuizImportDto;
import com.itms.dto.QuizQuestionDto;
import com.itms.dto.QuizQuestionImportDto;
import com.itms.dto.SessionAttendanceDto;
import com.itms.entity.*;
import com.itms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final UserModuleProgressRepository moduleProgressRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseModuleRepository courseModuleRepository;
    private final ExcelImportService excelImportService;
    private final QuizQuestionRepository quizQuestionRepository;
    private final SessionRepository sessionRepository;

    /**
     * Get all quizzes for a course.
     * Regular quizzes are always unlocked (employees are assigned by HR).
     * Final exam is locked until ALL regular quizzes for the course are passed.
     */
    public List<QuizDto> getQuizzesByCourse(Integer courseId, Integer userId) {
        List<Quiz> quizzes = quizRepository.findByCourseIdAndQuizTypeIn(courseId);
        List<QuizDto> quizDtos = new ArrayList<>();

        // Separate regular quizzes and final exams
        List<Quiz> regularQuizzes = quizzes.stream()
                .filter(q -> !Boolean.TRUE.equals(q.getIsFinalExam()))
                .toList();
        int totalRegular = regularQuizzes.size();

        // Count how many regular quizzes the user has passed
        int passedRegular = 0;
        for (Quiz rq : regularQuizzes) {
            List<QuizAttempt> attempts = quizAttemptRepository.findByQuizIdAndUserId(rq.getId(), userId);
            if (attempts.stream().anyMatch(a -> Boolean.TRUE.equals(a.getPassed()))) {
                passedRegular++;
            }
        }
        boolean allRegularPassed = totalRegular > 0 && passedRegular >= totalRegular;

        for (Quiz quiz : quizzes) {
            QuizDto dto = mapToDto(quiz);

            boolean isFinal = Boolean.TRUE.equals(quiz.getIsFinalExam());
            if (isFinal) {
                // Final exam unlocks only when ALL regular quizzes are passed
                dto.setIsUnlocked(allRegularPassed);
            } else {
                // Regular quizzes are always unlocked for employees
                dto.setIsUnlocked(true);
            }

            // Get attempt count and pass status
            List<QuizAttempt> attempts = quizAttemptRepository.findByQuizIdAndUserId(quiz.getId(), userId);
            dto.setAttemptsCount(attempts.size());
            dto.setHasPassed(attempts.stream().anyMatch(a -> Boolean.TRUE.equals(a.getPassed())));

            // Attach regular quiz progress info (used by frontend for final exam lock message)
            dto.setPassedRegularCount(passedRegular);
            dto.setTotalRegularCount(totalRegular);

            quizDtos.add(dto);
        }

        return quizDtos;
    }

    /**
     * Get quiz by ID with questions
     */
    public QuizDto getQuizById(Integer quizId, Integer userId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        // Eagerly load questions
        List<QuizQuestion> questions = quizQuestionRepository.findByQuizIdOrderByDisplayOrderAsc(quizId);
        quiz.setQuestions(questions);

        QuizDto dto = mapToDto(quiz);

        // Get course ID for session completion check
        Integer courseId = quiz.getCourse() != null ? quiz.getCourse().getId() : null;
        
        // Check unlock status - check module or session completion
        if (quiz.getModule() != null) {
            // Module-level quiz: unlock based on module completion
            dto.setIsUnlocked(isModuleCompleted(userId, quiz.getModule().getId()));
        } else if (courseId != null) {
            // Course-level quiz (tests): unlock based on session completion
            List<SessionAttendanceDto> sessionAttendances = sessionRepository.getSessionAttendanceForUser(userId, courseId);
            boolean allSessionsCompleted = sessionAttendances.size() > 0 && 
                sessionAttendances.stream().filter(s -> s.getMarkedComplete() != null && s.getMarkedComplete()).count() >= sessionAttendances.size();
            dto.setIsUnlocked(allSessionsCompleted);
        } else {
            dto.setIsUnlocked(false);
        }

        // Get attempt count
        List<QuizAttempt> attempts = quizAttemptRepository.findByQuizIdAndUserId(quizId, userId);
        dto.setAttemptsCount(attempts.size());
        dto.setHasPassed(attempts.stream().anyMatch(QuizAttempt::getPassed));

        return dto;
    }

    /**
     * Start a new quiz attempt
     */
    @Transactional
    public QuizAttemptDto startQuizAttempt(Integer quizId, Integer userId, Integer enrollmentId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Count existing attempts
        List<QuizAttempt> existingAttempts = quizAttemptRepository.findByQuizIdAndUserId(quizId, userId);
        int attemptNumber = existingAttempts.size() + 1;

        // Check max attempts
        if (quiz.getMaxAttempts() != null && attemptNumber > quiz.getMaxAttempts()) {
            throw new RuntimeException("Maximum attempts reached");
        }

        // Get enrollment if valid enrollmentId provided
        Enrollment enrollment = null;
        if (enrollmentId != null && enrollmentId > 0) {
            enrollment = enrollmentRepository.findById(enrollmentId).orElse(null);
        }

        // Create new attempt
        QuizAttempt attempt = QuizAttempt.builder()
                .quiz(quiz)
                .user(user)
                .enrollment(enrollment)
                .attemptNumber(attemptNumber)
                .score(BigDecimal.ZERO)
                .totalMarks(BigDecimal.ZERO)
                .obtainedMarks(BigDecimal.ZERO)
                .passed(false)
                .startedAt(LocalDateTime.now())
                .status("IN_PROGRESS")
                .createdAt(LocalDateTime.now())
                .build();

        attempt = quizAttemptRepository.save(attempt);

        return mapAttemptToDto(attempt);
    }

    /**
     * Submit quiz attempt
     */
    @Transactional
    public QuizAttemptDto submitQuizAttempt(Integer attemptId, List<QuizAttemptDto.QuizAnswerDto> answers, Integer timeTakenMinutes) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        Quiz quiz = attempt.getQuiz();
        List<QuizQuestion> questions = quizQuestionRepository.findByQuizIdOrderByDisplayOrderAsc(quiz.getId());
        Map<Integer, QuizQuestion> questionMap = new HashMap<>();
        for (QuizQuestion q : questions) {
            questionMap.put(q.getId(), q);
        }

        // Calculate score
        BigDecimal totalMarksObtained = BigDecimal.ZERO;

        for (QuizAttemptDto.QuizAnswerDto answerDto : answers) {
            QuizQuestion question = questionMap.get(answerDto.getQuestionId());
            if (question == null) continue;

            int correctIndex = convertAnswerToIndex(question.getCorrectAnswer());
            boolean isCorrect = answerDto.getSelectedAnswerIndex() != null && answerDto.getSelectedAnswerIndex() == correctIndex;

            answerDto.setIsCorrect(isCorrect);
            if (isCorrect) {
                BigDecimal marks = question.getMarks() != null ? question.getMarks() : BigDecimal.ONE;
                totalMarksObtained = totalMarksObtained.add(marks);
                answerDto.setMarksObtained(marks);
            } else {
                answerDto.setMarksObtained(BigDecimal.ZERO);
            }
        }

        // Calculate percentage (score)
        BigDecimal score = BigDecimal.ZERO;
        if (quiz.getTotalMarks() != null && quiz.getTotalMarks().compareTo(BigDecimal.ZERO) > 0) {
            score = totalMarksObtained.divide(quiz.getTotalMarks(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        boolean passed = score.compareTo(quiz.getPassingScore() != null ? quiz.getPassingScore() : BigDecimal.valueOf(70)) >= 0;

        // Update attempt
        attempt.setScore(score);
        attempt.setTotalMarks(quiz.getTotalMarks());
        attempt.setObtainedMarks(totalMarksObtained);
        attempt.setPassed(passed);
        attempt.setSubmittedAt(LocalDateTime.now());
        attempt.setTimeTakenMinutes(timeTakenMinutes);
        attempt.setStatus("SUBMITTED"); // DB constraint: IN_PROGRESS, SUBMITTED, GRADED, ABANDONED

        attempt = quizAttemptRepository.save(attempt);

        QuizAttemptDto result = mapAttemptToDto(attempt);
        result.setAnswers(answers);
        return result;
    }

    /**
     * Get quiz attempts for a user
     */
    public List<QuizAttemptDto> getUserQuizAttempts(Integer userId, Integer quizId) {
        List<QuizAttempt> attempts = quizAttemptRepository.findByQuizIdAndUserId(quizId, userId);
        return attempts.stream()
                .map(this::mapAttemptToDto)
                .toList();
    }

    /**
     * Get all quiz attempts for a user in a course
     */
    public List<QuizAttemptDto> getUserQuizAttemptsInCourse(Integer userId, Integer courseId) {
        List<Quiz> quizzes = quizRepository.findByCourseId(courseId);
        List<QuizAttemptDto> allAttempts = new ArrayList<>();

        for (Quiz quiz : quizzes) {
            List<QuizAttempt> attempts = quizAttemptRepository.findByQuizIdAndUserId(quiz.getId(), userId);
            allAttempts.addAll(attempts.stream()
                    .map(this::mapAttemptToDto)
                    .toList());
        }

        return allAttempts;
    }

    @Transactional
    public QuizDto importQuizFromExcel(MultipartFile file, Integer courseId, Integer moduleId, Integer createdBy) {
        try {
            QuizImportDto importDto = excelImportService.importQuizFromExcel(file);
            
            // Validate import data
            if (importDto.getQuizTitle() == null || importDto.getQuizTitle().trim().isEmpty()) {
                throw new IllegalArgumentException("Quiz title is missing in the Excel file");
            }
            
            if (importDto.getQuestions() == null || importDto.getQuestions().isEmpty()) {
                throw new IllegalArgumentException("No valid questions found in the Excel file. Please ensure questions start from row 7 (column A must not be empty).");
            }

            // Get course and module
            Course course = new Course();
            course.setId(courseId);
            
            CourseModule module = null;
            if (moduleId != null) {
                module = courseModuleRepository.findById(moduleId)
                    .orElseThrow(() -> new RuntimeException("Module not found"));
            }
            
            User creator = userRepository.findById(createdBy)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Create Quiz entity
            Quiz quiz = Quiz.builder()
                .course(course)
                .module(module)
                .title(importDto.getQuizTitle())
                .description(importDto.getDescription())
                .quizType(importDto.getQuizType())
                .totalQuestions(importDto.getQuestions().size())
                .totalMarks(BigDecimal.valueOf(importDto.getQuestions().stream()
                    .mapToInt(q -> q.getMarks() != null ? q.getMarks() : 1)
                    .sum()))
                .passingScore(BigDecimal.valueOf(importDto.getPassingScore() != null ? importDto.getPassingScore() : 70.0))
                .durationMinutes(importDto.getDurationMinutes() != null ? importDto.getDurationMinutes() : 60)
                .maxAttempts(importDto.getMaxAttempts() != null ? importDto.getMaxAttempts() : 3)
                .randomizeQuestions(importDto.getRandomizeQuestions() != null ? importDto.getRandomizeQuestions() : false)
                .showCorrectAnswers(importDto.getShowCorrectAnswers() != null ? importDto.getShowCorrectAnswers() : true)
                .isActive(true)
                .isFinalExam(false)
                .createdBy(creator)
                .createdAt(LocalDateTime.now())
                .build();
            
            quiz = quizRepository.save(quiz);
            
            // Create QuizQuestion entities
            List<QuizQuestion> questions = new ArrayList<>();
            for (QuizQuestionImportDto questionDto : importDto.getQuestions()) {
                QuizQuestion question = QuizQuestion.builder()
                    .quiz(quiz)
                    .questionText(questionDto.getQuestionText())
                    .questionType(questionDto.getQuestionType() != null ? questionDto.getQuestionType() : "MULTIPLE_CHOICE")
                    .optionA(questionDto.getOptionA())
                    .optionB(questionDto.getOptionB())
                    .optionC(questionDto.getOptionC())
                    .optionD(questionDto.getOptionD())
                    .correctAnswer(questionDto.getCorrectAnswer())
                    .marks(questionDto.getMarks() != null ? BigDecimal.valueOf(questionDto.getMarks()) : BigDecimal.ONE)
                    .explanation(questionDto.getExplanation())
                    .displayOrder(questionDto.getDisplayOrder())
                    .createdAt(LocalDateTime.now())
                    .build();
                
                questions.add(question);
            }
            
            quizQuestionRepository.saveAll(questions);
            quiz.setQuestions(questions);
            
            return mapToDto(quiz);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to import quiz from Excel: " + e.getMessage(), e);
        }
    }

    /**
     * Get quizzes by module ID
     */
    public List<QuizDto> getQuizzesByModule(Integer moduleId) {
        List<Quiz> quizzes = quizRepository.findByModuleId(moduleId);
        return quizzes.stream()
                .map(this::mapToDto)
                .toList();
    }

    /**
     * Get quiz with questions
     */
    public QuizDto getQuizWithQuestions(Integer quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        // Eagerly load questions
        List<QuizQuestion> questions = quizQuestionRepository.findByQuizIdOrderByDisplayOrderAsc(quizId);
        quiz.setQuestions(questions);
        return mapToDto(quiz);
    }

    /**
     * Create quiz manually
     */
    @Transactional
    public QuizDto createQuizManually(Map<String, Object> request, Integer createdBy) {
        try {
            // Extract quiz data
            String title = (String) request.get("title");
            String description = (String) request.get("description");
            String quizType = (String) request.get("quizType");
            Integer durationMinutes = (Integer) request.get("durationMinutes");
            Integer maxAttempts = (Integer) request.get("maxAttempts");
            Integer passingScore = (Integer) request.get("passingScore");
            Boolean randomizeQuestions = (Boolean) request.get("randomizeQuestions");
            Boolean showCorrectAnswers = (Boolean) request.get("showCorrectAnswers");
            Integer courseId = (Integer) request.get("courseId");
            Integer moduleId = (Integer) request.get("moduleId");
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> questionsData = (List<Map<String, Object>>) request.get("questions");

            // Get course and module
            Course course = new Course();
            course.setId(courseId);
            
            CourseModule module = null;
            if (moduleId != null) {
                module = courseModuleRepository.findById(moduleId)
                    .orElseThrow(() -> new RuntimeException("Module not found"));
            }
            
            User creator = userRepository.findById(createdBy)
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Calculate total marks
            int totalMarks = questionsData.stream()
                .mapToInt(q -> (Integer) q.getOrDefault("marks", 1))
                .sum();

            // Create Quiz entity
            Quiz quiz = Quiz.builder()
                .course(course)
                .module(module)
                .title(title)
                .description(description)
                .quizType(quizType)
                .totalQuestions(questionsData.size())
                .totalMarks(BigDecimal.valueOf(totalMarks))
                .passingScore(BigDecimal.valueOf(passingScore))
                .durationMinutes(durationMinutes)
                .maxAttempts(maxAttempts)
                .randomizeQuestions(randomizeQuestions)
                .showCorrectAnswers(showCorrectAnswers)
                .isActive(true)
                .isFinalExam(false)
                .createdBy(creator)
                .createdAt(LocalDateTime.now())
                .build();

            quiz = quizRepository.save(quiz);

            // Create QuizQuestion entities
            List<QuizQuestion> questions = new ArrayList<>();
            for (int i = 0; i < questionsData.size(); i++) {
                Map<String, Object> questionData = questionsData.get(i);
                
                QuizQuestion question = QuizQuestion.builder()
                    .quiz(quiz)
                    .questionText((String) questionData.get("questionText"))
                    .questionType((String) questionData.getOrDefault("questionType", "MULTIPLE_CHOICE"))
                    .optionA((String) questionData.get("optionA"))
                    .optionB((String) questionData.get("optionB"))
                    .optionC((String) questionData.get("optionC"))
                    .optionD((String) questionData.get("optionD"))
                    .correctAnswer((String) questionData.get("correctAnswer"))
                    .marks(BigDecimal.valueOf((Integer) questionData.getOrDefault("marks", 1)))
                    .explanation((String) questionData.get("explanation"))
                    .displayOrder(i + 1)
                    .createdAt(LocalDateTime.now())
                    .build();
                
                questions.add(question);
            }

            quizQuestionRepository.saveAll(questions);
            quiz.setQuestions(questions);

            return mapToDto(quiz);

        } catch (Exception e) {
            throw new RuntimeException("Failed to create quiz: " + e.getMessage(), e);
        }
    }

    /**
     * Toggle quiz active status
     */
    @Transactional
    public QuizDto toggleQuizStatus(Integer quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        
        quiz.setIsActive(!quiz.getIsActive());
        quiz.setUpdatedAt(LocalDateTime.now());
        quiz = quizRepository.save(quiz);
        
        return mapToDto(quiz);
    }

    /**
     * Delete quiz
     */
    @Transactional
    public void deleteQuiz(Integer quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        
        // Delete questions first
        quizQuestionRepository.deleteByQuizId(quizId);
        
        // Delete quiz
        quizRepository.delete(quiz);
    }

    private boolean isModuleCompleted(Integer userId, Integer moduleId) {
        Optional<UserModuleProgress> progress = moduleProgressRepository
                .findByUserIdAndModuleId(userId, moduleId);
        return progress.isPresent() && progress.get().getIsCompleted();
    }

    /**
     * Check if ALL of the required modules are completed (AND logic)
     */
    private boolean areAllRequiredModulesCompleted(Integer userId, List<Integer> requiredModuleIds) {
        for (Integer moduleId : requiredModuleIds) {
            if (!isModuleCompleted(userId, moduleId)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check if ANY of the required modules is completed (OR logic)
     */
    private boolean isAnyRequiredModuleCompleted(Integer userId, List<Integer> requiredModuleIds) {
        for (Integer moduleId : requiredModuleIds) {
            if (isModuleCompleted(userId, moduleId)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get course quiz status with unlock info, certificate status, and final exam unlock
     * This implements the logic:
     * - Tests unlock when required modules are completed (ANY module unlocks the test)
     * - Certificate earned after passing required number of tests
     * - Final exam unlocks after earning certificate
     */
    public Map<String, Object> getCourseQuizStatus(Integer courseId, Integer userId) {
        Map<String, Object> status = new HashMap<>();
        
        // Get all quizzes for the course
        List<Quiz> quizzes = quizRepository.findByCourseIdAndQuizTypeIn(courseId);
        
        // Get user's module progress for this course
        List<UserModuleProgress> userProgress = moduleProgressRepository.findByUserIdAndCourseId(userId, courseId);
        int completedModulesCount = (int) userProgress.stream().filter(UserModuleProgress::getIsCompleted).count();
        int totalModules = courseModuleRepository.findByCourseId(courseId).size();
        
        // Check if all sessions are completed for course-level quiz unlocking
        List<SessionAttendanceDto> sessionAttendances = sessionRepository.getSessionAttendanceForUser(userId, courseId);
        int totalSessions = sessionAttendances.size();
        long completedSessions = sessionAttendances.stream().filter(s -> s.getMarkedComplete() != null && s.getMarkedComplete()).count();
        boolean allSessionsCompleted = totalSessions > 0 && completedSessions >= totalSessions;
        
        // Calculate which quizzes are unlocked based on required modules or session completion
        List<QuizDto> quizDtos = new ArrayList<>();
        int unlockedQuizCount = 0;
        
        for (Quiz quiz : quizzes) {
            QuizDto dto = mapToDto(quiz);
            
            // Check unlock based on module or session completion
            if (quiz.getModule() != null) {
                // Module-level quiz: unlock based on module completion
                dto.setIsUnlocked(isModuleCompleted(userId, quiz.getModule().getId()));
            } else {
                // Course-level quiz (tests): unlock based on session completion
                dto.setIsUnlocked(allSessionsCompleted);
            }
            
            // Get attempt count and pass status
            List<QuizAttempt> attempts = quizAttemptRepository.findByQuizIdAndUserId(quiz.getId(), userId);
            dto.setAttemptsCount(attempts.size());
            dto.setHasPassed(attempts.stream().anyMatch(QuizAttempt::getPassed));
            
            quizDtos.add(dto);
            
            if (dto.getIsUnlocked()) {
                unlockedQuizCount++;
            }
        }
        
        status.put("quizzes", quizDtos);
        status.put("completedModulesCount", completedModulesCount);
        status.put("totalModules", totalModules);
        status.put("completedSessions", completedSessions);
        status.put("totalSessions", totalSessions);
        status.put("allSessionsCompleted", allSessionsCompleted);
        status.put("unlockedQuizCount", unlockedQuizCount);
        
        // Calculate test passing requirements (assign once so effectively final for lambda)
        final BigDecimal testPassingScore;
        final Integer testMaxAttempts;
        if (!quizzes.isEmpty()) {
            testPassingScore = quizzes.stream()
                .map(Quiz::getPassingScore)
                .filter(ps -> ps != null)
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.valueOf(70));
            testMaxAttempts = quizzes.stream()
                .map(Quiz::getMaxAttempts)
                .filter(ma -> ma != null)
                .max(Integer::compareTo)
                .orElse(3);
        } else {
            testPassingScore = BigDecimal.valueOf(70);
            testMaxAttempts = 3;
        }

        status.put("testPassingScore", testPassingScore);
        status.put("testMaxAttempts", testMaxAttempts);
        
        // Calculate required pass count: if >= 3 tests, need 2; otherwise need ceil(tests/2)
        int totalTests = quizzes.size();
        int requiredPassCount = totalTests >= 3 ? 2 : Math.max(1, (int) Math.ceil(totalTests / 2.0));
        status.put("requiredPassCount", requiredPassCount);
        
        // Calculate passed tests
        int passedTests = 0;
        for (Quiz quiz : quizzes) {
            List<QuizAttempt> attempts = quizAttemptRepository.findByQuizIdAndUserId(quiz.getId(), userId);
            boolean hasPassed = attempts.stream().anyMatch(a -> 
                a.getPassed() != null && a.getPassed() || 
                (a.getScore() != null && a.getScore().compareTo(testPassingScore) >= 0)
            );
            if (hasPassed) {
                passedTests++;
            }
        }
        
        status.put("passedTests", passedTests);
        
        // Certificate earned when passedTests >= requiredPassCount
        boolean certificateEarned = passedTests >= requiredPassCount;
        status.put("certificateEarned", certificateEarned);
        
        // Final exam unlocks after earning certificate AND completing all sessions
        // Find final exam quiz
        Quiz finalExam = quizzes.stream()
            .filter(q -> q.getIsFinalExam() != null && q.getIsFinalExam())
            .findFirst()
            .orElse(null);
        
        boolean finalExamUnlocked = false;
        if (finalExam != null) {
            // Final exam unlocks when:
            // 1. All sessions are completed (session-based requirement)
            // 2. Certificate is earned (current requirement)
            // Check if final exam has module requirement
            if (finalExam.getModule() != null) {
                finalExamUnlocked = certificateEarned && allSessionsCompleted && isModuleCompleted(userId, finalExam.getModule().getId());
            } else {
                // Final exam without module requirement - needs both certificate AND session completion
                finalExamUnlocked = certificateEarned && allSessionsCompleted;
            }
            
            // Get final exam attempt info
            List<QuizAttempt> finalExamAttempts = quizAttemptRepository.findByQuizIdAndUserId(finalExam.getId(), userId);
            status.put("finalExamAttemptsCount", finalExamAttempts.size());
            status.put("finalExamHasPassed", finalExamAttempts.stream().anyMatch(QuizAttempt::getPassed));
        }
        
        status.put("finalExamUnlocked", finalExamUnlocked);
        status.put("finalExam", finalExam != null ? mapToDto(finalExam) : null);
        
        return status;
    }

    private int convertAnswerToIndex(String answer) {
        if (answer == null) return 0;
        String upper = answer.toUpperCase().trim();
        if (upper.equals("A") || upper.equals("0")) return 0;
        if (upper.equals("B") || upper.equals("1")) return 1;
        if (upper.equals("C") || upper.equals("2")) return 2;
        if (upper.equals("D") || upper.equals("3")) return 3;
        try {
            return Integer.parseInt(upper);
        } catch (NumberFormatException e) {
            return 0;
        }
    }
    
    private QuizDto mapToDto(Quiz quiz) {
        // Map quiz questions to DTO
        List<QuizQuestionDto> questionDtos = new ArrayList<>();
        if (quiz.getQuestions() != null) {
            for (QuizQuestion q : quiz.getQuestions()) {
                QuizQuestionDto qdto = QuizQuestionDto.builder()
                    .id(q.getId())
                    .questionText(q.getQuestionText())
                    .questionType(q.getQuestionType() != null ? q.getQuestionType() : "MULTIPLE_CHOICE")
                    .optionA(q.getOptionA())
                    .optionB(q.getOptionB())
                    .optionC(q.getOptionC())
                    .optionD(q.getOptionD())
                    .correctAnswer(q.getCorrectAnswer())
                    .marks(q.getMarks())
                    .explanation(q.getExplanation())
                    .displayOrder(q.getDisplayOrder())
                    .build();
                questionDtos.add(qdto);
            }
        }
        
        return QuizDto.builder()
                .id(quiz.getId())
                .courseId(quiz.getCourse().getId())
                .courseName(quiz.getCourse().getName())
                .moduleId(quiz.getModule() != null ? quiz.getModule().getId() : null)
                .moduleTitle(quiz.getModule() != null ? quiz.getModule().getTitle() : null)
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .quizType(quiz.getQuizType())
                .totalQuestions(quiz.getTotalQuestions())
                .totalMarks(quiz.getTotalMarks())
                .passingScore(quiz.getPassingScore())
                .durationMinutes(quiz.getDurationMinutes())
                .maxAttempts(quiz.getMaxAttempts())
                .randomizeQuestions(quiz.getRandomizeQuestions())
                .showCorrectAnswers(quiz.getShowCorrectAnswers())
                .isActive(quiz.getIsActive())
                .dueDate(quiz.getDueDate())
                .isFinalExam(quiz.getIsFinalExam())
                .requiredModuleIds(new ArrayList<>()) // Empty list since we removed this feature
                .requiredModuleTitles(new ArrayList<>()) // Empty list since we removed this feature
                .questions(questionDtos)
                .build();
    }

    private QuizAttemptDto mapAttemptToDto(QuizAttempt attempt) {
        return QuizAttemptDto.builder()
                .id(attempt.getId())
                .quizId(attempt.getQuiz().getId())
                .quizTitle(attempt.getQuiz().getTitle())
                .userId(attempt.getUser().getId())
                .userName(attempt.getUser().getFullName())
                .enrollmentId(attempt.getEnrollment() != null ? attempt.getEnrollment().getId() : null)
                .attemptNumber(attempt.getAttemptNumber())
                .score(attempt.getScore())
                .totalMarks(attempt.getTotalMarks())
                .obtainedMarks(attempt.getObtainedMarks())
                .passed(attempt.getPassed())
                .startedAt(attempt.getStartedAt())
                .submittedAt(attempt.getSubmittedAt())
                .timeTakenMinutes(attempt.getTimeTakenMinutes())
                .status(attempt.getStatus())
                .build();
    }
}
