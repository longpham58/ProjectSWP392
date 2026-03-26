package com.itms.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificateDto {

    private Integer id;
    private Integer courseId;
    private String courseName;
    private String courseCategory;
    private String studentName;
    private String trainerName;
    private String certificateCode;
    private LocalDate completionDate;
    private LocalDate issueDate;
    private String grade;
    private Double score;
    private String instructor;
    private String certificateUrl;
    private Boolean isValid;
}