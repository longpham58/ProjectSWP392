package com.itms.service;

import com.itms.dto.QuizAttemptDto;
import com.itms.dto.QuizDto;
import com.itms.entity.Quiz;
import com.itms.entity.QuizAttempt;
import com.itms.entity.User;
import com.itms.entity.UserModuleProgress;
import com.itms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final UserModuleProgressRepository moduleProgressRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    /**
     * Get all quizzes for a course
     */
    public List<QuizDto> getQuizzesByCourse(Integer courseId, Integer userId) {
        List<Quiz> quizzes = quizRepository.findByCourseIdAndQuizTypeIn(courseId);
        List<QuizDto> quizDtos = new ArrayList<>();

        for (Quiz quiz : quizzes) {
            QuizDto dto = mapToDto(quiz);
            
            // Check if quiz is unlocked (module completed)
            if (quiz.getModule() != null) {
                boolean isUnlocked = isModuleCompleted(userId, quiz.getModule().getId());
                dto.setIsUnlocked(isUnlocked);
            } else {
                dto.setIsUnlocked(true); // No module requirement
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

        // Check unlock status
        if (quiz.getModule() != null) {
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

        // Create new attempt
        QuizAttempt attempt = QuizAttempt.builder()
                .quiz(quiz)
                .user(user)
                .enrollment(enrollmentRepository.findById(enrollmentId).orElse(null))
                .attemptNumber(attemptNumber)
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

    private QuizDto mapToDto(Quiz quiz) {
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
