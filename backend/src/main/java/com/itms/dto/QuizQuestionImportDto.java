package com.itms.dto;

import lombok.Data;

@Data
public class QuizQuestionImportDto {
    private String questionText;
    private String questionType;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String correctAnswer;
    private Integer marks;
    private String explanation;
    private Integer displayOrder;
}