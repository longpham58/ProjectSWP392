package com.itms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

// Request DTO for submitting quiz
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizSubmitRequest {
    private Integer quizId;
    private Integer userId;
    private Integer enrollmentId;
    private List<QuizAttemptDto.QuizAnswerDto> answers;
    private Integer timeTakenMinutes;
}
