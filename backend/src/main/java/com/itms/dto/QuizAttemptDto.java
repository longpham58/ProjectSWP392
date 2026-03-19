package com.itms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAttemptDto {
    private Integer id;
    private Integer quizId;
    private String quizTitle;
    private Integer userId;
    private String userName;
    private Integer enrollmentId;
    private Integer attemptNumber;
    private BigDecimal score;
    private BigDecimal totalMarks;
    private BigDecimal obtainedMarks;
    private Boolean passed;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Integer timeTakenMinutes;
    private String status;
    private List<QuizAnswerDto> answers;
    private Integer courseProgress; // overall course progress after this attempt

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public class QuizAnswerDto {
        private Integer questionId;
        private Integer selectedAnswerIndex;
        private Boolean isCorrect;
        private BigDecimal marksObtained;
    }
}

