package com.itms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionResultDto {
    private Integer questionId;
    private String questionText;
    private Integer selectedAnswerIndex;
    private Integer correctAnswerIndex;
    private Boolean isCorrect;
    private BigDecimal marksObtained;
}
