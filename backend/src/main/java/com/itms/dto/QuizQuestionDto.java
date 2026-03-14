package com.itms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizQuestionDto {
    private Integer id;
    private String questionText;
    private String questionType;
    private List<String> options;
    private Integer correctAnswerIndex;
}
