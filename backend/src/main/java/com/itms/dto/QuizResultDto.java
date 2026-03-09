package com.itms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

// Response DTO for quiz result
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizResultDto {
    private Integer attemptId;
    private BigDecimal score;
    private BigDecimal totalMarks;
    private BigDecimal obtainedMarks;
    private Boolean passed;
    private Integer attemptNumber;
    private String message;
    private List<QuestionResultDto> questionResults;
}
