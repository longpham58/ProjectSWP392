package com.itms.service;

import com.itms.dto.QuizAttemptDto;
import com.itms.dto.QuizDto;
import com.itms.dto.QuizQuestionDto;
import com.itms.entity.*;
import com.itms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final QuizRequiredModuleRepository quizRequiredModuleRepository;
    private final CourseModuleRepository courseModuleRepository;

    /**
     * Get all quizzes for a course
     */
    public List<QuizDto> getQuizzesByCourse(Integer courseId, Integer userId) {
        List<Quiz> quizzes = quizRepository.findByCourseIdAndQuizTypeIn(courseId);
        List<QuizDto> quizDtos = new ArrayList<>();

        for (Quiz quiz : quizzes) {
            QuizDto dto = mapToDto(quiz);
            
            // Check if quiz is unlocked based on ANY required module completed (OR logic)
            // First check if quiz has any required modules in Quiz_Required_Modules table
            List<Integer> requiredModuleIds = quizRequiredModuleRepository.findModuleIdsByQuizId(quiz.getId());
            
            if (!requiredModuleIds.isEmpty()) {
                // Quiz has required modules - check if ALL are completed (AND logic)
                boolean isUnlocked = areAllRequiredModulesCompleted(userId, requiredModuleIds);
                dto.setIsUnlocked(isUnlocked);
            } else if (quiz.getModule() != null) {
                // Fallback to legacy single module field
                boolean isUnlocked = isModuleCompleted(userId, quiz.getModule().getId());
                dto.setIsUnlocked(isUnlocked);
            } else {
                // No module requirement - quiz is always unlocked
                dto.setIsUnlocked(true);
            }

            // Get attempt count and pass status
            List<QuizAttempt> attempts = quizAttemptRepository.findByQuizIdAndUserId(quiz.getId(), userId);
            dto.setAttemptsCount(attempts.size());
            dto.setHasPassed(attempts.stream().anyMatch(QuizAttempt::getPassed));

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

        QuizDto dto = mapToDto(quiz);

        // Check unlock status - check required modules first
        List<Integer> requiredModuleIds = quizRequiredModuleRepository.findModuleIdsByQuizId(quiz.getId());
        
        if (!requiredModuleIds.isEmpty()) {
            dto.setIsUnlocked(areAllRequiredModulesCompleted(userId, requiredModuleIds));
        } else if (quiz.getModule() != null) {
            dto.setIsUnlocked(isModuleCompleted(userId, quiz.getModule().getId()));
        } else {
            dto.setIsUnlocked(true);
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

        // Calculate score
        int correctAnswers = 0;
        BigDecimal totalMarksObtained = BigDecimal.ZERO;

        for (QuizAttemptDto.QuizAnswerDto answer : answers) {
            // In a real system, we'd have quiz questions stored in DB
            // For now, we'll calculate based on simple logic
            if (answer.getIsCorrect() != null && answer.getIsCorrect()) {
                correctAnswers++;
            }
        }

        // Calculate percentage
        BigDecimal score = BigDecimal.valueOf(correctAnswers)
                .divide(BigDecimal.valueOf(answers.size()), 2, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        boolean passed = score.compareTo(quiz.getPassingScore()) >= 0;

        // Update attempt
        attempt.setScore(score);
        attempt.setTotalMarks(quiz.getTotalMarks());
        attempt.setObtainedMarks(totalMarksObtained);
        attempt.setPassed(passed);
        attempt.setSubmittedAt(LocalDateTime.now());
        attempt.setTimeTakenMinutes(timeTakenMinutes);
        attempt.setStatus(passed ? "GRADED" : "SUBMITTED");

        attempt = quizAttemptRepository.save(attempt);

        return mapAttemptToDto(attempt);
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
        
        // Calculate which quizzes are unlocked based on required modules
        List<QuizDto> quizDtos = new ArrayList<>();
        int unlockedQuizCount = 0;
        
        for (Quiz quiz : quizzes) {
            QuizDto dto = mapToDto(quiz);
            
            // Check unlock based on required modules
            List<Integer> requiredModuleIds = quizRequiredModuleRepository.findModuleIdsByQuizId(quiz.getId());
            
            if (!requiredModuleIds.isEmpty()) {
                dto.setIsUnlocked(areAllRequiredModulesCompleted(userId, requiredModuleIds));
            } else if (quiz.getModule() != null) {
                dto.setIsUnlocked(isModuleCompleted(userId, quiz.getModule().getId()));
            } else {
                dto.setIsUnlocked(true);
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
        status.put("unlockedQuizCount", unlockedQuizCount);
        
        // Calculate test passing requirements
        // Default values if no quizzes exist
        BigDecimal testPassingScore;
        Integer testMaxAttempts = 3;
        
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
        
        // Final exam unlocks after earning certificate
        // Find final exam quiz
        Quiz finalExam = quizzes.stream()
            .filter(q -> q.getIsFinalExam() != null && q.getIsFinalExam())
            .findFirst()
            .orElse(null);
        
        boolean finalExamUnlocked = false;
        if (finalExam != null) {
            // Check if final exam has required modules
            List<Integer> finalExamRequiredModules = quizRequiredModuleRepository.findModuleIdsByQuizId(finalExam.getId());
            
            if (!finalExamRequiredModules.isEmpty()) {
                finalExamUnlocked = certificateEarned && areAllRequiredModulesCompleted(userId, finalExamRequiredModules);
            } else if (finalExam.getModule() != null) {
                finalExamUnlocked = certificateEarned && isModuleCompleted(userId, finalExam.getModule().getId());
            } else {
                // Final exam without module requirement - just needs certificate
                finalExamUnlocked = certificateEarned;
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
        // Get required module IDs
        List<Integer> requiredModuleIds = quizRequiredModuleRepository.findModuleIdsByQuizId(quiz.getId());
        
        // Get required module titles
        List<String> requiredModuleTitles = new ArrayList<>();
        if (!requiredModuleIds.isEmpty()) {
            for (Integer moduleId : requiredModuleIds) {
                courseModuleRepository.findById(moduleId).ifPresent(m -> requiredModuleTitles.add(m.getTitle()));
            }
        }
        
        // Map quiz questions to DTO
        List<QuizQuestionDto> questionDtos = new ArrayList<>();
        if (quiz.getQuestions() != null) {
            for (QuizQuestion q : quiz.getQuestions()) {
                QuizQuestionDto qdto = QuizQuestionDto.builder()
                    .id(q.getId())
                    .questionText(q.getQuestionText())
                    .questionType("SINGLE_CHOICE")
                    .options(Arrays.asList(q.getOptionA(), q.getOptionB(), q.getOptionC(), q.getOptionD()))
                    .correctAnswerIndex(q.getCorrectAnswer() != null ? convertAnswerToIndex(q.getCorrectAnswer()) : 0)
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
                .requiredModuleIds(requiredModuleIds)
                .requiredModuleTitles(requiredModuleTitles)
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
