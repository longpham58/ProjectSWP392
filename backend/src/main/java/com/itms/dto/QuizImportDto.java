package com.itms.dto;

import lombok.Data;

import java.util.List;

@Data
public class QuizImportDto {
    private String quizTitle;
    private String description;
    private String quizType;
    private Integer durationMinutes;
    private Integer maxAttempts;
    private Double passingScore;
    private Boolean randomizeQuestions;
    private Boolean showCorrectAnswers;
    private List<QuizQuestionImportDto> questions;
}