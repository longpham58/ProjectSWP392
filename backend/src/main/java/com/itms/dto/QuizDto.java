package com.itms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizDto {
    private Integer id;
    private Integer courseId;
    private String courseName;
    private Integer moduleId;
    private String moduleTitle;
    private String title;
    private String description;
    private String quizType;
    private Integer totalQuestions;
    private BigDecimal totalMarks;
    private BigDecimal passingScore;
    private Integer durationMinutes;
    private Integer maxAttempts;
    private Boolean randomizeQuestions;
    private Boolean showCorrectAnswers;
    private Boolean isActive;
    private LocalDate dueDate;
    private Boolean isFinalExam;
    private List<QuizQuestionDto> questions;
    private Boolean isUnlocked;
    private Integer attemptsCount;
    private Boolean hasPassed;
    private List<Integer> requiredModuleIds;
    private List<String> requiredModuleTitles;
}

